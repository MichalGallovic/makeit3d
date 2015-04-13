<?php namespace App\Octoprint;

use App\Octoprint\Exceptions\NameNotSpecifiedException;
use App\Octoprint\Exceptions\OctoprintException;
use App\Octoprint\Exceptions\TTLExceededException;
use Config;
use GuzzleHttp\Client;
use File;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Post\PostFile;
use Illuminate\Filesystem\FileNotFoundException;
use Symfony\Component\HttpKernel\Exception\UnsupportedMediaTypeHttpException;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use App\Octoprint\Exceptions\FileNotFoundException as OctoprintFileNotFoundException;
use Log;
use Illuminate\Support\Collection;

class Octoprint {

    protected $api_key;

    protected $client;

    protected $root_url;

    protected $endpoint;

    protected $response;

    protected $fileName;

    protected $location;

    protected $namespace;

    public $statusCode;

    const TTL = 10;
    const SLICE_TTL = 60;
    const FILE_CREATED = 201;
    const NOT_FOUND = 404;
    public function __construct($api_key = null) {
        $this->api_key = $this->api_key($api_key);
        $this->client = new Client();

        $this->root_url = $this->getRootApiUrl();


    }


    public function files() {
        $this->endpoint = "/files";
        $this->namespace = "files";
        return $this;
    }

    public function localFile($name) {
        $this->files()->local()->file($name);

        return $this;
    }

    protected function local() {
        $this->location = "local";
        $this->endpoint .= "/local";
        return $this;
    }

    protected function file($name) {
        if(!$name)
            throw new NameNotSpecifiedException("Name of the file not specified");

        $this->endpoint .= "/".$name;
        $this->fileName = $name;
        return $this;
    }

    public function get() {
        $endpointUrl = $this->getEndpointUrl();

        $response = $this->client->get($endpointUrl,["headers"=>[
            "X-Api-Key" =>  $this->api_key
        ]]);

        $this->parseResponse($response);

        return $response->json();
    }

    public function forceGcodeAnalysis() {
        $endpointUrl = $this->getEndpointUrl();
        $testResponse = [];

        $totalWaiting = 0;
        while(!isset($testResponse['gcodeAnalysis'])) {
            sleep(1);
            $totalWaiting += 1;
            Log::info($totalWaiting);
            if ($totalWaiting > self::TTL * 2)
                throw new TTLExceededException("TTL for gcodeAnalysis exceeded " . (self::TTL * 2) . " seconds. Endpoint:" . $endpointUrl);

            $response = $this->client->get($endpointUrl, ["headers" => [
                "X-Api-Key" => $this->api_key
            ]]);
            $testResponse = $response->json();
        }

        $this->parseResponse($response);

        return $response->json();
    }


    public function getFilesCollection($items) {
        $collection = new Collection();
        foreach($items as $item) {
            $model = new OctoprintGcodeModel($item);
            $collection->push($model);
        }

        return $collection;
    }

    public function getCollection() {
        $items = $this->get();

        $collection = new Collection();

        switch($this->namespace) {
            case "files": {
                $collection = $this->getFilesCollection($items[$this->namespace]);
            }
        }

        return $collection;
    }

    public function upload() {
        $this->files()->local();
        $endpointUrl = $this->getEndpointUrl();
        $path = $this->fileName;
        $this->fileName = pathinfo($this->fileName,PATHINFO_BASENAME);

        if(!File::exists($path))
            throw new FileNotFoundException($path);


        $fileContent = File::get($path);

        $response = $this->client->post($endpointUrl,[
           'body'   =>  [
               'file' =>  fopen($path,'r')
           ],
           'headers'=>  [
               "X-Api-Key"  =>  $this->api_key
           ]
        ]);

        $this->parseResponse($response);

        if($this->statusCode != self::FILE_CREATED)
            throw new UnsupportedMediaTypeHttpException;

        $responseData = $response->json();
        $extension =  pathinfo($this->fileName, PATHINFO_EXTENSION);


        if($extension == "stl") {
            return new OctoprintGcodeModel($this->slice($responseData));
        }


        return new OctoprintGcodeModel($this->localFile($this->fileName)->forceGcodeAnalysis());
    }



    public function slice($responseData) {

        $this->waitUntilDone($responseData);

        $sliceUrl = $responseData['files'][$this->location]["refs"]["resource"];

        try {
            $response = $this->client->post($sliceUrl,[
                "headers"   =>  [
                    "X-Api-Key"  =>  $this->api_key
                ],
                "json"  =>  ["command"   =>  "slice"]
            ]);

        } catch(ClientException $e) {
            $this->parseResponse($e->getResponse());

            $this->errorWithFileNoutFound($e->getMessage());
        }


        $gcodeResourceUrl = $response->json()['refs']['resource'];

        $response = $this->getSlicedResponse($gcodeResourceUrl);

        // make sure it was processed and gcodeanalysis is included
        if(!isset($response->json()['gcodeAnalysis'])) {
            $fileName = pathinfo($response->json()['refs']['resource']);
            $response = $this->localFile($fileName)->forceGcodeAnalysis();
        }

        return $response->json();

    }

    protected function errorWithFileNoutFound($response, $message = "") {
        if($response->getStatusCode() == self::NOT_FOUND)
            throw new OctoprintFileNotFoundException($message);
    }

    protected function getSlicedResponse($futureGcodeUrl) {
        return $this->waitUntilSliced($futureGcodeUrl);
    }

    protected function isWithGcodeAnalysis($responseData) {
        if(!isset($responseData["gcodeAnalysis"]))
            return false;

        return true;
    }

    protected function waitUntilSliced($futureGcodeUrl, $totalWaiting = 0) {
        if($totalWaiting > self::SLICE_TTL)
            throw new TTLExceededException("Waited longer than".self::SLICE_TTL.". Possible slicing error occured.");

        $response = null;

        try {
            $response = $this->client->get($futureGcodeUrl,[
                "headers"   =>   [
                    "X-Api-Key" =>  $this->api_key
                ]
            ]);


        } catch(ClientException $e) {
            if($e->getResponse()->getStatusCode() == self::NOT_FOUND) {
                sleep(1);
                $totalWaiting += 1;
                return $this->waitUntilSliced($futureGcodeUrl, $totalWaiting);
            } else {
                throw new OctoprintException($e->getMessage());
            }
        }

        return $response;
    }

    protected function waitUntilDone($responseData, $totalWaiting = 0) {
        if($totalWaiting > self::TTL)
            throw new TTLExceededException("Waited longer than".self::TTL);

        if(!$responseData['done']) {
            sleep(0.1);
            $totalWaiting += 0.1;
            return $this->waitUntilDone($responseData, $totalWaiting);
        }
    }

    protected function parseResponse($response) {
        $this->response = $response;
        $this->statusCode = $response->getStatusCode();
    }

    protected function getEndpointUrl() {
        return $this->root_url.$this->endpoint;
    }

    protected function api_key($api_key) {
        if(!$api_key)
            $api_key = Config::get('services.octoprint.api_key');

        if(!$api_key){}
        //@TODO request session api key for registered backend app

        return $api_key;
    }

    protected function getRootApiUrl() {
        $root_url = "";
        $domain_root = str_replace("http://","",url());
        $root_url = $domain_root;

        $api_root_prefix = Config::get('services.octoprint.root_prefix');

        if($api_root_prefix)
            $root_url = $api_root_prefix.".".$domain_root;

        $root_url = "http://".$root_url.'/api';

        return $root_url;

    }
}
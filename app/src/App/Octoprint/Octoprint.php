<?php namespace App\Octoprint;

use App\Octoprint\Exceptions\NameNotSpecifiedException;
use Config;
use GuzzleHttp\Client;
use File;
use GuzzleHttp\Post\PostFile;
use Illuminate\Filesystem\FileNotFoundException;

class Octoprint {

    protected $api_key;

    protected $client;

    protected $root_url;

    protected $endpoint;

    protected $response;

    protected $fileName;

    public $statusCode;

    public function __construct($api_key = null) {
        $this->api_key = $this->api_key($api_key);
        $this->client = new Client();

        $this->root_url = $this->getRootApiUrl();


    }


    public function files() {
        $this->endpoint = "/files";
        return $this;
    }

    public function localFile($name) {
        $this->files()->local()->file($name);

        return $this;
    }

    protected function local() {
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

    public function upload() {
        $this->files()->local();
        $endpointUrl = $this->getEndpointUrl();
        $path = $this->fileName;

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

        return $response->json();
    }

    public function uploadAndSlice() {
        $response = $this->upload();
        dd($response);

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
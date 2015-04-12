<?php namespace App\Octoprint;

use Config;
use GuzzleHttp\Client;

class Octoprint {

    protected $api_key;

    protected $client;

    public $root_url;

    public function __construct($api_key = null) {
        $this->api_key = $this->api_key($api_key);
        $this->client = new Client();

        $this->root_url = $this->getRootApiUrl();
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

        $root_url = "http://".$root_url;

    }
}
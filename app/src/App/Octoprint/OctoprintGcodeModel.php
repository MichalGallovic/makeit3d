<?php namespace App\Octoprint;

use Illuminate\Support\Collection;

class OctoprintGcodeModel
{
    public $name;
    public $stl_source_name;
    public $download_link;
    public $api_link;
    public $printing_time;
    public $filament_length;
    public $filament_volume;
    protected $data;

    public function __construct($response = [])
    {
        $this->data = json_decode(json_encode($response, FALSE));
        $this->setParams();
    }

    public function setParams()
    {
        $this->name = $this->data->name;
        $this->parseLinks();
        $this->parseRefs();
        $this->parseGcodeAnalysis();
    }

    protected function parseLinks()
    {
        if (!isset($this->data->links))
            return;

        $links = $this->data->links;
        if (!is_array($links))
            return;

        if (empty($links))
            return;

        foreach ($links as $link) {
            if (pathinfo($link->name, PATHINFO_EXTENSION) == "stl") {
                $this->stl_source_name = $link->name;
                break;
            }
        }
    }

    protected function parseRefs()
    {
        if (!isset($this->data->refs))
            return;

        $this->download_link = $this->data->refs->download;
        $this->api_link = $this->data->refs->resource;
    }

    protected function parseGcodeAnalysis() {
        if(!isset($this->data->gcodeAnalysis))
            return;

        $gcodeAnalysis = $this->data->gcodeAnalysis;

        $this->printing_time = $gcodeAnalysis->estimatedPrintTime;

        if($this->objEmpty($gcodeAnalysis->filament))
           return;

        $this->filament_volume = $gcodeAnalysis->filament->tool0->volume;
        $this->filament_length = $gcodeAnalysis->filament->tool0->length;
    }

    protected function getSafeFromArr($arr, $property) {
        return isset($arr[$property]) ? $arr[$property] : "";
    }

    //#### PRIVATE METHODS

    protected function objEmpty($obj) {
        $arr = (array)$obj;
        return empty($arr);
    }
}
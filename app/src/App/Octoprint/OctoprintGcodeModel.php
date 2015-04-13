<?php namespace App\Octoprint;

use Illuminate\Support\Collection;

class OctoprintGcodeModel
{
    public $name_gcode;
    public $name_stl;
    public $download_link_stl;
    public $download_link_gcode;
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
        $this->name_gcode = $this->data->name;
        $this->parseLinks();
        $this->parseRefs();
        $this->parseGcodeAnalysis();

        if(isset($this->name_stl))
            $this->download_link_stl = str_replace($this->name_gcode,$this->name_stl,$this->download_link_gcode);
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
                $this->name_stl = $link->name;
                break;
            }
        }


    }

    protected function parseRefs()
    {
        if (!isset($this->data->refs))
            return;

        $this->download_link_gcode = $this->data->refs->download;
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
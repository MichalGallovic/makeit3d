<?php namespace App\Transformer;

use Model;
use League\Fractal\TransformerAbstract;
use App\Transformer\CategoryTransformer;

class ModelTransformer extends TransformerAbstract {

    protected $availableIncludes = [
        'category'
    ];

    public function transform(Model $model) {
        return [
            'id'                =>  (int) $model->id,
            'name'              =>  $model->name,
            'price'             =>  (float) $model->price,
            'image_url'         =>  $model->image_url,
            'printing_time'     =>  (float) $model->printing_time,
            'filament_length'   =>  (float) $model->filament_length,
            'filament_volume'   =>  (float) $model->filament_volume,
            'download_link'     =>  $model->gcode_download_link
        ];
    }

    public function includeCategory(Model $model) {
        $category = $model->category;

        return $this->item($category, new CategoryTransformer);
    }
}

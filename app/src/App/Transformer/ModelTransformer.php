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
            'visible'           =>  (int) $model->visible,
            'price'             =>  (float) $model->price,
            'image_url'         =>  $model->image_url,
            'printing_time'     =>  (float) $model->printing_time,
            'filament_length'   =>  (float) $model->filament_length,
            'filament_volume'   =>  (float) $model->filament_volume,
            'download_link_gcode'     =>  $model->download_link_gcode,
            'download_link_stl' =>  $model->download_link_stl,
            'deleted'   =>  $model->trashed(),
            'category'  =>  (int) isset($model->category->id) ? $model->category->id : null,
            'created_by'        =>  $model->createdBy->id,
            'created'   => $model->created_at->format('m-d-Y H:i:s')
        ];
    }

    public function includeCategory(Model $model) {
        $category = $model->category;
        if($category)
            return $this->item($category, new CategoryTransformer);

    }
}

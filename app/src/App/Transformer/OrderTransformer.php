<?php namespace App\Transformer;

use Model;
use League\Fractal\TransformerAbstract;

class ModelTransformer extends TransformerAbstract {

    public function transform(Model $model) {
        return [
            'id'            =>  (int) $model->id,
            'name'          =>  $model->name,
            'price'         =>  (float) $model->price,
            'image_url'     =>  $model->image_url,
            'category'      =>  'TODO NESTED RELATIONSHIP',
            'printing_time' =>  (int) $model->printing_time
        ];
    }
}

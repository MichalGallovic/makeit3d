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
            'id'            =>  (int) $model->id,
            'name'          =>  $model->name,
            'price'         =>  (float) $model->price,
            'image_url'     =>  $model->image_url,
            'printing_time' =>  (int) $model->printing_time
        ];
    }

    public function includeCategory(Model $model) {
        $category = $model->category;

        return $this->item($category, new CategoryTransformer);
    }
}

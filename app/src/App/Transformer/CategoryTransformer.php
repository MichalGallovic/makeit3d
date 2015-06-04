<?php namespace App\Transformer;

use Category;
use League\Fractal\TransformerAbstract;
use App\Transformer\ModelTransformer;

class CategoryTransformer extends TransformerAbstract {

    protected $availableIncludes = [
        'models'
    ];

    public function transform(Category $category) {

        return [
            'id'            =>  (int) $category->id,
            'name'          =>  $category->name,
            'image_url'     =>  $category->image_url,
            'model_count'   =>  count($category->models),
            'deleted'       =>  $category->trashed()
        ];
    }

    public function includeModels(Category $category) {
        $models = $category->models;

        return $this->collection($models, new ModelTransformer);
    }
}

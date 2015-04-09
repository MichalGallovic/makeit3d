<?php namespace App\Transformer;

use Category;
use League\Fractal\TransformerAbstract;

class CategoryTransformer extends TransformerAbstract {

    public function transform(Category $category) {

        return [
            'id'            =>  (int) $category->id,
            'name'          =>  $category->name,
            'image_url'     =>  $category->image_url
        ];
    }
}

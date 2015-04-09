<?php

use App\Transformer\CategoryTransformer;

class CategoryController extends ApiController {

	/**
	 * Display a listing of the resource.
	 * GET /category
	 *
	 * @return Response
	 */
	public function index()
	{
        $categories = Category::all();

        return $this->respondWithCollection($categories, new CategoryTransformer);

	}

	public function show($id) {
        $category = Category::find($id);

        if(!$category) {
            return $this->errorNotFound('Sorry, this category does not exist man...');
        }

        return $this->respondWithItem($category, new CategoryTransformer);
    }

}
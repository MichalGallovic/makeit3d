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

        return $this->respondWithCollection($categories, new CategoryTransformer, 'categories');

	}

	public function show($id) {
        $category = Category::find($id);

        if(!$category) {
            return $this->errorNotFound('Sorry, this category does not exist man...');
        }

        return $this->respondWithItem($category, new CategoryTransformer, 'category');
    }

    public function edit($id) {
        $category = Category::find($id);

        if(!$category) {
            return $this->errorNotFound('Sorry, this category does not exist man...');
        }

        $input = Input::only(['name', 'image_url']);

        $category->fill($input);
        $category->save();

        return $this->respondWithSuccess('Category edited successfully!');
    }

    public function destroy($id) {
        $category = Category::find($id);

        if(!$category) {
            return $this->errorNotFound('Sorry, this category does not exist....');
        }

        if($category->delete()) {
            return $this->respondWithSuccess('Category deleted successfully.');
        }

        return $this->errorInternalError('Sth went wrong while deleting Category.');
    }

}
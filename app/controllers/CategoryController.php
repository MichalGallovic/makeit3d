<?php

use App\Transformer\CategoryTransformer;
use Illuminate\Support\Arr;

class CategoryController extends ApiController {

	/**
	 * Display a listing of the resource.
	 * GET /category
	 *
	 * @return Response
	 */
	public function index()
	{
        if(Request::header('requested-with') == 'ember')
            $categories = Category::withTrashed()->get();
        else
            $categories = Category::all();

        return $this->respondWithCollection($categories, new CategoryTransformer, 'categories');

	}

	public function show($id) {
        if(Request::header('requested-with') == 'ember')
            $category = Category::withTrashed()->find($id);
        else
            $category = Category::find($id);

        if(!$category) {
            return $this->errorNotFound('Sorry, this category does not exist man...');
        }

        return $this->respondWithItem($category, new CategoryTransformer, 'category');
    }

    public function update($id) {
        $category = Category::withTrashed()->find($id);

        if(!$category) {
            return $this->errorNotFound('Sorry, this category does not exist man...');
        }

        $input = Input::get('category');
        $input = Arr::only($input,['name','image_url']);

        $category->fill($input);
        $category->save();

        if(Input::get('category.deleted') == false)
            $category->restore();


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
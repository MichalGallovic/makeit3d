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

        $deleteAbsolutely = Input::get('forceDelete');
        if($deleteAbsolutely) {
            $category->forceDelete();
            return $this->respondWithSuccess('Category deleted successfully.');
        }
        else if($category->delete()) {
            return $this->respondWithSuccess('Category deleted successfully.');
        }

        return $this->errorInternalError('Sth went wrong while deleting Category.');
    }

    public function create() {
        $input = Input::get('category');

        $rules = [
            'name'  =>  'required',
            'image_url' =>  'required'
        ];

        $validation = Validator::make($input, $rules);

        if($validation->fails())
            return $this->errorWrongArgs($validation->messages()->first());

        $category = new Category;
        $category->name = $input['name'];
        $category->image_url = $input['image_url'];
        $category->save();

        return $this->respondWithCreated($category, new CategoryTransformer, 'category');
    }

    public function uploadImage() {
        if(Input::hasFile('image')) {
            $image = Input::file('image');
            $filename  = time() . '.' . $image->getClientOriginalExtension();
            $path = public_path('images/categories/' . $filename);
            $img = Image::make($image)->resize(800, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            })->save($path);
            $response = array(
                "status" => 'success',
                "image_url" => asset('images/categories')."/".$filename,
            );
            $status = 200;
        } else {
            $response = array(
                "status" => 'error'
            );
            $status = 400;
        }

        return Response::json($response, $status);
    }

}
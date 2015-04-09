<?php

use App\Transformer\ModelTransformer;

class ModelController extends ApiController {

	public function index()
	{
        $models = Model::all();

        return $this->respondWithCollection($models, new ModelTransformer);
	}


	public function show($id)
	{
        $model = Model::find($id);

        if(!$model) {
            return $this->errorNotFound('Oh, no such models man, sorry...');
        }

        return $this->respondWithItem($model, new ModelTransformer);
	}

    public function recentlyPrinted() {
        $recently_printed = DB::table('printed_models')->orderBy('created_at', 'desc')->take(12)->lists('model_id');
        $models = Model::find($recently_printed);

        return $this->respondWithCollection($models, new ModelTransformer);

    }


}
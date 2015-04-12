<?php

use App\Transformer\ModelTransformer;
use League\Fractal\Manager;
use App\Repositories\DbUserRepository;

class ModelController extends ApiController {

    protected $tokenController;
    protected $userRepo;

    const MODEL_DEFAULT_IMAGE = 'assets/images/models/default.png';

    public function __construct(Manager $manager,  DbUserRepository $userRepo) {
        parent::__construct($manager);

        $this->userRepo = $userRepo;
    }

	public function index()
	{
        $models = Model::all();

        return $this->respondWithCollection($models, new ModelTransformer);
	}


	public function show($id)
	{
        $ids = explode(',', $id);

        $model = Model::find($ids);
        if(!$model) {
            return $this->errorNotFound('Oh, no such models man, sorry...');
        }
        if($model->count() == 1)
            return $this->respondWithItem($model->first(), new ModelTransformer);

        return $this->respondWithCollection($model, new ModelTransformer);
	}

    public function create() {
        $user = $this->userRepo->getCurrentUser();
        $input = Input::only(['name','model']);

        $rules = [
            "model" => "required"
        ];

        $validator = Validator::make($input, $rules);

        if($validator->fails())
            return $this->errorWrongArgs($validator->messages()->first());

        $file = $input['model'];

        $extension = $file->getClientOriginalExtension();
        if(!$this->isValidType($extension))
            return $this->errorWrongArgs("Wrong file type. Please use .stl or .gcode files only");

        $fileName = isset($input['name']) ? $input['name'].".".$extension : $file->getClientOriginalName();

        $path = public_path()."/storage/models/";

        $timePrefix = time();
        try {
            $file->move($path,$timePrefix."_".$fileName);
        } catch(Exception $e) {
            return $this->errorInternalError("API error - uploading file. Contact admin at admin@makeit3d.rocks");
        }

        $model = new Model;
        $model->name = str_replace(".".$extension,"",$fileName);
        $model->file_path = "/storage/models/".$timePrefix."_".$fileName;
        $model->image_url = asset(self::MODEL_DEFAULT_IMAGE);
        $model->visible = 0;
        $model->save();


        switch($extension) {
            case "gco":
            case "gcode": {
                break;
            }
            case "stl": {
                break;
            }


        }
        // if gcode
        // upload to octoprint.makeit3d.dev/api/files/local
        // if done = true -> OK
        // else try reupload -> if error, throw 500 with message
        //
        // if OK -> GET files->local->refs->resource -> to get printing time & price & volume & length
        // update model & send in response


        // if stl
        // upload to octoprint.makeit3d.dev/api/files/local
        // if done = true -> OK
        // else try reupload -> if error, throw 500 with message
        //
        // if OK -> POST files->local->refs->resource -> to slice with CuraEngine
        // response refs->resouce

        return $this->respondWithItem($model, new ModelTransformer);
    }

    public function recentlyPrinted() {
        $recently_printed = DB::table('printed_models')->orderBy('created_at', 'desc')->take(12)->lists('model_id');
        $models = Model::find($recently_printed);

        return $this->respondWithCollection($models, new ModelTransformer);

    }


    //####### PRIVATE METHODS
    private function isValidType($fileExtension) {
        return in_array($fileExtension,["gcode","gco","stl"]);
    }


}
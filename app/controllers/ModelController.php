<?php

use App\Transformer\ModelTransformer;
use League\Fractal\Manager;
use App\Repositories\DbUserRepository;
use App\Octoprint\Octoprint;
use App\Facades\Search;

class ModelController extends ApiController {

    protected $tokenController;
    protected $userRepo;

    protected $octoprint;

    const MODEL_DEFAULT_IMAGE = 'assets/images/models/default.png';


    public function __construct(Manager $manager,  DbUserRepository $userRepo, Octoprint $octoprint) {
        parent::__construct($manager);

        $this->userRepo = $userRepo;
        $this->octoprint = $octoprint;
    }

	public function index()
	{
        if($search = Request::get('search'))
            $models = Search::models($search);
        else
            $models = Model::withTrashed()->get();

        return $this->respondWithCollection($models, new ModelTransformer,'models');
	}


	public function show($id)
	{
        $ids = explode(',', $id);

        $model = Model::withTrashed()->find($ids);

        if(!$model) {
            return $this->errorNotFound('Oh, no such models man, sorry...');
        }
        if($model->count() == 1)
            return $this->respondWithItem($model->first(), new ModelTransformer,'model');

        return $this->respondWithCollection($model, new ModelTransformer,'models');
	}

    public function update($id) {
        $model = Model::withTrashed()->find($id);

        if(!$model)
            return $this->errorNotFound('Model not found.');

        $input = Input::get('model');


        $rules = [
            'name'  =>  'required',
            'visible'   =>  'required',
            'price' =>  'required',
            'image_url' =>  'required',
            'created_by'    =>  'required'
        ];

        $validator = Validator::make($input,$rules);

        if($validator->fails())
            return $this->errorWrongArgs($validator->messages()->first());

        $model->name = $input['name'];
        $model->visible = $input['visible'];
        $model->price = $input['price'];
        $model->image_url = $input['image_url'];
        $model->created_by = (int) $input['created_by'];
        $model->download_link_gcode = isset($input['download_link_gcode']) ? $input['download_link_gcode'] : $model->download_link_gcode;
        $model->download_link_stl = isset($input['download_link_stl']) ? $input['download_link_stl'] : $model->download_link_stl;
        $model->printing_time = isset($input['printing_time']) ? $input['printing_time'] : $model->printing_time;
        $model->filament_length = isset($input['filament_length']) ? $input['filament_length'] : $model->filament_length;
        $model->filament_volume = isset($input['filament_volume']) ? $input['filament_volume'] : $model->filament_volume;
        $model->save();

        if(Input::get('model.deleted') == false)
            $model->restore();

        return $this->respondWithSuccess('Model updated successfully');
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
            return $this->errorWrongArgs("Wrong file type. Please use .stl files only");

        $fileName = str_replace(" ","_",$file->getClientOriginalName());
        $customFileName = isset($input['name']) ? $input['name'].".".$extension : $file->getClientOriginalName();
        $path = public_path()."/storage/models/";

        $timePrefix = time();
        try {
            $file->move($path,$timePrefix."_".$fileName);
        } catch(Exception $e) {
            return $this->errorInternalError("API error - uploading file. Contact admin at admin@makeit3d.rocks");
        }

        $model = new Model;
        $model->name = pathinfo($customFileName,PATHINFO_FILENAME);
        $model->image_url = asset(self::MODEL_DEFAULT_IMAGE);
        $model->visible = 0;
        $model->created_by = $user->id;
        $model->save();


        $path = public_path()."/storage/models/".$timePrefix."_".$fileName;

        $gcode = $this->octoprint->localFile($path)->upload();

        $model->printing_time = $gcode->printing_time;
        $model->filament_length = $gcode->filament_length;
        $model->filament_volume = $gcode->filament_volume;
        $model->price = $gcode->filament_length/100;
        $model->gcode_api = $gcode->api_link;
        $model->uploaded_file_link = $path.$timePrefix."_".$fileName;
        $model->download_link_gcode = $gcode->download_link_gcode;
        $model->download_link_stl = $gcode->download_link_stl;
        $model->save();


        return $this->respondWithItem($model, new ModelTransformer,'model');
    }

    public function recentlyPrinted() {
        $recently_printed = DB::table('printed_models')->orderBy('created_at', 'desc')->take(12)->lists('model_id');
        $models = Model::find($recently_printed);

        return $this->respondWithCollection($models, new ModelTransformer);

    }

    public function destroy($id) {
        $model = Model::find($id);

        if(!$model)
            return $this->errorNotFound("Model not found.");

        $model->delete();

        return $this->respondWithSuccess("Model deleted successfully");

    }

    public function printModel($id) {
        try {
            $model = Model::findOrFail($id);
            $name = $this->parseUrlToName($model->download_link_gcode);
            $this->octoprint->localFile($name)->printIt();
            Queue::push('App\Queue\Printer\MonitorPrinting',['model_name' => $name]);
            return $this->respondWithSuccess("Printing has started!");

        } catch(\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorNotFound("Model selected for printing, not found.");

        } catch(\App\Octoprint\Exceptions\PrinterNotConnectedException $e) {
                Queue::push('App\Queue\Printer\MonitorPrinting',['model_name'=>$name]);
                return $this->errorInternalError($e->getMessage());
        }
    }


    //####### PRIVATE METHODS
    private function isValidType($fileExtension) {
        return in_array($fileExtension,["stl"]);
    }

    private function parseUrlToName($url) {
        $segments = explode('/', $url);
        return $segments[count($segments) - 1];
    }


}
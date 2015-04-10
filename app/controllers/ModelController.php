<?php

use App\Transformer\ModelTransformer;
use League\Fractal\Manager;
use App\Repositories\DbUserRepository;


class ModelController extends ApiController {

    protected $tokenController;
    protected $userRepo;

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
        $model = Model::find($id);

        if(!$model) {
            return $this->errorNotFound('Oh, no such models man, sorry...');
        }

        return $this->respondWithItem($model, new ModelTransformer);
	}

    public function create() {
        $user = $this->userRepo->getCurrentUser();


    }

    public function recentlyPrinted() {
        $recently_printed = DB::table('printed_models')->orderBy('created_at', 'desc')->take(12)->lists('model_id');
        $models = Model::find($recently_printed);

        return $this->respondWithCollection($models, new ModelTransformer);

    }


}
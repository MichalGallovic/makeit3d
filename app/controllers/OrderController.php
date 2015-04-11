<?php

use App\Transformer\OrderTransformer;
use App\Repositories\DbUserRepository;

class OrderController extends ApiController {

    protected $userRepo;

	public function __construct(DbUserRepository $userRepo) {
        $this->userRepo = $userRepo;
    }


	public function index()
	{
        $orders = Order::all();

        return $this->respondWithCollection($orders, new OrderTransformer);
	}

	public function create() {
        $user = $this->userRepo->getCurrentUser();


    }




}
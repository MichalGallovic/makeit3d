<?php

use App\Transformer\OrderTransformer;

class OrderController extends ApiController {

	/**
	 * Display a listing of the resource.
	 * GET /order
	 *
	 * @return Response
	 */
	public function index()
	{
        $orders = Order::all();

        return $this->respondWithCollection($orders, new OrderTransformer);
	}

	public function show($id)
	{
		//
	}




}
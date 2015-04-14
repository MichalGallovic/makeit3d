<?php

use App\Transformer\OrderTransformer;
use App\Repositories\DbUserRepository;
use App\Repositories\DbOrderRepository;
use Bogardo\Mailgun\Facades\Mailgun;

class OrderController extends ApiController {

    protected $userRepo;

    protected $orderRepo;

	public function __construct(DbUserRepository $userRepo, DbOrderRepository $orderRepo) {
        $this->userRepo = $userRepo;
        $this->orderRepo = $orderRepo;
    }


	public function index()
	{
        $orders = Order::all();

        return $this->respondWithCollection($orders, new OrderTransformer);
	}

	public function create() {
        $user = $this->userRepo->getCurrentUser();

        $input = Input::only([
            'models',
            'first_name',
            'last_name',
            'street',
            'town',
            'country',
            'zip_code'
        ]);

        $rules = [
            'models'        =>  'required',
            'first_name'    =>  'required',
            'last_name'     =>  'required',
            'street'        =>  'required',
            'town'          =>  'required',
            'country'       =>  'required',
            'zip_code'       => 'required'
        ];

        $validator = Validator::make($input, $rules);

        if($validator->fails())
            return $this->errorWrongArgs($validator->messages()->first());
        if(!$this->areModelsValid($input['models']))
            return $this->errorWrongArgs("Invalid models. Format: comma separated values only numbers (i.e: 1,2,3,4)");

        $order = $this->orderRepo->createOrder($input,$user);

        Mail::send('emails.order.create',["order"   =>  $order], function($message) use ($order){
            $message->to($order->user->email)->subject("Order:#".$order->id);
        });
//        Mailgun::send('emails.order.create',["order"   =>  $order], function($message) use ($order){
//            $message->to($order->user->email)->subject("Order:#".$order->id);
//        });

        return $this->respondWithSuccess("Your order has been created. Email with details, has been send to you.");
    }


    //##### PRIVATE METHODS

    private function areModelsValid($models) {
        $models = str_replace("\"","",$models);
        $models = explode(',',$models);

        if(!is_array($models))
            return false;

        foreach($models as $model) {
            if(!is_numeric($model))
                return false;
        }

        return true;
    }




}
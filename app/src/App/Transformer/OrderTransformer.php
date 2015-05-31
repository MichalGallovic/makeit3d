<?php namespace App\Transformer;

use Order;
use League\Fractal\TransformerAbstract;
use App\Transformer\UserTransformer;
use App\Transformer\ModelTransformer;

class OrderTransformer extends TransformerAbstract {

    protected $availableIncludes = [
        'user',
        'models'
    ];

    public function transform(Order $order) {
        $models = array_map('intval',json_decode($order->models)->data);
        return [
            'id'            =>  $order->id,
            'price'         =>  $order->price,
            'created_at'    =>  $order->created_at,
            'first_name'    =>  $order->first_name,
            'last_name'     =>  $order->last_name,
            'street'        =>  $order->street,
            'town'          =>  $order->town,
            'country'       =>  $order->country,
            'zip_code'      =>  $order->zip_code,
            'was_opened'    =>  (boolean) $order->was_opened,
            'was_printed'   =>  (boolean) $order->was_printed,
            'was_shipped'   =>  (boolean)$order->was_shipped,
            'models'        =>  $models,
        ];
    }

    public function includeUser(Order $order) {
        $user = $order->user;
        if($user){
            return $this->item($user, new UserTransformer);
        }

    }

    public function includeModels(Order $order) {
        $models = $order->models();
        if($models->count()) {
            return $this->collection($models, new ModelTransformer);
        }
    }

}

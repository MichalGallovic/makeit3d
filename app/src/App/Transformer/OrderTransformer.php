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
        return [
            'price'         =>  $order->price,
            'created_at'    =>  $order->created_at,
            'first_name'    =>  $order->first_name,
            'last_name'     =>  $order->last_name,
            'street'        =>  $order->street,
            'town'          =>  $order->town,
            'country'       =>  $order->country,
            'zip_code'      =>  $order->zip_code
        ];
    }

    public function includeUser(Order $order) {
        $user = $order->user;

        return $this->item($user, new UserTransformer);
    }

    public function includeModels(Order $order) {
        $models = $order->models();

        return $this->collection($models, new ModelTransformer);
    }

}

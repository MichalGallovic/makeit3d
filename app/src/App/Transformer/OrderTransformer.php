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
            'id'            =>  $order->id,
            'price'         =>  $order->price,
            'created_at'    =>  $order->created_at,
            'first_name'    =>  $order->first_name,
            'last_name'     =>  $order->last_name,
            'street'        =>  $order->street,
            'town'          =>  $order->town,
            'country'       =>  $order->country,
            'zip_code'      =>  $order->zip_code,
            'was_opened'    =>  (boolean) $order->wasOpened,
            'was_printed'   =>  (boolean) $order->wasPrinted,
            'was_shipped'   =>  (boolean)$order->wasShipped
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

<?php namespace App\Transformer;

use User;
use League\Fractal\TransformerAbstract;
use App\Transformer\OrderTransformer;
class UserTransformer extends TransformerAbstract {

    protected $availableIncludes = [
        'orders'
    ];

    public function transform(User $user) {
        return [
            'id'            =>  (int) $user->id,
            'email'         =>  $user->email,
            'first_name'    =>  $user->first_name,
            'last_name'     =>  $user->last_name,
            'confirmed'     =>  (int) $user->confirmed,
            'street'        =>  $user->street,
            'town'          =>  $user->town,
            'country'       =>  $user->country,
            'zip_code'      =>  $user->zip_code,
            'token'         =>  $user->token,
            'created'    =>  $user->created_at->format('m-d-Y H:i:s')
        ];
    }

    public function includeOrders(User $user) {
        $orders = $user->orders;

        return $this->collection($orders, new OrderTransformer);
    }
}

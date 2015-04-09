<?php namespace App\Transformer;

use User;
use League\Fractal\TransformerAbstract;

class UserTransformer extends TransformerAbstract {

    public function transform(User $user) {
        return [
            'id'            =>  (int) $user->id,
            'email'         =>  $user->email,
            'first_name'    =>  $user->first_name,
            'last_name'     =>  $user->last_name,
            'confirmed'     =>  $user->confirmed,
            'street'        =>  $user->street,
            'town'          =>  $user->town,
            'country'       =>  $user->country,
            'zip_code'       =>  $user->zip_code
        ];
    }
}

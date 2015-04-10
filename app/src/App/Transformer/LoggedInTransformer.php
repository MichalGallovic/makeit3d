<?php namespace App\Transformer;

use League\Fractal\TransformerAbstract;
use Illuminate\Support\Collection;
class LoggedInTransformer extends TransformerAbstract {

    public function transform($response) {
        $user = $response->user;

        return [
            "id"            =>  $user->id,
            "email"         =>  $user->email,
            "first_name"    =>  $user->first_name,
            "last_name"     =>  $user->last_name,
            "confirmed"     =>  $user->confirmed,
            "street"        =>  $user->street,
            "town"          =>  $user->town,
            "country"       =>  $user->country,
            "zip_code"      =>  $user->zip_code,
            "created_at"    =>  $user->created_at,
            "token"         =>  $response->token
        ];
    }

}

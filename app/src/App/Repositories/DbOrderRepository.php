<?php namespace App\Repositories;

use Order;
use Model;

class DbOrderRepository {

    public function createOrder($input, $user) {
        $input['models'] = str_replace("\"","",$input['models']);
        $input['models'] = explode(',',$input['models']);

        $order = new Order;
        $order->models = json_encode(["data" => $input['models']]);
        $order->user_id = $user->id;
        $order->first_name = $user->first_name ? $user->first_name : $input['first_name'];
        $order->last_name = $user->last_name ? $user->last_name : $input['last_name'];
        $order->street = $input['street'];
        $order->town = $input['town'];
        $order->country = $input['country'];
        $order->zip_code = $input['zip_code'];

        $order->save();

        $price = 0;
        $models = $order->models();

        foreach($models as $model) {
            $price += $model->price;
        }
        $order->price = $price;

        $order->save();

        return $order;
    }




}
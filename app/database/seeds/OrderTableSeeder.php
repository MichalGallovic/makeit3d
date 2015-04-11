<?php

// Composer: "fzaninotto/faker": "v1.3.0"
use Faker\Factory as Faker;

class OrderTableSeeder extends Seeder {

	public function run()
	{
        DB::table('orders')->delete();
		$faker = Faker::create();

        $users = User::all()->lists('id');
        $models = Model::all()->lists('id');

		foreach(range(1, 10) as $index)
		{
            $models_data = json_encode(["data"=> array_slice($models,rand(0,count($models) - 1))]);
            $user = User::find($users[rand(0,count($users) - 1)]);
			$order = Order::create([
                'user_id'       =>  $user->id,
                'models'        =>  $models_data,
                'first_name'    =>  $user->first_name,
                'last_name'     =>  $user->last_name,
                'street'        =>  $user->street,
                'town'          =>  $user->town,
                'country'       =>  $user->country,
                'zip_code'      =>  $user->zip_code,
			]);

            $price = 0;
            foreach($order->models() as $model) {
                $price += $model->price;
            }

            $order->price = $price;
            $order->save();
		}
	}

}
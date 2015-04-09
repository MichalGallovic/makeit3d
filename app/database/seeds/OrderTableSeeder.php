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

			Order::create([
                'user_id'   =>  $users[rand(0,count($users) - 1)],
                'models'    =>  $models_data
			]);
		}
	}

}
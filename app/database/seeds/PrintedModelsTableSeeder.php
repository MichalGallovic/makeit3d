<?php

// Composer: "fzaninotto/faker": "v1.3.0"
use Faker\Factory as Faker;

class PrintedModelsTableSeeder extends Seeder {

	public function run()
	{
        DB::table('printed_models')->delete();
		$faker = Faker::create();

        $orders = Order::all();
		foreach(range(1, 2) as $index)
		{
            $order = $orders->random(1);
            $printed_models = json_decode($order->models)->data;
            foreach($printed_models as $model) {
                $printed_at = $faker->dateTimeBetween("-1 month",'now');
                DB::table('printed_models')->insert([
                    "user_id"   =>  $order->user->id,
                    "model_id"  =>  $model,
                    "created_at"    =>  $printed_at,
                    "updated_at"    =>  $printed_at
                ]);
            }
		}
	}

}
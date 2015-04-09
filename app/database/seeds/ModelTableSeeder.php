<?php

// Composer: "fzaninotto/faker": "v1.3.0"
use Faker\Factory as Faker;

class ModelTableSeeder extends Seeder {

	public function run()
	{
		$faker = Faker::create();
        DB::table('models')->delete();
        $categories = Category::all()->lists('id');

		foreach(range(1, 10) as $index)
		{
			Model::create([
                "name"  =>  $faker->word,
                "price" =>  $faker->randomFloat(2,0,100),
                "image_url" =>  $faker->imageUrl(640, 480),
                "category_id"   =>  $categories[rand(0,count($categories) - 1)],
                "printing_time" =>  $faker->numberBetween(1000,20000)
			]);
		}
	}

}
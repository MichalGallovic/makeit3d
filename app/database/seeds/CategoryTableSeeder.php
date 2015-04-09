<?php

// Composer: "fzaninotto/faker": "v1.3.0"
use Faker\Factory as Faker;

class CategoryTableSeeder extends Seeder {

	public function run()
	{
		$faker = Faker::create();
        DB::table('categories')->delete();
		foreach(range(1, 10) as $index)
		{
			Category::create([
                'name'  =>  $faker->word,
                'image_url' =>  $faker->imageUrl(480,480)
			]);
		}
	}

}
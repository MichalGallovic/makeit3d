<?php

// Composer: "fzaninotto/faker": "v1.3.0"
use Faker\Factory as Faker;
use Illuminate\Support\Facades\Hash;
class UserTableSeeder extends Seeder {

	public function run()
	{
		$faker = Faker::create();

		foreach(range(1, 10) as $index)
		{
			User::create([
                "email" =>  $faker->email,
                "first_name"    =>  $faker->lastName,
                "last_name"     =>  $faker->lastName,
                "password"  =>  Hash::make("makeit3d"),
                "street"        =>  $faker->streetName,
                "town"      =>  $faker->city,
                "zip_code"  =>  $faker->randomNumber(5),
                "country"   =>  $faker->country
			]);
		}

	}

}
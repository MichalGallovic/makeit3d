<?php

// Composer: "fzaninotto/faker": "v1.3.0"
use Faker\Factory as Faker;
use Illuminate\Support\Facades\Hash;
class UserTableSeeder extends Seeder {

	public function run()
	{
		$faker = Faker::create();
        DB::table('users')->delete();

        // main user for model adding and stuff
        User::create([
            "id"            =>  1,
            "email"         =>  "makeit3d@makeit3d.com",
            "first_name"    =>  "Makeit3D",
            "password"      =>  Hash::make("kominarskycech"),
            "street"        =>  "Plzenská 5",
            "town"          =>  "Bratislava",
            "zip_code"      =>  "83103",
            "country"       =>  "Slovakia"
        ]);
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

        User::create([
            "email" =>  "hoblikj@gmail.com",
            "first_name"    =>  "Jakub",
            "last_name"     =>  "Hoblík",
            "password"  =>  Hash::make("kominar"),
            "street"        =>  $faker->streetName,
            "town"      =>  "Trenčín",
            "zip_code"  =>  $faker->randomNumber(5),
            "country"   =>  "Slovakia",
            "confirmed" => 1
        ]);
	}

}
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
        $admin = User::create([
            "id"            =>  1,
            "email"         =>  "makeit3d@makeit3d.com",
            "first_name"    =>  "Makeit3D",
            "password"      =>  Hash::make("kominar"),
            "street"        =>  "Plzenská 5",
            "town"          =>  "Bratislava",
            "zip_code"      =>  "83103",
            "country"       =>  "Slovakia"
        ]);

        $adminRole = Role::where('name','admin')->first();

        $admin->roles()->attach($adminRole->id);


        $userRole = Role::where('name','user')->first();

//		foreach(range(1, 10) as $index)
//		{
//			$user = User::create([
//                "email" =>  $faker->email,
//                "first_name"    =>  $faker->lastName,
//                "last_name"     =>  $faker->lastName,
//                "password"  =>  Hash::make("kominar"),
//                "street"        =>  $faker->streetName,
//                "town"      =>  $faker->city,
//                "zip_code"  =>  $faker->randomNumber(5),
//                "country"   =>  $faker->country
//			]);
//
//            $user->roles()->attach($userRole->id);
//		}

        $user = User::create([
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

        $user->roles()->attach($adminRole->id);
	}

}
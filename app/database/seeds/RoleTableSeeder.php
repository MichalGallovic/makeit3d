<?php

class RoleTableSeeder extends Seeder {

	public function run()
	{

		Role::create([
            'name'    =>  'admin'
        ]);

        Role::create([
            'name'    =>  'user'
        ]);
	}

}
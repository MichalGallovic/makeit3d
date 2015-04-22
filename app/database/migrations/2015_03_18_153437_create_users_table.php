<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateUsersTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('users', function(Blueprint $table)
		{
			$table->increments('id');
            $table->string('email',40)->unique();
            $table->string('first_name',30)->nullable();
            $table->string('last_name',30)->nullable();
            $table->rememberToken();
            $table->boolean('confirmed')->default(0);
            $table->string('confirmation_code')->nullable();
            $table->string('street',100)->nullable();
            $table->string('town',50)->nullable();
            $table->string('country',40)->nullable();
            $table->string('zip_code', 20)->nullable();
            $table->text('token')->nullable();
            $table->string('password');
			$table->timestamps();
		});
	}


	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('users');
	}

}

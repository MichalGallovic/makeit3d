<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreatePrintedModelsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('printed_models', function(Blueprint $table)
		{
			$table->increments('id');
            $table->unsignedInteger('model_id');
            $table->foreign('model_id')->references('id')->on('models');
            $table->unsignedInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users');
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
		Schema::drop('printed_models');
	}

}

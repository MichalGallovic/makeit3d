<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateModelsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('models', function(Blueprint $table)
		{
			$table->increments('id');
            $table->string('name');
            $table->string('price')->nullable();
            $table->unsignedInteger('category_id')->nullable();
            $table->foreign('category_id')->references('id')->on('category');
            $table->string('image_url')->nullable();
            $table->float('printing_time')->nullable();
            $table->float('filament_length')->nullable();
            $table->float('filament_volume')->nullable();
            $table->boolean('visible')->default(1);
            $table->string('gcode_path')->nullable();
            $table->string('stl_path')->nullable();
            $table->string('gcode_download_link')->nullable();
            $table->string('gcode_api')->nullable();
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
		Schema::drop('models');
	}

}

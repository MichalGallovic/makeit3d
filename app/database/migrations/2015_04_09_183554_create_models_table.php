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
            $table->foreign('category_id')->references('id')->on('categories');
            $table->string('image_url')->nullable();
            $table->float('printing_time')->nullable();
            $table->float('filament_length')->nullable();
            $table->float('filament_volume')->nullable();
            $table->boolean('visible')->default(1);
            $table->string('uploaded_file_link')->nullable();
            $table->string('download_link_gcode')->nullable();
            $table->string('download_link_stl')->nullable();
            $table->string('gcode_api')->nullable();
            $table->unsignedInteger('created_by')->default(1);
            $table->foreign('created_by')->references('id')->on('users');
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

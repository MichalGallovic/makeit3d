<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

Route::get('/', function()
{
	$data = "data";
	$scope = "{$data}.0";
	dd($scope);
});

Route::get('/access-logs', function() {
	$logs = file_get_contents(__DIR__.'/storage/logs/server-access.log');
	$logs = explode("\n",$logs);
	$last20 = array_slice($logs,count($logs)-20,20);
	foreach ($last20 as $key => $value) {
		echo '<p>'.$value.'</p>';
	}
});

// Token Authentication
Route::get('auth', 'Tappleby\AuthToken\AuthTokenController@index');
Route::post('auth', 'Tappleby\AuthToken\AuthTokenController@store');
Route::delete('auth', 'Tappleby\AuthToken\AuthTokenController@destroy');
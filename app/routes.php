<?php

use Tappleby\AuthToken\Exceptions\NotAuthorizedException as AuthTokenNotAuthorizedException;
use Illuminate\Support\Facades\Request;
Route::get('/', function()
{
    return "makeit3d";
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

// @TODO handle HTML request
App::error(function(AuthTokenNotAuthorizedException $exception) {
    if(Request::ajax()) {
        return Response::json(array('error' => $exception->getMessage()), $exception->getCode());
    }

});
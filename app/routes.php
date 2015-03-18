<?php

use Tappleby\AuthToken\Exceptions\NotAuthorizedException as AuthTokenNotAuthorizedException;
use Illuminate\Support\Facades\Request;

Route::get('/', function()
{
    return View::make('hello');
});

Route::group(["prefix"  =>  "api"], function() {


    // Registration

    // Token Authentication
    Route::get('auth', 'Tappleby\AuthToken\AuthTokenController@index');
    Route::post('auth', 'Tappleby\AuthToken\AuthTokenController@store');
    Route::delete('auth', 'Tappleby\AuthToken\AuthTokenController@destroy');
});

// @TODO handle HTML request
App::error(function(AuthTokenNotAuthorizedException $exception) {
    if(Request::ajax()) {
        return Response::json(array('error' => $exception->getMessage()), $exception->getCode());
    }

});
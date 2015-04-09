<?php

use Tappleby\AuthToken\Exceptions\NotAuthorizedException as AuthTokenNotAuthorizedException;
use Illuminate\Support\Facades\Request;

Route::get('/', function()
{
    return View::make('hello');
});

Route::group(["prefix"  =>  "api"], function() {

    Route::get('users/{id}', 'UserController@show');
    // Registration

    // Categories
    Route::get('categories', 'CategoryController@index');
    Route::get('categories/{id}', 'CategoryController@show');
    // Models
    Route::get('models', 'ModelController@index');
    Route::get('models/recently_printed', 'ModelController@recentlyPrinted');
    Route::get('models/{id}', 'ModelController@show');

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
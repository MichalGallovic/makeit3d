<?php

use Tappleby\AuthToken\Exceptions\NotAuthorizedException as AuthTokenNotAuthorizedException;
use Illuminate\Support\Facades\Request;

Route::get('/',['uses'  =>  'HomeController@index','as'=>'home']);

Route::group(["prefix"  =>  "api"], function() {


    // Registration
    Route::post('users/register','UserController@register');
    Route::get('users/verify/{code}','UserController@verify');
    Route::post('users/login','UserController@login');
    Route::get('users/auth','UserController@getUserByToken');
    Route::delete('users/auth','UserController@logout');
    Route::get('users/{id}', 'UserController@show');

    // Categories
    Route::get('categories', 'CategoryController@index');
    Route::get('categories/{id}', 'CategoryController@show');
    // Models
    Route::get('models', 'ModelController@index');
    Route::get('models/recently_printed', 'ModelController@recentlyPrinted');
    Route::get('models/{id}', 'ModelController@show');

    // Token Authentication
//    Route::get('auth', 'Tappleby\AuthToken\AuthTokenController@index');
//    Route::post('auth', 'Tappleby\AuthToken\AuthTokenController@store');
//    Route::delete('auth', 'Tappleby\AuthToken\AuthTokenController@destroy');
});

// @TODO handle HTML request
App::error(function(AuthTokenNotAuthorizedException $exception) {
    if(Request::ajax()) {
        return Response::json(array('error' => $exception->getMessage()), $exception->getCode());
    }

});
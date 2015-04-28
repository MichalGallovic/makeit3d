<?php

use Tappleby\AuthToken\Exceptions\NotAuthorizedException as AuthTokenNotAuthorizedException;
use Illuminate\Support\Facades\Request;

use App\Octoprint\Octoprint;

Route::get('/',['uses'  =>  'HomeController@index','as'=>'home']);
Route::get('/phpinfo',function() {
   phpinfo();
});
Route::get('/tst', function() {

});
Route::get('users/verify/{code}','UserController@verify');

Route::group(["prefix"  =>  "api"], function() {


    // Authentication
    Route::post('users/register','UserController@register');
    Route::post('users/login','UserController@login');
    Route::get('users', 'UserController@index')->before('auth.token');
    Route::delete('users/logout','UserController@logout')->before('auth.token');
    Route::get('users/current','UserController@getCurrentUser')->before('auth.token');
    Route::put('users/current/edit','UserController@editCurrentUser')->before('auth.token');
    Route::get('users/{id}', 'UserController@show')->before(['auth.token','auth.admin']);
    Route::put('users/{id}', 'UserController@update')->before('auth.token');
    Route::delete('users/{id}','UserController@destroy');

    // Categories
    Route::get('categories', 'CategoryController@index');
    Route::get('categories/{id}', 'CategoryController@show');
    Route::put('categories/{id}/update', 'CategoryController@update')->before(['auth.token', 'auth.admin']);
    Route::delete('categories/{id}', 'CategoryController@destroy')->before(['auth.token', 'auth.admin']);
    // Models
    Route::get('models', 'ModelController@index');
    Route::get('models/recently_printed', 'ModelController@recentlyPrinted');
    Route::get('models/{id}', 'ModelController@show');
    Route::put('models/{id}','ModelController@update');
    Route::post('models/create','ModelController@create')->before('auth.token');
    Route::delete('models/{id}','ModelController@destroy')->before('auth.token');
    Route::get('models/{id}/print','ModelController@printModel');

    // Orders
    Route::get('orders', 'OrderController@index');
    Route::post('orders/create', 'OrderController@create')->before('auth.token');
    Route::get('orders/{id}', 'OrderController@show');

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
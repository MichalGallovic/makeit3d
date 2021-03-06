<?php

use Tappleby\AuthToken\Exceptions\NotAuthorizedException as AuthTokenNotAuthorizedException;
use Illuminate\Support\Facades\Request;

use App\Octoprint\Octoprint;

Route::get('/',['uses'  =>  'HomeController@index','as'=>'home']);
Route::get('users/verify/{code}','UserController@verify');

Route::group(["prefix"  =>  "api"], function() {


    // Authentication
    Route::post('users/register','UserController@register');
    Route::post('users/login','UserController@login');
    Route::get('users', 'UserController@index')->before(['auth.token','auth.admin']);
    Route::delete('users/logout','UserController@logout')->before('auth.token');
    Route::get('users/current','UserController@getCurrentUser')->before('auth.token');
    Route::put('users/current/edit','UserController@editCurrentUser')->before('auth.token');

    Route::get('users/{id}', 'UserController@show')->before(['auth.token','auth.admin']);
    Route::put('users/{id}', 'UserController@update')->before(['auth.token','auth.admin']);
    Route::delete('users/{id}','UserController@destroy')->before(['auth.token','auth.admin']);
    Route::post('users', 'UserController@create')->before(['auth.token','auth.admin']);


    // Categories
    Route::get('categories', 'CategoryController@index');
    Route::get('categories/{id}', 'CategoryController@show');

    Route::post('categories','CategoryController@create')->before(['auth.token', 'auth.admin']);
    Route::put('categories/{id}', 'CategoryController@update')->before(['auth.token', 'auth.admin']);
    Route::delete('categories/{id}', 'CategoryController@destroy')->before(['auth.token', 'auth.admin']);
    Route::post('categories/image','CategoryController@uploadImage')->before(['auth.token','auth.admin']);

    // Models
    Route::get('models', 'ModelController@index');
    Route::get('models/{id}', 'ModelController@show');
    Route::get('models/recently_printed', 'ModelController@recentlyPrinted');

    Route::post('models/create','ModelController@create')->before('auth.token');
    Route::post('models/image','ModelController@uploadImage')->before(['auth.token','auth.admin']);

    Route::put('models/{id}','ModelController@update')->before(['auth.token','auth.admin']);
    Route::delete('models/{id}','ModelController@destroy')->before(['auth.token','auth.admin']);
    Route::get('models/{id}/print','ModelController@printModel')->before(['auth.token','auth.admin']);

    // Orders
    Route::post('orders/create', 'OrderController@create')->before('auth.token');

    Route::get('orders', 'OrderController@index')->before(['auth.token','auth.admin']);
    Route::get('orders/{id}', 'OrderController@show')->before(['auth.token','auth.admin']);
    Route::put('orders/{id}','OrderController@update')->before(['auth.token','auth.admin']);
    Route::delete('orders/{id}','OrderController@destroy')->before(['auth.token','auth.admin']);
    Route::delete('orders/{orderId}/models/{modelId}','Ordercontroller@removeFromOrder')->before(['auth.token','auth.admin']);
    // Printer
    Route::get('printer/status','PrinterController@status')->before(['auth.token','auth.admin']);

    // Token Authentication
//    Route::get('auth', 'Tappleby\AuthToken\AuthTokenController@index');
//    Route::post('auth', 'Tappleby\AuthToken\AuthTokenController@store');
//    Route::delete('auth', 'Tappleby\AuthToken\AuthTokenController@destroy');
});

Route::get('/admin{data?}','HomeController@admin')->where('data','.*');

// @TODO handle HTML request
App::error(function(AuthTokenNotAuthorizedException $exception) {
    if(Request::ajax()) {
        return Response::json(array('error' => $exception->getMessage()), $exception->getCode());
    }

});
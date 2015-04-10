<?php

use Tappleby\AuthToken\Exceptions\NotAuthorizedException as AuthTokenNotAuthorizedException;
use Illuminate\Support\Facades\Request;

Route::get('/',['uses'  =>  'HomeController@index','as'=>'home']);
Route::get('/tst',function() {
   $user = User::find(2);
    dd($user->orders);
});
Route::get('users/verify/{code}','UserController@verify');

Route::group(["prefix"  =>  "api"], function() {


    // Authentication
    Route::post('users/register','UserController@register');
    Route::post('users/login','UserController@login');
    Route::delete('users/logout','UserController@logout')->before('auth.token');
    Route::get('users/current','UserController@getCurrentUser')->before('auth.token');
//    Route::get('users/{id}', 'UserController@show');

    // Categories
    Route::get('categories', 'CategoryController@index');
    Route::get('categories/{id}', 'CategoryController@show');
    // Models
    Route::get('models', 'ModelController@index');
    Route::get('models/recently_printed', 'ModelController@recentlyPrinted');
    Route::get('models/{id}', 'ModelController@show');

    Route::get('orders', 'OrderController@index');
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
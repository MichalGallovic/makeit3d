<?php

use Tappleby\AuthToken\Exceptions\NotAuthorizedException as AuthTokenNotAuthorizedException;
use Illuminate\Support\Facades\Request;

use App\Octoprint\Octoprint;

Route::get('/',['uses'  =>  'HomeController@index','as'=>'home']);
Route::get('/phpinfo',function() {
   phpinfo();
});
Route::get('/tst', function() {
    $octoprint = new Octoprint();
    $model = Model::find(1);
    dd($model->createdBy->first_name);
//    dd($octoprint->slice("http://octoprint.makeit3d.dev/api/files/local/Ancestry3d_ColganteEquilibrium.stl"));
    dd($octoprint->localFile("1428929954_UltimakerRobot_support.gcode")->get());
});
Route::get('users/verify/{code}','UserController@verify');

Route::group(["prefix"  =>  "api"], function() {


    // Authentication
    Route::post('users/register','UserController@register');
    Route::post('users/login','UserController@login');
    Route::delete('users/logout','UserController@logout')->before('auth.token');
    Route::get('users/current','UserController@getCurrentUser')->before('auth.token');
    Route::put('users/current/edit','UserController@editCurrentUser')->before('auth.token');
//    Route::get('users/{id}', 'UserController@show');

    // Categories
    Route::get('categories', 'CategoryController@index');
    Route::get('categories/{id}', 'CategoryController@show');
    // Models
    Route::get('models', 'ModelController@index');
    Route::get('models/recently_printed', 'ModelController@recentlyPrinted');
    Route::get('models/{id}', 'ModelController@show');
    Route::post('models/create','ModelController@create')->before('auth.token');
    // Orders
    Route::get('orders', 'OrderController@index');
    Route::post('orders/create', 'OrderController@create')->before('auth.token');
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
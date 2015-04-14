<?php namespace App\Search;

use Illuminate\Support\ServiceProvider;

class SearchServiceProvider extends ServiceProvider {
    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
       $this->app->bind('search','App\Search\Search');
    }

}
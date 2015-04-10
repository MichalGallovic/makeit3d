<?php

class Model extends \Eloquent {
	protected $fillable = [];

    public function category() {
        return $this->belongsTo('Category');
    }

    public function printedByUsers() {
        return $this->belongsToMany('User','printed_models');
    }
}
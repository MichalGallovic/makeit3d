<?php

class Model extends \Eloquent {
	protected $fillable = [];

    public function category() {
        return $this->hasOne('Category');
    }

    public function printedByUsers() {
        return $this->belongsToMany('User','printed_models');
    }
}
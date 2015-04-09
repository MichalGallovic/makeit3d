<?php

class Category extends \Eloquent {
	protected $fillable = [];

    public function models() {
        return $this->hasMany('Model');
    }
}
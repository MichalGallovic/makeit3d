<?php

class Category extends \Eloquent {
	protected $fillable = ['name','image_url'];

    public function models() {
        return $this->hasMany('Model');
    }
}
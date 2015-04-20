<?php

class Role extends \Eloquent {
	protected $fillable = [];

    public function users() {
        return $this->belongsToMany('User')->withTimestamps();
    }
}
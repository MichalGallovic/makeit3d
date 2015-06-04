<?php

class Category extends \Eloquent {
    use \Illuminate\Database\Eloquent\SoftDeletingTrait;
    protected $dates = ['deleted_at'];

	protected $fillable = ['name','image_url'];

    public function models() {
        return $this->hasMany('Model');
    }
}
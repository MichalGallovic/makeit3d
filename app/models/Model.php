<?php

class Model extends \Eloquent {
    use \Illuminate\Database\Eloquent\SoftDeletingTrait;
    protected $dates = ['deleted_at'];
	protected $fillable = [];

    public function category() {
        return $this->belongsTo('Category');
    }

    public function createdBy() {
        return $this->belongsTo('User','created_by');
    }

    public function printedByUsers() {
        return $this->belongsToMany('User','printed_models');
    }

    public function scopeSearch($query, $search) {
        return $query->where('name','LIKE',"%$search%")->orWhereHas('category', function($q) use ($search){
            $q->where('name','LIKE',"%$search%");
        });
    }
}
<?php

use Illuminate\Auth\UserTrait;
use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableTrait;
use Illuminate\Auth\Reminders\RemindableInterface;

class User extends Eloquent implements UserInterface, RemindableInterface {

	use UserTrait, RemindableTrait;

	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'users';

	/**
	 * The attributes excluded from the model's JSON form.
	 *
	 * @var array
	 */
	protected $hidden = array('password', 'remember_token');

    protected $fillable = [
        "email",
        "password",
        "first_name",
        "last_name",
        "confirmation_code",
        "street",
        "town",
        "country",
        "zip_code"
    ];


    public function printedModels() {
        return $this->belongsToMany('Model', 'printed_models');
    }

    public function orders() {
        return $this->hasMany('Order');
    }

    public function roles() {
        return $this->belongsToMany('Role')->withTimestamps();
    }

    public function isAdmin() {
        $roles = $this->roles()->get();

        foreach($roles as $role) {
            if($role->name == 'admin')
                return true;
        }

        return false;
    }

}

<?php namespace App\Repositories;

use User;

class DbUserRepository {

    protected $tokenController;

    public function getCurrentUser() {
        $response = $this->tokenController->index();
        $user = User::find($response->getData()->id);
        return $user;
    }

}
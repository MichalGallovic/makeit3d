<?php namespace App\Repositories;

use Tappleby\AuthToken\AuthTokenController;
use User;

class DbUserRepository {

    protected $tokenController;

    public function __construct(AuthTokenController $tokenController) {
        $this->tokenController = $tokenController;
    }

    public function getCurrentUser() {
        $response = $this->tokenController->index();
        $user = User::find($response->getData()->id);
        return $user;
    }

}
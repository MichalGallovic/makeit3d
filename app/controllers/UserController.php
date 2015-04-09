<?php

use App\Transformer\UserTransformer;

class UserController extends ApiController {

	public function index() {
        $users = User::take(10)->get();
    }

    public function show($id) {
        $user = User::find($id);

        if(!$user) {
            //@TODO error
        }

        return $this->respondWithItem($user, new UserTransformer);
    }

}
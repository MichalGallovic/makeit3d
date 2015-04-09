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

    public function register() {
        $input = Request::only(["email","password"]);
        $rules = [
            "email"  =>  "required|email|unique:users",
            "password"  =>  "required|min:6"
        ];
        $validator = Validator::make($input, $rules);

        if($validator->fails()) {
            $messages = $validator->messages();
            return $this->errorWrongArgs($messages->first());
        }

        $confirmation_code = str_random(30);

        User::create([
            "email"             =>  $input['email'],
            "password"          =>  Hash::make($input['password']),
            "confirmation_code" =>  $confirmation_code
        ]);

        Mail::send('email.verify',$confirmation_code, function($message) use ($input) {
            $message->to($input['email'])->subject('Verify your email address');
        });

//        return $this->respondWithItem()

    }

    public function login() {

    }

    public function getUserByToken() {

    }

    public function logout() {

    }

}
<?php

use App\Transformer\UserTransformer;
use Illuminate\Support\Collection;
class UserController extends ApiController {

	public function index() {
        $users = User::take(10)->get();
    }

    public function show($id) {
        $user = User::find($id);

        if(!$user) {
            return $this->errorNotFound("No such user man, sorry !");
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

        Mail::send('emails.auth.verify',[$confirmation_code], function($message) use ($input) {
            $message->to($input['email'])->subject('Verify your email address');
        });
        
        return Response::json([
           "data"   =>  [
               "confirmation_code"  =>  $confirmation_code
           ]
        ]);
//        return $this->respondWithSuccess("Your account was registered successfully. The confirmation email was sent to you.");

    }

    public function verify($confirmation_code) {
        if(!$confirmation_code){
//            throw new InvalidConfirmationCodeException;
            return Redirect::home();
        }
        $user = User::where('confirmation_code',$confirmation_code)->first();

        if(!$user){
//            throw new InvalidConfirmationCodeException;
            return Redirect::home();
        }

        $user->confirmed = 1;
        $user->confirmation_code = null;
        $user->save();


        return View::make('site.user.verify')->with('email',$user->email);
    }

    public function login() {

    }

    public function getUserByToken() {

    }

    public function logout() {

    }

}
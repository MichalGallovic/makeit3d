<?php

use App\Transformer\UserTransformer;
use App\Transformer\LoggedInTransformer;
use Illuminate\Support\Collection;
use App\Exceptions\User\InvalidConfirmationCodeException;
use Tappleby\AuthToken\AuthTokenController;
use League\Fractal\Manager;
use Tappleby\AuthToken\Exceptions\NotAuthorizedException as AuthTokenNotAuthorizedException;
class UserController extends ApiController {

    protected $tokenController;

    public function __construct(Manager $manager, AuthTokenController $tokenController) {
        parent::__construct($manager);
        $this->tokenController = $tokenController;
    }

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
            "username"  =>  "required|email|unique:users,email",
            "password"  =>  "required|min:6"
        ];
        $validator = Validator::make($input, $rules);

        if($validator->fails()) {
            $messages = $validator->messages();
            return $this->errorWrongArgs($messages->first());
        }

        $confirmation_code = str_random(30);

        User::create([
            "email"             =>  $input['username'],
            "password"          =>  Hash::make($input['password']),
            "confirmation_code" =>  $confirmation_code
        ]);

        Mail::send('emails.auth.verify',[$confirmation_code], function($message) use ($input) {
            $message->to($input['username'])->subject('Verify your email address');
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
            throw new InvalidConfirmationCodeException("Invalid confirmation code.");
        }
        $user = User::where('confirmation_code',$confirmation_code)->first();

        if(!$user){
            throw new InvalidConfirmationCodeException("Invalid confirmation code.");
        }

        $user->confirmed = 1;
        $user->confirmation_code = null;
        $user->save();


        return View::make('site.user.verify')->with('email',$user->email);
    }

    public function login() {
        $response = $this->tokenController->store()->getData();

        return $this->respondWithItem($response, new LoggedInTransformer);
    }

    public function logout() {
        try {
            $this->tokenController->destroy();
        }
        catch(AuthTokenNotAuthorizedException $e) {
            return $this->errorUnauthorized("Login before logout :)");
        }

        return $this->respondWithSuccess("You logged out successfully");
    }

}
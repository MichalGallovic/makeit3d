<?php

use App\Transformer\UserTransformer;
use App\Transformer\LoggedInTransformer;
use Illuminate\Support\Collection;
use App\Exceptions\User\InvalidConfirmationCodeException;
use Tappleby\AuthToken\AuthTokenController;
use League\Fractal\Manager;
use Tappleby\AuthToken\Exceptions\NotAuthorizedException as AuthTokenNotAuthorizedException;
use App\Repositories\DbUserRepository;

class UserController extends ApiController {

    protected $tokenController;
    protected $userRepo;

    public function __construct(Manager $manager, AuthTokenController $tokenController, DbUserRepository $userRepo) {
        parent::__construct($manager);
        $this->tokenController = $tokenController;
        $this->userRepo = $userRepo;
    }


    public function register() {
        $input = Request::only(["username","password"]);
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
        $this->tokenController->destroy();

        return $this->respondWithSuccess("You logged out successfully");
    }

    public function getCurrentUser() {
        $user = $this->userRepo->getCurrentUser();

        return $this->respondWithItem($user, new UserTransformer);
    }



    public function editCurrentUser() {
        $user = $this->userRepo->getCurrentUser();

        $input = Input::only([
            'username',
            'password',
            'first_name',
            'last_name',
            'street',
            'town',
            'country',
            'zip_code'
        ]);


        $rules = [
            'username'      =>  'required|email',
            'password'      =>  'required|min:6'
        ];

        $username = $input['username'];

        if(!$this->isUsernameUnique($username, $user))
            return $this->errorWrongArgs("This email has already been taken. Choose different please.");


        $validator = Validator::make($input,$rules);

        if($validator->fails()) {
            $messages = $validator->messages();
            return $this->errorWrongArgs($messages->first());
        }

        $input['email'] = $input['username'];
        $input['password'] = Hash::make($input['password']);

        $user->fill($input);
        $user->save();

        return $this->respondWithSuccess("User preferences updated successfully");
    }

    //######## Private methods #########

    private function isUsernameUnique($username,$currentUser) {
        if($username == $currentUser->email)
            return true;

        $userMatch = User::where('email','!=',$currentUser->email)->where('email',$username)->first();

        if($userMatch)
            return false;

        return true;
    }
}
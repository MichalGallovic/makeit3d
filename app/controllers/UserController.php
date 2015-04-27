<?php

use App\Transformer\UserTransformer;
use App\Transformer\LoggedInTransformer;
use Illuminate\Support\Collection;
use App\Exceptions\User\InvalidConfirmationCodeException;
use Tappleby\AuthToken\AuthTokenController;
use League\Fractal\Manager;
use Tappleby\AuthToken\Exceptions\NotAuthorizedException as AuthTokenNotAuthorizedException;
use App\Repositories\DbUserRepository;
use Bogardo\Mailgun\Facades\Mailgun;

class UserController extends ApiController {

    protected $tokenController;
    protected $userRepo;

    public function __construct(Manager $manager, AuthTokenController $tokenController, DbUserRepository $userRepo) {
        parent::__construct($manager);
        $this->tokenController = $tokenController;
        $this->userRepo = $userRepo;
    }


    public function index() {
        $users = User::all();

        return $this->respondWithCollection($users, new UserTransformer, 'users');
    }


    public function show($id) {
        $user = User::find($id);

        if(!$user)
            return $this->errorNotFound("User not found.");

        return $this->respondWithItem($user,new UserTransformer, 'user');
    }

    public function update($id) {
        $user = User::find($id);

        if(!$user)
            return $this->errorNotFound();

        $input = Input::only([
            'name',
            'username',
            'first_name',
            'lats_name',
            'street',
            'town',
            'country',
            'zip_code'
        ]);

        $rules = [
            'username'  =>  'required|email'
        ];

        $validator = Validator::make($input, $rules);

        if($validator->fails()) {
            $messages = $validator->messages();
            return $this->errorWrongArgs($messages->first());
        }

        $input['email'] = $input['username'];
        $user->fill($input);
        $user->save();

        return $this->respondWithSuccess("User edited successfully");
    }

    public function destroy($id) {
        try {
            $user = User::findOrFail($id);

            if($user->delete()) {
                return $this->respondWithSuccess('User deleted successfully');
            }

            return $this->errorInternalError();
        } catch(\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorNotFound();
        }
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

        $user = User::create([
            "email"             =>  $input['username'],
            "password"          =>  Hash::make($input['password']),
            "confirmation_code" =>  $confirmation_code
        ]);

        Mail::send('emails.auth.verify',["user" =>  $user], function($message) use ($input) {
            $message->to($input['username'])->subject('Verify your email address');
        });

//        Mailgun::send('emails.auth.verify',["user" =>  $user], function($message) use ($input) {
//            $message->to($input['username'])->subject('Verify your email address');
//        });

        return $this->respondWithSuccess("Your account was registered successfully. The confirmation email was sent to you.");

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

        $id = $response->user->id;

        $user = Auth::loginUsingId($id);

        $user->token = $response->token;
        $user->save();

        return $this->respondWithItem($response, new LoggedInTransformer, 'user');
    }

    public function logout() {
        $this->tokenController->destroy();
        $user = Auth::user();
        $user->token = null;
        $user->save();
        Auth::logout();
        return $this->respondWithSuccess("You logged out successfully");
    }

    public function getCurrentUser() {
        $user = $this->userRepo->getCurrentUser();

        return $this->respondWithItem($user, new UserTransformer,'user');
    }



    public function editCurrentUser() {
        $user = $this->userRepo->getCurrentUser();

        $input = Input::only([
            'username',
            'first_name',
            'last_name',
            'street',
            'town',
            'country',
            'zip_code'
        ]);


        $rules = [
            'username'      =>  'required|email'
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
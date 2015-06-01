<?php
use App\Octoprint\Octoprint;
use League\Fractal\Manager;
class PrinterController extends ApiController {

    public function __construct(Manager $manager, Octoprint $octoprint) {
        parent::__construct($manager);
        $this->octoprint = $octoprint;
    }

	public function status() {
        $response = $this->octoprint->currentJob()->get();

        return Response::json([
                'status'    =>  $response['state'],
                'timeleft'      =>  $response['progress']['printTimeLeft'],
                'name'      =>  $response['job']['file']['name'],
                'completed' =>  $response['progress']['completion']*100
        ], 200);
    }

}
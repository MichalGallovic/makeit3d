<?php
use App\Octoprint\Octoprint;
use League\Fractal\Manager;
class PrinterController extends ApiController {

    public function __construct(Manager $manager, Octoprint $octoprint) {
        parent::__construct($manager);
        $this->octoprint = $octoprint;
    }

	public function status() {
        $response = $this->octoprint->currentJob();
        $currentStatus = $response['state'];

        return Response::json([
            "printer" => [
                'status'    =>  $currentStatus
            ]
        ], 200);
    }

}
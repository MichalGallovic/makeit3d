<?php
use App\Octoprint\Octoprint;
use League\Fractal\Manager;
class PrinterController extends ApiController {

    public function __construct(Manager $manager, Octoprint $octoprint) {
        parent::__construct($manager);
        $this->octoprint = $octoprint;
    }

	public function status() {

        try {
            $response = $this->octoprint->printer()->currentJob()->get();

            if(substr($response['state'],0,5) === "Error" )
                $response['state'] = "Printer Error!";
            return Response::json([
                'status'    =>  $response['state'],
                'timeleft'      =>  $response['progress']['printTimeLeft'],
                'name'      =>  $response['job']['file']['name'],
                'completed' =>  $response['progress']['completion']*100,
                'description'   =>  "Raspberry Connected, Printer: ".$response['state']
            ], 200);

        } catch(GuzzleHttp\Exception\ServerException $e) {
            return Response::json([
                'status'    =>  "Raspberry: Not Connected",
                'timeleft'      =>  null,
                'name'      =>  null,
                'completed' =>  null,
                'description'   =>  "Raspberry Not Connected"
            ], 200);
        } catch(\GuzzleHttp\Exception\ConnectException $e) {
            return Response::json([
                'status'    =>  "Raspberry: Not Connected",
                'timeleft'      =>  null,
                'name'      =>  null,
                'completed' =>  null,
                'description'   =>  "Raspberry Not Connected"
            ], 200);
        }

    }

}
<?php
namespace App\Queue\Printer;
use App\Octoprint\Exceptions\NameNotSpecifiedException;
use App\Octoprint\Octoprint;
use Log, Mail;
class MonitorPrinting {

    public function fire($job, $data) {
        $octoprint = new Octoprint();
        $response = $octoprint->printer()->currentJob()->get();

        if($response["state"] == "Offline" || $response["state"] != "Printing") {
            Mail::send('emails.admin.printing_failed',["model_name" =>  $data['model_name']], function($message) {
                $message->to("gallovicm@gmail.com")->subject("During the printing a problem occured!");
            });
            $octoprint->printer()->localFile($data['model_name'])->delete();
            $job->delete();
            return;
        }

        $completed = $response["progress"]["completion"];

        if($completed < 1){
            $job->release(5);
        } else {
            Mail::send('emails.admin.model_printed',["model_name" =>  $data['model_name']], function($message) use ($data) {
                $message->to("gallovicm@gmail.com")->subject("Model printing ".$data['model_name']." finished successfully!");
            });
            $job->delete();
        }
    }
} 
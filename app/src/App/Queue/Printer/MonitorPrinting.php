<?php
namespace App\Queue\Printer;
use App\Octoprint\Exceptions\NameNotSpecifiedException;
use App\Octoprint\Octoprint;
use Log;
class MonitorPrinting {

    public function fire($job, $data) {
        $octoprint = new Octoprint();
        $response = $octoprint->currentJob()->get();

        Log::info($response);

        $job->release(5);
    }
} 
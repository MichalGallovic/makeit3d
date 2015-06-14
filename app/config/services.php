<?php

return array(

	/*
	|--------------------------------------------------------------------------
	| Third Party Services
	|--------------------------------------------------------------------------
	|
	| This file is for storing the credentials for third party services such
	| as Stripe, Mailgun, Mandrill, and others. This file provides a sane
	| default location for this type of information, allowing packages
	| to have a conventional place to find your various credentials.
	|
	*/

	'mailgun' => array(
		'domain' => '',
		'secret' => '',
	),

	'mandrill' => array(
		'secret' => '',
	),

	'stripe' => array(
		'model'  => 'User',
		'secret' => '',
	),
    'octoprint' =>  [
        "api_key"           =>  'A7339BA35A6F495384BF6533DF381E94',
        "printer_api_key"   =>  '7BF6AC45336F4FDDBC724ACE7E91265C',
        "root_prefix"       =>  "octoprint",
        "root_postfix"      =>  "/api",
        "localhost_port"    =>  "4321",
        "printer_url"       =>  "makeit3d.noip.me/api",
    ]

);

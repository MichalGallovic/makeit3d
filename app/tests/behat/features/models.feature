Feature: Models

Scenario: Returning a collection of models
	When I request "GET /models"
	Then I get a "200" response
	And the "data" property is an array
	And scope into the first "data" property
		And the properties exist:
		"""
		id
		name
		gcode_url
		estimated_print_time
		filament_length
		price
		"""

Scenario: Returning a specific model
	When I request "GET /models/1"
	Then I get a "200" response
	And scope into the first "data" property
		And the properties exist:
		"""
		id
		name
		gcode_url
		estimated_print_time
		filament_length
		price
		"""

Scenario: Try to return invalid model
	When I request "GET /models/potato123jhas"
	Then I get a "404" response

Scenario: Searching models with name filter
	When I request "GET /models?q=Cube"
	Then I get a "200" response
	And scope into the first "data" property
		And the properties exist:
		"""
		id
		name
		gcode_url
		estimated_print_time
		filament_length
		price
		"""

Scenario: Searching for non-existent models
	When I request "GET /models?q=non-existent-model"
	Then I get a "200" response
	And the "data" property contains 0 items

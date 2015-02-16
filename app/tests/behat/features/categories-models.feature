Feature: Models from Categories

Scenario: Returning models by category
	When I request "GET /categories/1/models"
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

Scenario: Try to return invalid category models
	When I request "GET /categories/akjsdh2/models"
	Then I get a "404" response
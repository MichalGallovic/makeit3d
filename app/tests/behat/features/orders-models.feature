Feature: Models

Scenario: Creating model with gcode
	Given I have the payload:
	"""
	{"name": "../../models/Test.gcode"}
	"""
	When I request "POST /orders/1/models"
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

Scenario: Creating model with stl
	Given I have the payload:
	"""
	{"name": "../../models/Test.stl"}
	"""
	When I request "POST /orders/1/models"
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
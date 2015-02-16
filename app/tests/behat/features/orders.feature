Feature: Orders

Scenario: Returning a collection of orders
	When I request "GET /orders"
	Then I get a "200" response
	And scope into the first "data" property
		And the properties exist:
		"""
		id
		name
		user_id
		price
		models
		"""

Scenario: Returning a specific order
	When I request "GET /orders/1"
	Then I get a "200" response
	And scope into the first "data" property
		And the properties exist:
		"""
		id
		name
		user_id
		price
		models
		"""

Scenario: Trying to return an invalid order
	When I request "GET /orders/asldkja"
	Then I get a "404" response
	

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
Scenario: Creating model with unsupported MIME
	Given I have the payload:
	"""
	{"name": "../../models/Test.jpg"}
	"""
	When I request "POST /orders/1/models"
	Then I get a "415" response
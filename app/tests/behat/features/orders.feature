Feature: Orders

Scenario: Returning a collection of orders
	When I request "GET /orders"
	Then I get a "200" response
	And scope into the first "data" property
		And the properties exist:
		"""
		id
		user_id
		first_name
		last_name
		street
		email
		town
		country
		zip_code
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
		user_id
		first_name
		last_name
		street
		email
		town
		country
		zip_code
		price
		models
		"""

Scenario: Trying to return an invalid order
	When I request "GET /orders/asldkja"
	Then I get a "404" response

Scenario: Creating new order - add model to basket
	Given I have the payload:
	"""
	{"model_id": "1"}
	"""
	When I request "POST /orders"
	Then I get a "200" response
	And scope into the first "data" property
		And the properties exist:
		"""
		id
		user_id
		first_name
		last_name
		street
		email
		town
		country
		zip_code
		price
		models
		"""

Scenario: Creating new order - add unknown model to basket
	Given I have the payload:
	"""
	{"model_id":"blasdaljsj"}
	"""
	When I request "POST /orders"
	Then I get a "400" response


Scenario: Creating model with unsupported MIME
	Given I have the payload:
	"""
	{"name": "../../models/Test.jpg"}
	"""
	When I request "POST /orders/1/models"
	Then I get a "415" response

Scenario: Deleting order
	When I request "DELETE /orders/1"
	Then I get a "200" response

Scenario: Deleting model from order
	When I request "DELETE /orders/1/models/1"
	Then I get a "200" response

Scenario: Editing model count in order
	Given I have the payload:
	"""
	{
	"model_count": "-1"
	}
	"""
	When I request "PUT /orders/1/models/1"
	Then I get a "200" response
	And scope into the first "data" property
		And the properties exist:
		"""
		id
		user_id
		first_name
		last_name
		street
		email
		town
		country
		zip_code
		price
		models
		"""


Scenario: Editing order
	Given I have the payload:
	"""
	{
	"first_name": "Foo",
	"last_name": "Guy",
	"street": "Random 46",
	"email": "foo@bar.com",
	"town": "BazTown",
	"country": "Barlovakia",
	"zip_code": "91101"	
	}
	"""
	When I request "PUT /orders/1"
	Then I get a "200" response
	And scope into the first "data" property
		And the properties exist:
		"""
		id
		user_id
		first_name
		last_name
		street
		email
		town
		country
		zip_code
		price
		models
		"""

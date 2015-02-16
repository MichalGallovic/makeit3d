Feature: Categories

Scenario: Returning a collection of categories
    When I request "GET /categories"
    Then I get a "200" response
    And scope into the first "data" property
        And the properties exist:
        """
        id
        name
        models_count
        """
        And the "id" property is an integer
        And the "name" property is a string

Scenario: Returning a specific category
    When I request "GET /categories/1"
    Then I get a "200" response
    And scope into the first "data" property
        And the properties exist:
        """
        id
        name
        models_count
        """

Scenario: Try to find an invalid category
    When I request "GET /categories/a92ksl"
    Then I get a "404" response

Scenario: Try to create category
    When I request "POST /categories"
    Then I get a "405" response

Scenario: Try to delete category
    When I request "DELETE /categories/1"
    Then I get a "405" response

Scenario: Try to edit category
    When I request "PUT /categories/1"
    Then I get a "405" response
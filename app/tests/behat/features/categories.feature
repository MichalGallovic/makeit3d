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
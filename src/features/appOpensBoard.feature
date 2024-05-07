Feature: Check App Loaded and Board Open

  Scenario: User opens the site, and the app with a board is successfully loaded
    Given I open the site on "localhost:8000"
    Then the app should be loaded
    And a board is opened in the app

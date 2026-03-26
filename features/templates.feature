@templates
@microboard
Feature: Board Templates

  Scenario: User can open templates modal and load a template
    Given The user navigates to "http://api_dev:8000"
    When The app is fully loaded
    And The user clicks the templates menu button
    Then The templates modal is open
    When The user chooses to use the first template
    Then The template content is pasted onto the board

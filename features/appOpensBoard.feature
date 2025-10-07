@appBoardLoading
@microboard
Feature: Application Board Loading

  Scenario: User can open a board within the app
    Given The user navigates to "http://api_dev:8000"
    When The app is fully loaded
    Then A board is opened within the app

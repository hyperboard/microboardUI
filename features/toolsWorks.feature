@toolsworks
@microboard
Feature: Сhecking the operation of tools

  Scenario: User added a sticker
    Given Sticker added to x: 100, y: 100
    Then Item added to the board
    Then 1 items are selected
    Then Panel is near item and item has a cursor

  Scenario: User added a shape
    Given Shape added to x: 100, y: 100
    Then Item added to the board
    Then 1 items are selected
    Then Panel is near item and item has a cursor

  Scenario: User added a text
    Given Text added to x: 100, y: 100
    Then Item added to the board
    Then 1 items are selected
    Then Panel is near item and item has a cursor
    Then Text has a placeholder
    Then Placeholder not extend beyond the text
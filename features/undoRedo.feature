@undoRedo
@microboard
Feature: Undo Redo
  Scenario: User can undo shape stroke width
    Given Shape added to x: 100, y: 100
    When User changes shape stroke width
    When User clicks undo
    Then Shape stroke width is 1
  Scenario: User can undo connector switch pointers
    Given Connector added to x: 100, y: 100 and x: 100, y: 300
    When Cursor clicked at x: 100, y: 200
    When User switches connector pointers
    When User clicks undo
    Then Connector pointers switched
  Scenario: User can undo drawing line width
    Given Line added to x: 400, y: 400
    When User changes line width
    When User clicks undo
    Then Line width is 6
  Scenario: User can undo add frame
    Given Frame added
    When User clicks undo
    Then Frame is not on the board
  Scenario: User can undo change frame ratio
    Given Frame added
    When User changes frame ratio
    When User clicks undo
    Then Frame ratio is 16x9
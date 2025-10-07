@sync
@removedObjects
Feature: Operations with remote items

  Scenario: Client B connected the connector to an item that was deleted by Client A
    Given Board with two objects: object M and object N for Client A and Client B
    When Client B lost the connection
    When Client A deleted object N
    When Client B connected a connector from object M to object N
    When Client B restored the connection
    Then Object N is missing from the board
    Then Connector from object M is not connected or is floating in the air
    Then Positions of the frame and object are the same on both clients

  Scenario: Client A connected the connector to an item that was deleted by Client B
    Given Board with two objects: object M and object N for Client A and Client B
    When Client B lost the connection
    When Client A connected a connector from object M to object N
    When Client B deleted object N
    When Client B restored the connection
    Then Object N is missing from the board
    Then Connector from object M is not connected or is floating in the air
    Then Positions of the frame and object are the same on both clients

  Scenario: Client B added an item to a frame that Client A deleted
    Given Board with frame for Client A and Client B
    When Client B lost the connection
    When Client A deleted frame
    When Client B added object Z to the frame
    When Client B restored the connection
    Then Frame is missing from the board
    Then Positions of the frame and object are the same on both clients

  Scenario: Client A added an item to a frame that Client B deleted
    Given Board with frame for Client A and Client B
    When Client B lost the connection
    When Client A added object Z to the frame
    When Client B deleted frame
    When Client B restored the connection
    Then Frame is missing from the board
    Then Positions of the frame and object are the same on both clients

  Scenario: Client B is typing text into an item that Client A deleted
    Given Board with text object T is with both Client A and Client B
    When Client B lost the connection
    When Client A deleted object
    When Client B inserted text
    When Client B restored the connection
    Then Object is missing from the board

  Scenario: Client A is typing text into an item that Client B deleted
    Given Board with text object T is with both Client A and Client B
    When Client B lost the connection
    When Client A inserted text
    When Client B deleted object
    When Client B restored the connection
    Then Object is missing from the board

  Scenario: Client B performs an operation on an item that Client A deleted
    Given Board with object O is with both Client A and Client B
    When Client B lost the connection
    When Client A deleted object
    When Client B changed object
    When Client B restored the connection
    Then Object is missing from the board

  Scenario: Client A performs an operation on an item that Client B deleted
    Given Board with object O is with both Client A and Client B
    When Client B lost the connection
    When Client A changed object
    When Client B deleted object
    When Client B restored the connection
    Then Object is missing from the board

  Scenario: Client B deletes and restores an item that Client A deleted
    Given Board with object O is with both Client A and Client B
    When Client B lost the connection
    When Client A deleted object
    When Client B deleted object
    When Client B undid the action
    When Client B restored the connection
    Then Object is missing from the board

  Scenario: Client A deletes and restores an item that Client B deleted
    Given Board with object O is with both Client A and Client B
    When Client B lost the connection
    When Client B deleted object
    When Client A deleted object
    When Client A undid the action
    When Client B restored the connection
    Then Object is missing from the board
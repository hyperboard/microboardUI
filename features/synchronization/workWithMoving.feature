@sync
@moving
Feature: Concurrent movement of a group of items and a subset of items from that group

  Scenario: Client B moves an item while Client A has selected and is moving multiple items, including that item
    Given Board with multiple items for Client A and Client B
    When Client B lost the connection
    When Client A selected the first two objects and moved them together
    When Client B moved second object
    When Client B restored the connection
    Then Positions of the objects are the same on both clients
    Then Objects A and B are in their final positions, accounting for the movements made by both clients

  Scenario: Client B has selected and is moving multiple items, including that item while Client A moves an item
    Given Board with multiple items for Client A and Client B
    When Client B lost the connection
    When Client A moved second object
    When Client B selected the first two objects and moved them together
    When Client B restored the connection
    Then Positions of the objects are the same on both clients
    Then Objects A and B are in their final positions, accounting for the movements made by both clients

  Scenario: Client B moves an item that is on the frame while Client A moves the frame
    Given Board with frame containing an object for Client A and Client B
    When Client B lost the connection
    When Client A moved the frame to different location
    When Client B moved object within frame
    When Client B restored the connection
    Then Object is within the frame, accounting for the movements made by both clients
    Then Positions of the frame and object are the same on both clients

  Scenario: Client B moves the frame while Client A moves an item that is on the frame
    Given Board with frame containing an object for Client A and Client B
    When Client B lost the connection
    When Client A moved object within frame
    When Client B moved the frame to different location
    When Client B restored the connection
    Then Object is within the frame, accounting for the movements made by both clients
    Then Positions of the frame and object are the same on both clients

  Scenario: Client B adds an item to the frame while Client A moves the frame so that the item from Client B would not be placed on it
    Given Board with frame for Client A and Client B
    When Client B lost the connection
    When Client A moved the frame to different location
    When Client B added new object to the previous location of the frame
    When Client B restored the connection
    Then Object is on the board outside the frame
    Then Positions of the frame and object are the same on both clients

  Scenario: Client B moves the frame so that the item from Client A would not be placed on it while Client A adds an item to the frame
    Given Board with frame for Client A and Client B
    When Client B lost the connection
    When Client A added new object to the previous location of the frame
    When Client B moved the frame to different location
    When Client B restored the connection
    Then Object is on the board outside the frame
    Then Positions of the frame and object are the same on both clients

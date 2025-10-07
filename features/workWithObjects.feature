@workWithObject
Feature: Work with object

  @microboard
  Scenario: Selecting an object on board by clicking
    Given Sticker added to x: 300, y: 300
    Given Shape added to x: 400, y: 300
    Given Text added to x: 500, y: 300
    When Cursor clicked at x: 500, y: 300
    Given Text "lorem ipsum dolor" added to object number 2
    Given Connector added to x: 650, y: 300 and x: 650, y: 600
    When Cursor clicked at x: 300, y: 300
    Then "Sticker" is selected 
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 450, y: 350
    Then "Shape" is selected 
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 510, y: 310
    Then "RichText" is selected 
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 650, y: 400 twice
    Then "Connector" is selected 

  @microboard
  Scenario: Cancel selection by clicking on the board
    Given Sticker added to x: 300, y: 300
    Given Shape added to x: 400, y: 300
    Given Text added to x: 500, y: 300
    When Cursor clicked at x: 500, y: 300
    Given Text "lorem ipsum dolor" added to object number 2
    Given Connector added to x: 650, y: 300 and x: 650, y: 600
    When Cursor clicked at x: 300, y: 300
    When Cursor clicked at x: 800, y: 700 twice
    Then Objects is not selected
    Then Context panel is not visible
    When Cursor clicked at x: 400, y: 300
    When Cursor clicked at x: 800, y: 700 twice
    Then Objects is not selected 
    Then Context panel is not visible
    When Cursor clicked at x: 500, y: 300
    When Cursor clicked at x: 800, y: 700 twice
    Then Objects is not selected 
    Then Context panel is not visible
    When Cursor clicked at x: 650, y: 400
    When Cursor clicked at x: 800, y: 700 twice
    Then Objects is not selected 
    Then Context panel is not visible    

  @microboard
  Scenario: Switching from object to object
    Given Sticker added to x: 300, y: 300
    Given Shape added to x: 450, y: 300
    Given Text added to x: 600, y: 300
    When Cursor clicked at x: 600, y: 300
    Given Text "lorem ipsum dolor" added to object number 2
    Given Connector added to x: 750, y: 300 and x: 750, y: 600
    When Cursor clicked at x: 300, y: 300
    Then "Sticker" is selected 
    Then Context panel is visible
    Then 1 items are selected
    When Cursor clicked at x: 450, y: 300
    Then "Shape" is selected 
    Then Context panel is visible
    Then 1 items are selected
    Then "item-type" in context panel is visible
    Then "stroke-style" in context panel is visible
    When Cursor clicked at x: 300, y: 300
    Then "Sticker" is selected 
    Then Context panel is visible
    Then 1 items are selected
    Then "item-type" in context panel is not visible
    Then "stroke-style" in context panel is not visible
    When Cursor clicked at x: 600, y: 300
    Then "RichText" is selected 
    Then Context panel is visible
    Then 1 items are selected
    When Cursor clicked at x: 450, y: 300
    Then "Shape" is selected 
    Then Context panel is visible
    Then 1 items are selected
    Then "item-type" in context panel is visible
    Then "stroke-style" in context panel is visible
    When Cursor clicked at x: 750, y: 400
    Then "Connector" is selected 
    Then Context panel is visible    
    Then 1 items are selected
    Then "start-pointer" in context panel is visible
    Then "switch-pointers" in context panel is visible
    Then "start-pointer" in context panel is visible
    Then "connector-type" in context panel is visible
    Then "connector-add-text" in context panel is visible
    Then "item-type" in context panel is not visible
    Then "stroke-style" in context panel is not visible

  @microboard
  @activatingChangeModeByDoubleClickUnselectedObject
  Scenario: Activating change mode with double click on unselected sticker
    Given Sticker added to x: 350, y: 350
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 350, y: 350 twice
    Then Cursor index is equal: 1
    Given User typed the text: "type"
    Then Cursor index is equal: 4

  @microboard
  @activatingChangeModeByDoubleClickUnselectedObject
  Scenario: Activating change mode with double click on unselected shape
    When Cursor clicked at x: 300, y: 300
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 350, y: 350 twice
    Then Cursor index is equal: 1
    Given User typed the text: "type"
    Then Cursor index is equal: 4

  @microboard
  @activatingChangeModeByDoubleClickUnselectedObject
  Scenario: Activating change mode with double click on unselected text
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "lorem ipsum dolor" added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    Then Context panel is visible
    Then Cursor index is equal: 0
    Given User typed the text: "type"
    Then Cursor index is equal: 4

  @microboard
  @activatingChangeModeByDoubleClickUnselectedObject
  Scenario: Activating change mode with double click on unselected connector
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 450 twice
    Then Cursor index is equal: 0
    Given User typed the text: "type"
    Then Cursor index is equal: 4

  @microboard
  @activatingChangeModeByClickSelectedObject
  Scenario: Activating change mode with click on selected sticker
    Given Sticker added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Then Context panel is visible
    Then Cursor index is equal: 0
    Given User typed the text: "type"
    Then Cursor index is equal: 4

  @microboard
  @activatingChangeModeByClickSelectedObject
  Scenario: Activating change mode with click on selected shape
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 350, y: 350
    Then Context panel is visible
    Then Cursor index is equal: 0
    Given User typed the text: "type"
    Then Cursor index is equal: 4

  @microboard
  @activatingChangeModeByClickSelectedObject
  Scenario: Activating change mode with click on selected text
    Given Text added to x: 300, y: 300
    Given User typed the text: "type"
    When Cursor clicked at x: 300, y: 300
    Then Context panel is visible
    Then Cursor index is equal: 0
    Given Text "type" added to object
    Then Cursor index is equal: 8

  @microboard
  @activatingChangeModeByClickSelectedObject
  Scenario: Activating change mode with click on selected connector
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 450
    When Cursor clicked at x: 300, y: 450
    Then Context panel is visible
    Then Cursor index is equal: 0
    Given User typed the text: "type"
    Then Cursor index is equal: 4

  @microboard
  @placingCursorByDoubleClick
  Scenario: Placing cursor at click location by double clicking on sticker
    Given Sticker added to x: 350, y: 350
    Given Text "Lorem ipsum dolor sit amet, consectetur adipiscing elit" added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 305, y: 305 twice
    Then Cursor index is equal: 2
    Given User typed the text: "type"
    Then Cursor index is equal: 6

  @microboard
  @placingCursorByDoubleClick
  Scenario: Placing cursor at click location by double clicking on shape
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 350, y: 350
    Given Text "Lorem ipsum dolor sit amet, consectetur adipiscing elit" added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 310, y: 310 twice
    Then Cursor index is equal: 0
    Given User typed the text: "type"
    Then Cursor index is equal: 4

 # TODO: fix cursor position
  @microboard
  @placingCursorByDoubleClick
  Scenario: Placing cursor at click location by double clicking on text
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "Lorem ipsum dolor sit amet, consectetur adipiscing elit" added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 310, y: 310 twice
    Then Context panel is visible
    Then Cursor index is equal: 53
    Given User typed the text: "type"
    Then Cursor index is equal: 57

  @microboard
  @placingCursorByDoubleClick
  Scenario: Placing cursor at click location by double clicking on connector
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 300 twice
    Given Text "Lorem ipsum dolor sit amet, consectetur adipiscing elit" added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 400 twice
    Then Context panel is visible
    Then Cursor index is equal: 0
    Given User typed the text: "type"
    Then Cursor index is equal: 4

  @microboard
  @placingCursorByClick
  Scenario: Placing cursor at click location by clicking on sticker
    Given Sticker added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "Lorem ipsum dolor sit amet, consectetur adipiscing elit" added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 205, y: 205
    When Cursor clicked at x: 205, y: 205
    When Move cursor to end
    Then Cursor index is equal: 0
    Given User typed the text: "type"
    Then Cursor index is equal: 4

  @microboard
  @placingCursorByClick
  Scenario: Placing cursor at click location by clicking on shape
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 350, y: 350
    Given Text "Lorem ipsum dolor sit amet, consectetur adipiscing elit" added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300
    When Cursor clicked at x: 310, y: 310
    Then Context panel is visible
    Then Cursor index is equal: 0
    Given User typed the text: "type"
    Then Cursor index is equal: 4

  @microboard
  @placingCursorByClick
  Scenario: Placing cursor at click location by clicking on text
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "Lorem ipsum dolor sit amet, consectetur adipiscing elit" added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 320, y: 320
    When Cursor clicked at x: 305, y: 305
    Then Cursor index is equal: 0
    Given User typed the text: "type"
    Then Cursor index is equal: 4

  #Fix
  @microboard
  @placingCursorByClick
  Scenario: Placing cursor at click location by clicking on connector
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 300 twice
    Given Text "Lorem ipsum dolor sit amet, consectetur adipiscing elit" added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 400
    When Cursor clicked at x: 304, y: 400
    Then Cursor index is equal: 0
    Given User typed the text: "type"
    Then Cursor index is equal: 4

  @microboard
  @selectingObjectsGroup
  Scenario: Selecting a group of objects of different types
    Given Sticker added to x: 300, y: 300
    Given Shape added to x: 400, y: 300
    Given Text added to x: 500, y: 300
    When Cursor clicked at x: 500, y: 300
    Given Text "lorem ipsum dolor" added to object number 2
    Given Connector added to x: 650, y: 300 and x: 650, y: 600
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    Then "Sticker" is selected 
    Then "Shape" is selected 
    Then "RichText" is selected 
    Then "Connector" is selected 
    Then 4 items are selected
    Then "options-menu" in context panel is visible

  @microboard
  @selectingObjectsGroup
  Scenario: Selecting a group of shapes
    Given Shape added to x: 200, y: 200
    Given Shape added to x: 400, y: 300
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    Then "Shape" is selected 
    Then 2 items are selected
    Then "options-menu" in context panel is visible

  @microboard
  @selectingObjectsGroup
  Scenario: Selecting a group of texts and sticker
    Given Sticker added to x: 200, y: 300
    Given Text added to x: 400, y: 200
    When Cursor clicked at x: 400, y: 200
    Given Text "lorem ipsum dolor" added to object number 1
    When Cursor clicked at x: 700, y: 700
    Given Text added to x: 520, y: 200
    When Cursor clicked at x: 520, y: 200
    Given Text "lorem ipsum dolor" added to object number 2
    When Selecting a group start x: 150, y: 100 and end x: 700, y: 700
    Then "RichText" is selected 
    Then "Sticker" is selected 
    Then 3 items are selected
    Then "options-menu" in context panel is visible

  @microboard
  @selectingObjectsGroup
  Scenario: Selecting a group of stickers
    Given Sticker added to x: 300, y: 300
    Given Sticker added to x: 500, y: 300
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    Then "Sticker" is selected 
    Then 2 items are selected
    Then "options-menu" in context panel is visible

  @microboard
  @selectingObjectsGroup
  Scenario: Selecting a group of connectors
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    Given Connector added to x: 400, y: 300 and x: 400, y: 600
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    Then "Connector" is selected 
    Then 2 items are selected
    Then "options-menu" in context panel is visible

  @microboard
  @selectingObjectsGroup
  Scenario: Selecting a group of connectors and shape
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    Given Connector added to x: 400, y: 300 and x: 400, y: 600
    Given Shape added to x: 200, y: 200
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    Then "Connector" is selected 
    Then "Shape" is selected 
    Then 3 items are selected
    Then "options-menu" in context panel is visible

  @microboard
  @movingGroupObject
  Scenario: Moving a group of objects
    Given Sticker added to x: 300, y: 300
    Given Sticker added to x: 300, y: 500
    Given Shape added to x: 400, y: 300
    Given Shape added to x: 400, y: 500
    Given Text added to x: 500, y: 300
    When Cursor clicked at x: 500, y: 300
    Given Text "lorem ipsum dolor" added to object number 4
    When Cursor clicked at x: 700, y: 700
    Given Text added to x: 500, y: 500
    When Cursor clicked at x: 500, y: 500
    Given Text "lorem ipsum dolor" added to object number 5
    When Cursor clicked at x: 700, y: 700
    Given Connector added to x: 650, y: 300 and x: 650, y: 600
    Given Connector added to x: 690, y: 300 and x: 690, y: 600
    When Selecting a group start x: 100, y: 100 and end x: 800, y: 700
    When Moving a group of objects start x: 450, y: 500 and end x: 800, y: 700
    Then Object number 0 has coordinates x: 550 and y: 400
    Then Object number 1 has coordinates x: 550 and y: 600
    Then Object number 2 has coordinates x: 750 and y: 500
    Then Object number 3 has coordinates x: 750 and y: 700
    Then Object number 4 has coordinates x: 850 and y: 500
    Then Object number 5 has coordinates x: 850 and y: 700
    Then Object number 6 has coordinates x: 1000 and y: 501
    Then Object number 7 has coordinates x: 1040 and y: 501
    Then "Sticker" 0 has w: 200 and y: h: 200
    Then "Shape" 0 has w: 100 and y: h: 100
    Then "RichText" 0 has w: 112 and y: h: 20
    Then "Connector" 0 has w: 0 and y: h: 290
    Then "Sticker" 1 has w: 200 and y: h: 200
    Then "Shape" 1 has w: 100 and y: h: 100
    Then "RichText" 1 has w: 112 and y: h: 20
    Then "Connector" 1 has w: 0 and y: h: 290
    When Cursor clicked at x: 100, y: 100
    Then Object number 0 has coordinates x: 550 and y: 400
    Then Object number 1 has coordinates x: 550 and y: 600
    Then Object number 2 has coordinates x: 750 and y: 500
    Then Object number 3 has coordinates x: 750 and y: 700
    Then Object number 4 has coordinates x: 850 and y: 500
    Then Object number 5 has coordinates x: 850 and y: 700
    Then Object number 6 has coordinates x: 1000 and y: 501
    Then Object number 7 has coordinates x: 1040 and y: 501

  @microboard
  @dublicateObjectGroupWithConnectors
  Scenario: Duplicating group of objects with connectors
    Given Text added to x: 100, y: 200 
    When Cursor clicked at x: 100, y: 200
    Given Text "lorem ipsum dolor" added to object number 0
    Given Shape with id: "RoundedRectangle" added to x: 100, y: 450
    When Cursor clicked at x: 150, y: 500 twice
    Given Text "lorem ipsum dolor" added to object number 1
    Given User changed stroke width: 3 of shape
    Given User changed background color: "254, 244, 69"
    When Cursor clicked at x: 700, y: 700
    Given Shape with id: "Circle" added to x: 300, y: 200
    When Cursor clicked at x: 350, y: 250
    Given Text "lorem ipsum dolor" added to object number 2
    Given User changed stroke width: 6 of shape
    Given User changed background color: "255, 177, 60"
    Given Sticker added to x: 400, y: 450
    When Cursor clicked at x: 400, y: 450 twice
    Given Text "lorem ipsum dolor" added to object number 3
    Given User changed background color: "255, 233, 154"
    Given Sticker added to x: 600, y: 200
    When Cursor clicked at x: 600, y: 200 twice
    Given Text "lorem ipsum dolor" added to object number 4
    Given User changed background color: "169, 229, 187"
    Given Connector added to x: 200, y: 210 and x: 300, y: 250
    Given Connector added to x: 150, y: 220 and x: 150, y: 450
    When Cursor clicked at x: 900, y: 100
    Given Connector added to x: 350, y: 300 and x: 350, y: 350
    Given Connector added to x: 200, y: 500 and x: 300, y: 500
    Given Connector added to x: 500, y: 450 and x: 600, y: 300
    Given Connector added to x: 500, y: 200 and x: 400, y: 250
    When Selecting a group start x: 100, y: 100 and end x: 800, y: 700
    When The user presses the "Control+C" key
    When Cursor clicked at x: 750, y: 200
    When The user presses the "Control+V" key
    When Click on zoom out
    Then Text "lorem ipsum dolor" of object number 11 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 12 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 13 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 14 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 15 has been inserted in full
    Then Object number 11 has background color: "none"
    Then Object number 12 has background color: "rgb(254, 244, 69)"
    Then Object number 13 has background color: "rgb(255, 177, 60)"
    Then Object number 14 has background color: "rgb(255, 233, 154)"
    Then Object number 15 has background color: "rgb(169, 229, 187)"
    Then Object number 12 has shape type "RoundedRectangle"
    Then Object number 13 has shape type "Circle"
    Then Object number 12 has stroke width 3
    Then Object number 13 has stroke width 6
    Then Connector number 16 was duplicated to start point x: 862, y: 310 and end point x: 948, y: 350
    Then Connector number 17 was duplicated to start point x: 806, y: 320 and end point x: 800, y: 550
    Then Connector number 18 was duplicated to start point x: 1000, y: 402 and end point x: 1000, y: 450
    Then Connector number 19 was duplicated to start point x: 850, y: 600 and end point x: 950, y: 600
    Then Connector number 20 was duplicated to start point x: 1150, y: 550 and end point x: 1250, y: 400
    Then Connector number 21 was duplicated to start point x: 1150, y: 300 and end point x: 1050, y: 350
    When Cursor clicked at x: 700, y: 700
    Then Object number 11 has coordinates x: 750 and y: 300
    Then Object number 12 has coordinates x: 749 and y: 549
    Then Object number 13 has coordinates x: 947 and y: 297
    Then Object number 14 has coordinates x: 950 and y: 450
    Then Object number 15 has coordinates x: 1150 and y: 200
    Then Connector number 16 was duplicated to start point x: 862, y: 310 and end point x: 948, y: 350
    Then Connector number 17 was duplicated to start point x: 806, y: 320 and end point x: 800, y: 550
    Then Connector number 18 was duplicated to start point x: 1000, y: 402 and end point x: 1000, y: 450
    Then Connector number 19 was duplicated to start point x: 850, y: 600 and end point x: 950, y: 600
    Then Connector number 20 was duplicated to start point x: 1150, y: 550 and end point x: 1250, y: 400
    Then Connector number 21 was duplicated to start point x: 1150, y: 300 and end point x: 1050, y: 350
    When Selecting a group start x: 100, y: 100 and end x: 1100, y: 700
    When The user presses the "Control+C" key
    When Cursor clicked at x: 100, y: 700
    When The user presses the "Control+V" key
    When Click on zoom out
    When Click on zoom out
    Then Text "lorem ipsum dolor" of object number 22 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 23 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 24 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 25 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 26 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 27 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 28 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 29 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 30 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 31 has been inserted in full
    Then Object number 22 has background color: "none"
    Then Object number 23 has background color: "rgb(254, 244, 69)"
    Then Object number 24 has background color: "rgb(255, 177, 60)"
    Then Object number 25 has background color: "rgb(255, 233, 154)"
    Then Object number 26 has background color: "rgb(169, 229, 187)"
    Then Object number 27 has background color: "none"
    Then Object number 28 has background color: "rgb(254, 244, 69)"
    Then Object number 29 has background color: "rgb(255, 177, 60)"
    Then Object number 30 has background color: "rgb(255, 233, 154)"
    Then Object number 31 has background color: "rgb(169, 229, 187)"
    Then Object number 23 has shape type "RoundedRectangle"
    Then Object number 24 has shape type "Circle"
    Then Object number 28 has shape type "RoundedRectangle"
    Then Object number 29 has shape type "Circle"
    Then Object number 23 has stroke width 3
    Then Object number 24 has stroke width 6
    Then Object number 28 has stroke width 3
    Then Object number 29 has stroke width 6
    Then Connector number 32 was duplicated to start point x: 46, y: 910 and end point x: 132, y: 950
    Then Connector number 33 was duplicated to start point x: -10, y: 920 and end point x: -16, y: 1150
    Then Connector number 34 was duplicated to start point x: 184, y: 1002 and end point x: 184, y: 1050
    Then Connector number 35 was duplicated to start point x: 34, y: 1200 and end point x: 134, y: 1200
    Then Connector number 36 was duplicated to start point x: 334, y: 1150 and end point x: 434, y: 1000
    Then Connector number 37 was duplicated to start point x: 334, y: 900 and end point x: 234, y: 950
    Then Connector number 38 was duplicated to start point x: 696, y: 1010 and end point x: 782, y: 1050
    Then Connector number 39 was duplicated to start point x: 640, y: 1020 and end point x: 634, y: 1250
    Then Connector number 40 was duplicated to start point x: 834, y: 1102 and end point x: 834, y: 1150
    Then Connector number 41 was duplicated to start point x: 684, y: 1300 and end point x: 784, y: 1300    
    When Cursor clicked at x: 100, y: 650
    Then Object number 22 has coordinates x: -66 and y: 900
    Then Object number 23 has coordinates x: -68 and y: 1149
    Then Object number 24 has coordinates x: 131 and y: 897
    Then Object number 25 has coordinates x: 134 and y: 1050
    Then Object number 26 has coordinates x: 334 and y: 800
    Then Object number 27 has coordinates x: 584 and y: 1000
    Then Object number 28 has coordinates x: 582 and y: 1249
    Then Object number 29 has coordinates x: 781 and y: 997
    Then Object number 30 has coordinates x: 784 and y: 1150
    Then Object number 31 has coordinates x: 984 and y: 900
    Then Connector number 32 was duplicated to start point x: 46, y: 910 and end point x: 132, y: 950
    Then Connector number 33 was duplicated to start point x: -10, y: 920 and end point x: -16, y: 1150
    Then Connector number 34 was duplicated to start point x: 184, y: 1002 and end point x: 184, y: 1050
    Then Connector number 35 was duplicated to start point x: 34, y: 1200 and end point x: 134, y: 1200
    Then Connector number 36 was duplicated to start point x: 334, y: 1150 and end point x: 434, y: 1000
    Then Connector number 37 was duplicated to start point x: 334, y: 900 and end point x: 234, y: 950
    Then Connector number 38 was duplicated to start point x: 696, y: 1010 and end point x: 782, y: 1050
    Then Connector number 39 was duplicated to start point x: 640, y: 1020 and end point x: 634, y: 1250
    Then Connector number 40 was duplicated to start point x: 834, y: 1102 and end point x: 834, y: 1150
    Then Connector number 41 was duplicated to start point x: 684, y: 1300 and end point x: 784, y: 1300    
    When Selecting a group start x: 100, y: 100 and end x: 1200, y: 1200
    When The user presses the "Control+C" key
    When Cursor clicked at x: 900, y: 100
    When The user presses the "Control+V" key
    When Click on zoom out
    Then Text "lorem ipsum dolor" of object number 44 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 45 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 46 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 47 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 48 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 49 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 50 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 51 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 52 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 53 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 54 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 55 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 56 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 57 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 58 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 59 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 60 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 61 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 62 has been inserted in full
    Then Object number 44 has background color: "none"
    Then Object number 45 has background color: "rgb(254, 244, 69)"
    Then Object number 46 has background color: "rgb(255, 177, 60)"
    Then Object number 47 has background color: "rgb(255, 233, 154)"
    Then Object number 48 has background color: "rgb(169, 229, 187)"
    Then Object number 49 has background color: "none"
    Then Object number 50 has background color: "rgb(254, 244, 69)"
    Then Object number 51 has background color: "rgb(255, 177, 60)"
    Then Object number 52 has background color: "rgb(255, 233, 154)"
    Then Object number 53 has background color: "rgb(169, 229, 187)"
    Then Object number 54 has background color: "none"
    Then Object number 55 has background color: "rgb(254, 244, 69)"
    Then Object number 56 has background color: "rgb(255, 177, 60)"
    Then Object number 57 has background color: "rgb(255, 233, 154)"
    Then Object number 58 has background color: "rgb(169, 229, 187)"
    Then Object number 59 has background color: "none"
    Then Object number 60 has background color: "rgb(254, 244, 69)"
    Then Object number 61 has background color: "rgb(255, 177, 60)"
    Then Object number 62 has background color: "rgb(255, 233, 154)"
    Then Object number 63 has background color: "rgb(169, 229, 187)"
    Then Object number 45 has shape type "RoundedRectangle"
    Then Object number 46 has shape type "Circle"
    Then Object number 50 has shape type "RoundedRectangle"
    Then Object number 51 has shape type "Circle"
    Then Object number 55 has shape type "RoundedRectangle"
    Then Object number 56 has shape type "Circle"
    Then Object number 60 has shape type "RoundedRectangle"
    Then Object number 61 has shape type "Circle"
    Then Object number 45 has stroke width 3
    Then Object number 46 has stroke width 6
    Then Object number 50 has stroke width 3
    Then Object number 51 has stroke width 6
    Then Object number 55 has stroke width 3
    Then Object number 56 has stroke width 6
    Then Object number 60 has stroke width 3
    Then Object number 61 has stroke width 6
    Then Connector number 64 was duplicated to start point x: 1788, y: -399 and end point x: 1874, y: -359
    Then Connector number 65 was duplicated to start point x: 1732, y: -389 and end point x: 1726, y: -159
    Then Connector number 66 was duplicated to start point x: 1926, y: -307 and end point x: 1926, y: -259
    Then Connector number 67 was duplicated to start point x: 1776, y: -109 and end point x: 1876, y: -109
    Then Connector number 68 was duplicated to start point x: 2076, y: -159 and end point x: 2176, y: -309
    Then Connector number 69 was duplicated to start point x: 2076, y: -409 and end point x: 1976, y: -359
    Then Connector number 70 was duplicated to start point x: 2438, y: -299 and end point x: 2524, y: -259
    Then Connector number 71 was duplicated to start point x: 2382, y: -289 and end point x: 2376, y: -59
    Then Connector number 72 was duplicated to start point x: 2576, y: -207 and end point x: 2576, y: -159
    Then Connector number 73 was duplicated to start point x: 2426, y: -9 and end point x: 2526, y: -9
    Then Connector number 74 was duplicated to start point x: 2726, y: -59 and end point x: 2826, y: -209
    Then Connector number 75 was duplicated to start point x: 2726, y: -309 and end point x: 2626, y: -259
    Then Connector number 76 was duplicated to start point x: 1622, y: 301 and end point x: 1708, y: 341
    Then Connector number 77 was duplicated to start point x: 1566, y: 311 and end point x: 1560, y: 541
    Then Connector number 78 was duplicated to start point x: 1760, y: 393 and end point x: 1760, y: 441
    Then Connector number 79 was duplicated to start point x: 1610, y: 591 and end point x: 1710, y: 591
    Then Connector number 80 was duplicated to start point x: 1910, y: 541 and end point x: 2010, y: 391
    Then Connector number 81 was duplicated to start point x: 1910, y: 291 and end point x: 1810, y: 341
    Then Connector number 82 was duplicated to start point x: 2272, y: 401 and end point x: 2358, y: 441
    Then Connector number 83 was duplicated to start point x: 2216, y: 411 and end point x: 2210, y: 641
    Then Connector number 84 was duplicated to start point x: 2410, y: 493 and end point x: 2410, y: 541
    Then Connector number 85 was duplicated to start point x: 2260, y: 691 and end point x: 2360, y: 691
    Then Connector number 86 was duplicated to start point x: 2560, y: 641 and end point x: 2660, y: 491
    Then Connector number 87 was duplicated to start point x: 2560, y: 391 and end point x: 2460, y: 441
    When Cursor clicked at x: 100, y: 650
    Then Object number 44 has coordinates x: 1676 and y: -409
    Then Object number 45 has coordinates x: 1675 and y: -160
    Then Object number 46 has coordinates x: 1873 and y: -412
    Then Object number 47 has coordinates x: 1876 and y: -259
    Then Object number 48 has coordinates x: 2076 and y: -509
    Then Object number 49 has coordinates x: 2326 and y: -309
    Then Object number 50 has coordinates x: 2325 and y: -60
    Then Object number 51 has coordinates x: 2523 and y: -312
    Then Object number 52 has coordinates x: 2526 and y: -159
    Then Object number 53 has coordinates x: 2726 and y: -409
    Then Object number 54 has coordinates x: 1510 and y: 291
    Then Object number 55 has coordinates x: 1508 and y: 540
    Then Object number 56 has coordinates x: 1707 and y: 288
    Then Object number 57 has coordinates x: 1710 and y: 441
    Then Object number 58 has coordinates x: 1910 and y: 191
    Then Object number 59 has coordinates x: 2160 and y: 391
    Then Object number 60 has coordinates x: 2158 and y: 640
    Then Object number 61 has coordinates x: 2357 and y: 388
    Then Object number 62 has coordinates x: 2360 and y: 541
    Then Object number 63 has coordinates x: 2560 and y: 291
    Then Connector number 64 was duplicated to start point x: 1788, y: -399 and end point x: 1874, y: -359
    Then Connector number 65 was duplicated to start point x: 1732, y: -389 and end point x: 1726, y: -159
    Then Connector number 66 was duplicated to start point x: 1926, y: -307 and end point x: 1926, y: -259
    Then Connector number 67 was duplicated to start point x: 1776, y: -109 and end point x: 1876, y: -109
    Then Connector number 68 was duplicated to start point x: 2076, y: -159 and end point x: 2176, y: -309
    Then Connector number 69 was duplicated to start point x: 2076, y: -409 and end point x: 1976, y: -359
    Then Connector number 70 was duplicated to start point x: 2438, y: -299 and end point x: 2524, y: -259
    Then Connector number 71 was duplicated to start point x: 2382, y: -289 and end point x: 2376, y: -59
    Then Connector number 72 was duplicated to start point x: 2576, y: -207 and end point x: 2576, y: -159
    Then Connector number 73 was duplicated to start point x: 2426, y: -9 and end point x: 2526, y: -9
    Then Connector number 74 was duplicated to start point x: 2726, y: -59 and end point x: 2826, y: -209
    Then Connector number 75 was duplicated to start point x: 2726, y: -309 and end point x: 2626, y: -259
    Then Connector number 76 was duplicated to start point x: 1622, y: 301 and end point x: 1708, y: 341
    Then Connector number 77 was duplicated to start point x: 1566, y: 311 and end point x: 1560, y: 541
    Then Connector number 78 was duplicated to start point x: 1760, y: 393 and end point x: 1760, y: 441
    Then Connector number 79 was duplicated to start point x: 1610, y: 591 and end point x: 1710, y: 591
    Then Connector number 80 was duplicated to start point x: 1910, y: 541 and end point x: 2010, y: 391
    Then Connector number 81 was duplicated to start point x: 1910, y: 291 and end point x: 1810, y: 341
    Then Connector number 82 was duplicated to start point x: 2272, y: 401 and end point x: 2358, y: 441
    Then Connector number 83 was duplicated to start point x: 2216, y: 411 and end point x: 2210, y: 641
    Then Connector number 84 was duplicated to start point x: 2410, y: 493 and end point x: 2410, y: 541
    Then Connector number 85 was duplicated to start point x: 2260, y: 691 and end point x: 2360, y: 691
    Then Connector number 86 was duplicated to start point x: 2560, y: 641 and end point x: 2660, y: 491
    Then Connector number 87 was duplicated to start point x: 2560, y: 391 and end point x: 2460, y: 441
    When Click on zoom in
    When Click on zoom in
    When Click on zoom in
    When Click on zoom in

  @dublicateObjectGroupWithConnectors
  Scenario: Duplicating group of objects with connectors
    Given Shape added to x: 100, y: 450
    When Cursor clicked at x: 150, y: 500 twice
    Given Text "lorem ipsum dolor" added to object number 0
    Given User changed stroke width: 3 of shape
    Given User changed background color: "2291FF"
    Given Shape with id: "Circle" added to x: 300, y: 200
    When Cursor clicked at x: 350, y: 250
    Given Text "lorem ipsum dolor" added to object number 1
    Given User changed stroke width: 6 of shape
    Given User changed background color: "FFBE00"
    Given Text added to x: 100, y: 200 
    When Cursor clicked at x: 100, y: 200
    Given Text "lorem ipsum dolor" added to object
    Given Sticker added to x: 400, y: 450
    When Cursor clicked at x: 400, y: 450 twice
    Given Text "lorem ipsum dolor" added to object
    Given User changed background color: "FCF5AE"
    Given Sticker added to x: 600, y: 200
    When Cursor clicked at x: 600, y: 200 twice
    Given Text "lorem ipsum dolor" added to object
    Given User changed background color: "AFD6A7"
    Given Connector added to x: 200, y: 210 and x: 300, y: 250
    Given Connector added to x: 150, y: 220 and x: 150, y: 450
    When Cursor clicked at x: 900, y: 100
    Given Connector added to x: 350, y: 300 and x: 350, y: 350
    Given Connector added to x: 200, y: 500 and x: 300, y: 500
    Given Connector added to x: 500, y: 450 and x: 600, y: 300
    Given Connector added to x: 500, y: 200 and x: 400, y: 250
    When Selecting a group start x: 100, y: 100 and end x: 800, y: 700
    When The user presses the "Control+C" key
    When Cursor clicked at x: 750, y: 200
    When The user presses the "Control+V" key
    When Click on zoom out
    Then Text "lorem ipsum dolor" of object number 11 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 12 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 13 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 14 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 15 has been inserted in full
    Then Object number 11 has background color: "#2291FF"
    Then Object number 12 has background color: "#FFBE00"
    Then Object number 13 has background color: "none"
    Then Object number 14 has background color: "#FCF5AE"
    Then Object number 15 has background color: "#AFD6A7"
    Then Object number 11 has shape type "Rectangle"
    Then Object number 12 has shape type "Circle"
    Then Object number 11 has stroke width 3
    Then Object number 12 has stroke width 6
    Then Connector number 16 was duplicated to start point x: 862, y: 310 and end point x: 948, y: 350
    Then Connector number 17 was duplicated to start point x: 806, y: 320 and end point x: 800, y: 550
    Then Connector number 18 was duplicated to start point x: 1000, y: 400 and end point x: 1000, y: 450
    Then Connector number 19 was duplicated to start point x: 850, y: 600 and end point x: 950, y: 600
    Then Connector number 20 was duplicated to start point x: 1150, y: 550 and end point x: 1250, y: 400
    Then Connector number 21 was duplicated to start point x: 1150, y: 300 and end point x: 1050, y: 350
    When Cursor clicked at x: 700, y: 700
    Then Object number 11 has coordinates x: 749 and y: 549
    Then Object number 12 has coordinates x: 947 and y: 296
    Then Object number 13 has coordinates x: 750 and y: 300
    Then Object number 14 has coordinates x: 950 and y: 450
    Then Object number 15 has coordinates x: 1150 and y: 200
    Then Connector number 16 was duplicated to start point x: 862, y: 310 and end point x: 948, y: 350
    Then Connector number 17 was duplicated to start point x: 806, y: 320 and end point x: 800, y: 550
    Then Connector number 18 was duplicated to start point x: 1000, y: 400 and end point x: 1000, y: 450
    Then Connector number 19 was duplicated to start point x: 850, y: 600 and end point x: 950, y: 600
    Then Connector number 20 was duplicated to start point x: 1150, y: 550 and end point x: 1250, y: 400
    Then Connector number 21 was duplicated to start point x: 1150, y: 300 and end point x: 1050, y: 350
    When Selecting a group start x: 100, y: 100 and end x: 1100, y: 700
    When The user presses the "Control+C" key
    When Cursor clicked at x: 100, y: 700
    When The user presses the "Control+V" key
    When Click on zoom out
    When Click on zoom out
    Then Text "lorem ipsum dolor" of object number 22 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 23 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 24 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 25 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 26 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 27 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 28 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 29 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 30 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 31 has been inserted in full
    Then Object number 22 has background color: "#2291FF"
    Then Object number 23 has background color: "#FFBE00"
    Then Object number 24 has background color: "none"
    Then Object number 25 has background color: "#FCF5AE"
    Then Object number 26 has background color: "#AFD6A7"
    Then Object number 27 has background color: "#2291FF"
    Then Object number 28 has background color: "#FFBE00"
    Then Object number 29 has background color: "none"
    Then Object number 30 has background color: "#FCF5AE"
    Then Object number 31 has background color: "#AFD6A7"
    Then Object number 22 has shape type "Rectangle"
    Then Object number 23 has shape type "Circle"
    Then Object number 27 has shape type "Rectangle"
    Then Object number 28 has shape type "Circle"
    Then Object number 22 has stroke width 3
    Then Object number 23 has stroke width 6
    Then Object number 27 has stroke width 3
    Then Object number 28 has stroke width 6
    Then Connector number 32 was duplicated to start point x: 45, y: 910 and end point x: 132, y: 950
    Then Connector number 33 was duplicated to start point x: -10, y: 920 and end point x: -16, y: 1150
    Then Connector number 34 was duplicated to start point x: 184, y: 1000 and end point x: 183, y: 1050
    Then Connector number 35 was duplicated to start point x: 34, y: 1200 and end point x: 134, y: 1200
    Then Connector number 36 was duplicated to start point x: 334, y: 1150 and end point x: 434, y: 1000
    Then Connector number 37 was duplicated to start point x: 334, y: 900 and end point x: 234, y: 950
    Then Connector number 38 was duplicated to start point x: 696, y: 1010 and end point x: 782, y: 1050
    Then Connector number 39 was duplicated to start point x: 640, y: 1020 and end point x: 634, y: 1250
    Then Connector number 40 was duplicated to start point x: 834, y: 1102 and end point x: 834, y: 1150
    Then Connector number 41 was duplicated to start point x: 684, y: 1300 and end point x: 784, y: 1300    
    When Cursor clicked at x: 100, y: 650
    Then Object number 22 has coordinates x: -68 and y: 1149
    Then Object number 23 has coordinates x: 131 and y: 896
    Then Object number 24 has coordinates x: -66 and y: 900
    Then Object number 25 has coordinates x: 134 and y: 1050
    Then Object number 26 has coordinates x: 334 and y: 800
    Then Object number 27 has coordinates x: 582 and y: 1249
    Then Object number 28 has coordinates x: 781 and y: 996
    Then Object number 29 has coordinates x: 584 and y: 1000
    Then Object number 30 has coordinates x: 784 and y: 1150
    Then Object number 31 has coordinates x: 984 and y: 900
    Then Connector number 32 was duplicated to start point x: 45, y: 910 and end point x: 132, y: 950
    Then Connector number 33 was duplicated to start point x: -10, y: 920 and end point x: -16, y: 1150
    Then Connector number 34 was duplicated to start point x: 184, y: 1000 and end point x: 183, y: 1050
    Then Connector number 35 was duplicated to start point x: 34, y: 1200 and end point x: 134, y: 1200
    Then Connector number 36 was duplicated to start point x: 334, y: 1150 and end point x: 434, y: 1000
    Then Connector number 37 was duplicated to start point x: 334, y: 900 and end point x: 234, y: 950
    Then Connector number 38 was duplicated to start point x: 696, y: 1010 and end point x: 782, y: 1050
    Then Connector number 39 was duplicated to start point x: 640, y: 1020 and end point x: 634, y: 1250
    Then Connector number 40 was duplicated to start point x: 834, y: 1102 and end point x: 834, y: 1150
    Then Connector number 41 was duplicated to start point x: 684, y: 1300 and end point x: 784, y: 1300    
    When Selecting a group start x: 100, y: 100 and end x: 1200, y: 1200
    When The user presses the "Control+C" key
    When Cursor clicked at x: 900, y: 100
    When The user presses the "Control+V" key
    When Click on zoom out
    Then Text "lorem ipsum dolor" of object number 44 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 45 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 46 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 47 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 48 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 49 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 50 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 51 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 52 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 53 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 54 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 55 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 56 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 57 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 58 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 59 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 60 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 61 has been inserted in full
    Then Text "lorem ipsum dolor" of object number 62 has been inserted in full
    Then Object number 44 has background color: "#2291FF"
    Then Object number 45 has background color: "#FFBE00"
    Then Object number 46 has background color: "none"
    Then Object number 47 has background color: "#FCF5AE"
    Then Object number 48 has background color: "#AFD6A7"
    Then Object number 49 has background color: "#2291FF"
    Then Object number 50 has background color: "#FFBE00"
    Then Object number 51 has background color: "none"
    Then Object number 52 has background color: "#FCF5AE"
    Then Object number 53 has background color: "#AFD6A7"
    Then Object number 54 has background color: "#2291FF"
    Then Object number 55 has background color: "#FFBE00"
    Then Object number 56 has background color: "none"
    Then Object number 57 has background color: "#FCF5AE"
    Then Object number 58 has background color: "#AFD6A7"
    Then Object number 59 has background color: "#2291FF"
    Then Object number 60 has background color: "#FFBE00"
    Then Object number 61 has background color: "none"
    Then Object number 62 has background color: "#FCF5AE"
    Then Object number 63 has background color: "#AFD6A7"
    Then Object number 44 has shape type "Rectangle"
    Then Object number 45 has shape type "Circle"
    Then Object number 49 has shape type "Rectangle"
    Then Object number 50 has shape type "Circle"
    Then Object number 54 has shape type "Rectangle"
    Then Object number 55 has shape type "Circle"
    Then Object number 59 has shape type "Rectangle"
    Then Object number 60 has shape type "Circle"
    Then Object number 44 has stroke width 3
    Then Object number 45 has stroke width 6
    Then Object number 49 has stroke width 3
    Then Object number 50 has stroke width 6
    Then Object number 54 has stroke width 3
    Then Object number 55 has stroke width 6
    Then Object number 59 has stroke width 3
    Then Object number 60 has stroke width 6
    Then Connector number 64 was duplicated to start point x: 1788, y: -399 and end point x: 1874, y: -359
    Then Connector number 65 was duplicated to start point x: 1732, y: -389 and end point x: 1726, y: -159
    Then Connector number 66 was duplicated to start point x: 1926, y: -307 and end point x: 1926, y: -259
    Then Connector number 67 was duplicated to start point x: 1776, y: -109 and end point x: 1876, y: -109
    Then Connector number 68 was duplicated to start point x: 2076, y: -159 and end point x: 2176, y: -309
    Then Connector number 69 was duplicated to start point x: 2076, y: -409 and end point x: 1976, y: -359
    Then Connector number 70 was duplicated to start point x: 2438, y: -299 and end point x: 2524, y: -259
    Then Connector number 71 was duplicated to start point x: 2382, y: -289 and end point x: 2376, y: -59
    Then Connector number 72 was duplicated to start point x: 2576, y: -207 and end point x: 2576, y: -159
    Then Connector number 73 was duplicated to start point x: 2426, y: -9 and end point x: 2526, y: -9
    Then Connector number 74 was duplicated to start point x: 2726, y: -59 and end point x: 2826, y: -209
    Then Connector number 75 was duplicated to start point x: 2726, y: -309 and end point x: 2626, y: -259
    Then Connector number 76 was duplicated to start point x: 1622, y: 301 and end point x: 1708, y: 341
    Then Connector number 77 was duplicated to start point x: 1566, y: 311 and end point x: 1560, y: 541
    Then Connector number 78 was duplicated to start point x: 1760, y: 393 and end point x: 1760, y: 441
    Then Connector number 79 was duplicated to start point x: 1610, y: 591 and end point x: 1710, y: 591
    Then Connector number 80 was duplicated to start point x: 1910, y: 541 and end point x: 2010, y: 391
    Then Connector number 81 was duplicated to start point x: 1910, y: 291 and end point x: 1810, y: 341
    Then Connector number 82 was duplicated to start point x: 2272, y: 401 and end point x: 2358, y: 441
    Then Connector number 83 was duplicated to start point x: 2216, y: 411 and end point x: 2210, y: 641
    Then Connector number 84 was duplicated to start point x: 2410, y: 493 and end point x: 2410, y: 541
    Then Connector number 85 was duplicated to start point x: 2260, y: 691 and end point x: 2360, y: 691
    Then Connector number 86 was duplicated to start point x: 2560, y: 641 and end point x: 2660, y: 491
    Then Connector number 87 was duplicated to start point x: 2560, y: 391 and end point x: 2460, y: 441
    When Cursor clicked at x: 100, y: 650
    Then Object number 44 has coordinates x: 1675 and y: -160
    Then Object number 45 has coordinates x: 1873 and y: -413
    Then Object number 46 has coordinates x: 1676 and y: -409
    Then Object number 47 has coordinates x: 1876 and y: -259
    Then Object number 48 has coordinates x: 2076 and y: -509
    Then Object number 49 has coordinates x: 2325 and y: -60
    Then Object number 50 has coordinates x: 2523 and y: -313
    Then Object number 51 has coordinates x: 2326 and y: -309
    Then Object number 52 has coordinates x: 2526 and y: -159
    Then Object number 53 has coordinates x: 2726 and y: -409
    Then Object number 54 has coordinates x: 1508 and y: 540
    Then Object number 55 has coordinates x: 1707 and y: 287
    Then Object number 56 has coordinates x: 1510 and y: 291
    Then Object number 57 has coordinates x: 1710 and y: 441
    Then Object number 58 has coordinates x: 1910 and y: 191
    Then Object number 59 has coordinates x: 2158 and y: 640
    Then Object number 60 has coordinates x: 2357 and y: 387
    Then Object number 61 has coordinates x: 2160 and y: 391
    Then Object number 62 has coordinates x: 2360 and y: 541
    Then Object number 63 has coordinates x: 2560 and y: 291
    Then Connector number 64 was duplicated to start point x: 1788, y: -399 and end point x: 1874, y: -359
    Then Connector number 65 was duplicated to start point x: 1732, y: -389 and end point x: 1726, y: -159
    Then Connector number 66 was duplicated to start point x: 1926, y: -307 and end point x: 1926, y: -259
    Then Connector number 67 was duplicated to start point x: 1776, y: -109 and end point x: 1876, y: -109
    Then Connector number 68 was duplicated to start point x: 2076, y: -159 and end point x: 2176, y: -309
    Then Connector number 69 was duplicated to start point x: 2076, y: -409 and end point x: 1976, y: -359
    Then Connector number 70 was duplicated to start point x: 2438, y: -299 and end point x: 2524, y: -259
    Then Connector number 71 was duplicated to start point x: 2382, y: -289 and end point x: 2376, y: -59
    Then Connector number 72 was duplicated to start point x: 2576, y: -207 and end point x: 2576, y: -159
    Then Connector number 73 was duplicated to start point x: 2426, y: -9 and end point x: 2526, y: -9
    Then Connector number 74 was duplicated to start point x: 2726, y: -59 and end point x: 2826, y: -209
    Then Connector number 75 was duplicated to start point x: 2726, y: -309 and end point x: 2626, y: -259
    Then Connector number 76 was duplicated to start point x: 1622, y: 301 and end point x: 1708, y: 341
    Then Connector number 77 was duplicated to start point x: 1566, y: 311 and end point x: 1560, y: 541
    Then Connector number 78 was duplicated to start point x: 1760, y: 393 and end point x: 1760, y: 441
    Then Connector number 79 was duplicated to start point x: 1610, y: 591 and end point x: 1710, y: 591
    Then Connector number 80 was duplicated to start point x: 1910, y: 541 and end point x: 2010, y: 391
    Then Connector number 81 was duplicated to start point x: 1910, y: 291 and end point x: 1810, y: 341
    Then Connector number 82 was duplicated to start point x: 2272, y: 401 and end point x: 2358, y: 441
    Then Connector number 83 was duplicated to start point x: 2216, y: 411 and end point x: 2210, y: 641
    Then Connector number 84 was duplicated to start point x: 2410, y: 493 and end point x: 2410, y: 541
    Then Connector number 85 was duplicated to start point x: 2260, y: 691 and end point x: 2360, y: 691
    Then Connector number 86 was duplicated to start point x: 2560, y: 641 and end point x: 2660, y: 491
    Then Connector number 87 was duplicated to start point x: 2560, y: 391 and end point x: 2460, y: 441
    When Click on zoom in
    When Click on zoom in
    When Click on zoom in
    When Click on zoom in

  @microboard
  @dublicateObjectWithBigText
  Scenario: Duplicating sticker with big text
    Given Sticker added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300 twice
    Given Text "The quick, brown fox jumps over a lazy dog. " added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "TTThe quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300
    When Cursor clicked at x: 300, y: 300 twice
    Then Text "The quick, brown fox jumps over a lazy dog. Two driven jocks help fax my big quiz.TTThe quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog." of object number 0 has been inserted in full
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text alignment on "left" by app
    When User changed text color on "rgb(255, 177, 60)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When Cursor clicked at x: 700, y: 700
    When The user presses the "Control+A" key
    When The user presses the "Control+D" key
    Then Text "The quick, brown fox jumps over a lazy dog. Two driven jocks help fax my big quiz.TTThe quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog." of object number 0 has been inserted in full
    Then Object with number: 1 has a paragraph: 0 with text alignment: "left"
    Then Object with number: 1 has a paragraph: 2 with text alignment: "center"
    Then Object with number: 1 has a paragraph: 4 with text alignment: "center"
    Then Object with number: 1 has a paragraph: 0 with text color: "rgb(255, 177, 60)"
    Then Object with number: 1 has a paragraph: 2 with text color: "black"
    Then Object with number: 1 has a paragraph: 4 with text color: "black"
    Then Object with number: 1 has a paragraph: 0 with text highlight color: "rgb(255, 255, 255)"
    Then Object with number: 1 has a paragraph: 2 with text highlight color: ""
    Then Object with number: 1 has a paragraph: 4 with text highlight color: ""
    When Cursor clicked at x: 700, y: 700
    Then Text "The quick, brown fox jumps over a lazy dog. Two driven jocks help fax my big quiz.TTThe quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog." of object number 0 has been inserted in full

  @microboard
  @dublicateObjectWithBigText
  Scenario: Duplicating text with big text
    Given Text added to x: 300, y: 400
    When Cursor clicked at x: 300, y: 400
    Given Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "TTThe quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 400 twice
    Then Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex.Two driven jocks help fax my big quiz.TTThe quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex." of object number 0 has been inserted in full
    Then Panel is near item and item has a cursor
    When User selected paragraph 2
    When User changed text alignment on "center" by app
    When User changed text color on "rgb(255, 177, 60)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When Cursor clicked at x: 200, y: 200
    When The user presses the "Control+A" key
    When The user presses the "Control+D" key
    Then Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex.Two driven jocks help fax my big quiz.TTThe quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex." of object number 1 has been inserted in full
    Then Object with number: 1 has a paragraph: 0 with text alignment: "center"
    Then Object with number: 1 has a paragraph: 2 with text alignment: "left"
    Then Object with number: 1 has a paragraph: 4 with text alignment: "center"
    Then Object with number: 1 has a paragraph: 0 with text color: "black"
    Then Object with number: 1 has a paragraph: 2 with text color: "rgb(255, 177, 60)"
    Then Object with number: 1 has a paragraph: 4 with text color: "black"
    Then Object with number: 1 has a paragraph: 0 with text highlight color: ""
    Then Object with number: 1 has a paragraph: 2 with text highlight color: "rgb(255, 255, 255)"
    Then Object with number: 1 has a paragraph: 4 with text highlight color: ""
    When Cursor clicked at x: 700, y: 700
    Then Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex.Two driven jocks help fax my big quiz.TTThe quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex." of object number 1 has been inserted in full

  @microboard
  @dublicateObjectWithBigText
  Scenario: Duplicating shape with big text
    Given Shape added to x: 300, y: 400
    When Cursor clicked at x: 350, y: 450
    Given Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 350, y: 450 twice
    Then Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex.Two driven jocks help fax my big quiz.my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." of object number 0 has been inserted in full
    Then Panel is near item and item has a cursor
    When User selected paragraph 2
    When User changed text alignment on "center" by app
    When User changed text color on "rgb(255, 177, 60)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When Cursor clicked at x: 200, y: 200
    When The user presses the "Control+A" key
    When The user presses the "Control+D" key
    Then Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex.Two driven jocks help fax my big quiz.my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." of object number 1 has been inserted in full
    Then Object with number: 1 has a paragraph: 0 with text alignment: "center"
    Then Object with number: 1 has a paragraph: 2 with text alignment: "left"
    Then Object with number: 1 has a paragraph: 4 with text alignment: "center"
    Then Object with number: 1 has a paragraph: 0 with text color: "black"
    Then Object with number: 1 has a paragraph: 2 with text color: "rgb(255, 177, 60)"
    Then Object with number: 1 has a paragraph: 4 with text color: "black"
    Then Object with number: 1 has a paragraph: 0 with text highlight color: ""
    Then Object with number: 1 has a paragraph: 2 with text highlight color: "rgb(255, 255, 255)"
    Then Object with number: 1 has a paragraph: 4 with text highlight color: ""
    When Cursor clicked at x: 700, y: 700
    Then Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex.Two driven jocks help fax my big quiz.my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." of object number 1 has been inserted in full

  @microboard
  @dublicateObjectWithBigText
  Scenario: Duplicating connector with big text
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 350 twice
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 350 twice
    Then Text "The quick, brown fox jumps over a lazy dog.Two driven jocks help fax my big quiz.DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps." of object number 0 has been inserted in full
    Then Panel is near item and item has a cursor
    When User selected paragraph 2
    When User changed text alignment on "center" by app
    When User changed text style on "bold" by app
    Then Paragraph text number: 2 has text style: "bold"
    When User changed text color on "rgb(255, 177, 60)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When Cursor clicked at x: 200, y: 200
    When The user presses the "Control+A" key
    When The user presses the "Control+D" key
    Then Text "The quick, brown fox jumps over a lazy dog.Two driven jocks help fax my big quiz.DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps." of object number 1 has been inserted in full
    Then Object with number: 1 has a paragraph: 0 with text alignment: "center"
    Then Object with number: 1 has a paragraph: 2 with text alignment: "left"
    Then Object with number: 1 has a paragraph: 4 with text alignment: "center"
    Then Object with number: 1 has a paragraph: 2 with text style: "bold"
    Then Object with number: 1 hasnt a paragraph: 0 with text styles
    Then Object with number: 1 hasnt a paragraph: 4 with text styles
    Then Object with number: 1 has a paragraph: 0 with text color: "black"
    Then Object with number: 1 has a paragraph: 2 with text color: "rgb(255, 177, 60)"
    Then Object with number: 1 has a paragraph: 4 with text color: "black"
    Then Object with number: 1 has a paragraph: 0 with text highlight color: ""
    Then Object with number: 1 has a paragraph: 2 with text highlight color: "rgb(255, 255, 255)"
    Then Object with number: 1 has a paragraph: 4 with text highlight color: ""
    When Cursor clicked at x: 700, y: 700
    Then Text "The quick, brown fox jumps over a lazy dog.Two driven jocks help fax my big quiz.DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps." of object number 1 has been inserted in full

  @microboard
  @checkingCursorPositionZooming
  Scenario: Checking cursor position when zooming in <object>
    Given <object> added to x: 300, y: 300
    Given Text "text" added to object
    Then Panel is near item and item has a cursor
    Then Cursor doesnt move outside object
    When The user presses the "Control+-" key
    Then Cursor doesnt move outside object
    When The user presses the "Control+=" key
    Then Cursor doesnt move outside object
    Given User typed the text: "text"
    Then Cursor doesnt move outside object
    Examples:
    | object  |
    | Sticker |
    | Shape   |
    | Text    |

  @microboard
  @checkingCursorPositionZooming
  Scenario: Checking cursor position when zooming in Connector
    Given Connector added to x: 450, y: 300 and x: 450, y: 600
    When Cursor clicked at x: 450, y: 400 twice
    Given Text "text" added to object
    Then Panel is near item and item has a cursor
    Then Cursor doesnt move outside object
    When The user presses the "Control+-" key
    Then Cursor doesnt move outside object
    When The user presses the "Control+=" key
    Then Cursor doesnt move outside object
    Given User typed the text: "text"
    Then Cursor doesnt move outside object
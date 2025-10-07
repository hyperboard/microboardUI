@textMarkerColor
Feature: Changing text highlight color

  @microboard
  Scenario: Changing text highlight color on <colorName> in sticker
    Given Sticker added to x: 300, y: 300
    Given Text "text" added to object
    When Cursor clicked at x: 700, y: 700
    When The user presses the "Control+A" key
    When User changed text highlight color on "<color>"
    Then Text highlight color changed on "<rbgColor>"
    Then Text highlight color changed on the panel on "<rbgColor>"   
    When Cursor clicked at x: 700, y: 700
    Then Text highlight color changed on "<rbgColor>"
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "<rbgColor>"
    Examples: 
    | color         | rbgColor           | colorName       |
    | 255, 255, 255 | rgb(255, 255, 255) | white           |
    | 254, 244, 69  | rgb(254, 244, 69)  | mustard yellow  |

  @microboard
  Scenario: Changing text highlight color on <colorName> in shape
    When Cursor clicked at x: 300, y: 300
    Given Shape added to x: 300, y: 300
    Given Text "text" added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 350, y: 350
    When The user presses the "Control+A" key
    When User changed text highlight color on "<color>"
    Then Text highlight color changed on "<rbgColor>"
    Then Text highlight color changed on the panel on "<rbgColor>"   
    When Cursor clicked at x: 700, y: 700
    Then Text highlight color changed on "<rbgColor>"
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "<rbgColor>"
    Examples: 
    | color         | rbgColor           | colorName       |
    | 255, 255, 255 | rgb(255, 255, 255) | white           |
    | 254, 244, 69  | rgb(254, 244, 69)  | mustard yellow  |

  @microboard
  Scenario: Changing text highlight color on <colorName> in text
    When Cursor clicked at x: 300, y: 300
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "text" added to object
    When Cursor clicked at x: 700, y: 700
    When The user presses the "Control+A" key
    When Cursor clicked at x: 310, y: 310
    When User changed text highlight color on "<color>"
    Then Text highlight color changed on "<rbgColor>"
    Then Text highlight color changed on the panel on "<rbgColor>"   
    When Cursor clicked at x: 700, y: 700
    Then Text highlight color changed on "<rbgColor>"
    When Cursor clicked at x: 300, y: 300
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "<rbgColor>"
    Examples: 
    | color         | rbgColor           | colorName       |
    | 255, 255, 255 | rgb(255, 255, 255) | white           |
    | 254, 244, 69  | rgb(254, 244, 69)  | mustard yellow  |

  @microboard
  Scenario: Changing text highlight color on <colorName> in connector
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 450 twice
    Given Text "text" added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 500
    When User changed text highlight color on "<color>"
    Then Text highlight color changed on "<rbgColor>"
    Then Text highlight color changed on the panel on "<rbgColor>"   
    When Cursor clicked at x: 700, y: 700
    Then Text highlight color changed on "<rbgColor>"
    When Cursor clicked at x: 300, y: 400
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "<rbgColor>"
    Examples: 
    | color         | rbgColor           | colorName       |
    | 255, 255, 255 | rgb(255, 255, 255) | white           |
    | 254, 244, 69  | rgb(254, 244, 69)  | mustard yellow  |
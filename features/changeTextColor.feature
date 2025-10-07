@textColor
Feature: Changing text color

  @microboard @textColor
  Scenario: Changing text color on <colorName> in sticker
    Given Sticker added to x: 300, y: 300
    Given Text "text" added to object
    When Cursor clicked at x: 700, y: 700
    When The user presses the "Control+A" key
    When User changed text color on "<color>"
    Then Text color changed on "<rbgColor>"
    Then Text color changed on the panel on "<rbgColor>"
    When Cursor clicked at x: 700, y: 700
    Then Text color changed on "<rbgColor>"
    When The user presses the "Control+A" key
    Then Text color changed on the panel on "<rbgColor>"

    Examples:
      | color         | rbgColor             | colorName      |
      | 255, 255, 255 | rgb(255, 255, 255) | white          |
      |  254, 244, 69 | rgb(254, 244, 69)  | mustard yellow |

  @microboard @textColor
  Scenario: Changing text color on <colorName> in shape
    Given Shape added to x: 300, y: 300
    Given Text "text" added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 350, y: 350
    When The user presses the "Control+A" key
    When User changed text color on "<color>"
    Then Text color changed on "<rbgColor>"
    Then Text color changed on the panel on "<rbgColor>"
    When Cursor clicked at x: 700, y: 700
    Then Text color changed on "<rbgColor>"
    When The user presses the "Control+A" key
    Then Text color changed on the panel on "<rbgColor>"

    Examples:
      | color         | rbgColor             | colorName      |
      | 255, 255, 255 | rgb(255, 255, 255) | white          |
      |  254, 244, 69 | rgb(254, 244, 69)  | mustard yellow |

  @microboard @textColor
  Scenario: Changing text color on <colorName> in text
    When Cursor clicked at x: 300, y: 300
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "text" added to object
    When Cursor clicked at x: 700, y: 700
    When The user presses the "Control+A" key
    Then Context panel is visible
    When User changed text color on "<color>"
    Then Text color changed on "<rbgColor>"
    Then Text color changed on the panel on "<rbgColor>"
    When Cursor clicked at x: 700, y: 700
    Then Text color changed on "<rbgColor>"
    When The user presses the "Control+A" key
    Then Text color changed on the panel on "<rbgColor>"

    Examples:
      | color         | rbgColor             | colorName      |
      | 255, 255, 255 | rgb(255, 255, 255) | white          |
      |  254, 244, 69 | rgb(254, 244, 69)  | mustard yellow |

  @microboard @textColor
  Scenario: Changing text color on <colorName> in connector
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 450 twice
    Given Text "text" added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 450
    When The user presses the "Control+A" key
    When User changed text color on "<color>"
    Then Text color changed on "<rbgColor>"
    Then Text color changed on the panel on "<rbgColor>"
    When Cursor clicked at x: 700, y: 700
    Then Text color changed on "<rbgColor>"
    When The user presses the "Control+A" key
    Then Text color changed on the panel on "<rbgColor>"

    Examples:
      | color         | rbgColor             | colorName      |
      |  254, 244, 69 | rgb(254, 244, 69)  | mustard yellow |
      | 255, 255, 255 | rgb(255, 255, 255) | white          |
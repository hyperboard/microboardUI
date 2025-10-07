@sync
@singleNodeLine
Feature: Working in a single node-line

  Scenario: Client B types text in a line with more indentation than client A
    Given Board with text "привет мир" at client A and B
    When Client B lost the connection
    When Client A inserted "," after text "привет"
    When Client B inserted "!" after text "привет мир"
    When Client B restored the connection
    Then The text is the same on both clients 
    Then The text on both clients is: "привет, мир!"

  Scenario: Client B types text in a line with less indentation than client A
    Given Board with text "привет мир" at client A and B
    When Client B lost the connection
    When Client A inserted "!" after text "привет мир"
    When Client B inserted "," after text "привет"
    When Client B restored the connection
    Then The text is the same on both clients
    Then The text on both clients is: "привет, мир!"

  Scenario: Client B types text inside part of the string that client A deletes
    Given Board with text "привет мир" at client A and B
    When Client B lost the connection
    When Client A deleted the last word "мир"
    When Client B typed "добрый" after word "привет"
    When Client B restored the connection
    Then The text is the same on both clients
    Then The text on both clients is: "привет добрый"

  Scenario: Client B deletes text inside part of the string that client A types
    Given Board with text "привет мир" at client A and B
    When Client B lost the connection
    When Client A typed "добрый " after word "привет"
    When Client B deleted the last word "мир"
    When Client B restored the connection
    Then The text is the same on both clients
    Then The text on both clients is: "привет добрый "
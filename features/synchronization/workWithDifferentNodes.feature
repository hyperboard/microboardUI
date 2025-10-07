@sync
@differentNodeLine
Feature: Working with different nodes in a single line

  Scenario: Client B splits the second node into two while Client A deletes the first node
    Given Board with the text "привет мир" for clients A and B
    Given Added text "мир" in "Bold" style in "привет " for clients A and B
    When Client B lost the connection
    When Client A deleted the first word "привет "
    When Client B inserted " добрый" after text "привет мир"
    When Client B restored the connection
    Then The text is the same on both clients
    Then The text on both clients is: "мир добрый"
    Then The text on both clients has "мир" text in bold style

  Scenario: Client B deletes the first node while Client A splits the second node into two
    Given Board with the text "привет мир" for clients A and B
    Given Added text "мир" in "Bold" style in "привет " for clients A and B
    When Client B lost the connection
    When Client B deleted the first word "привет "
    When Client A inserted " добрый" after text "привет мир"
    When Client B restored the connection
    Then The text is the same on both clients
    Then The text on both clients is: "мир добрый"
    Then The text on both clients has "мир" text in bold style

  Scenario: Client B inserts text into one of the nodes while Client A deletes it
    Given Board with the text "привет мир" for clients A and B
    Given Added text "мир" in "Bold" style in "привет " for clients A and B
    When Client B lost the connection
    When Client A deleted the last word "мир"
    When Client B inserted "добрый" after text "привет "
    When Client B restored the connection
    Then The text is the same on both clients
    Then The text on both clients is: "привет добрый"
    Then The text on both clients has "добрый" text in bold style

  Scenario: Client B deletes text into one of the nodes while Client A inserts it
    Given Board with the text "привет мир" for clients A and B
    Given Added text "мир" in "Bold" style in "привет " for clients A and B
    When Client B lost the connection
    When Client B deleted the last word "мир"
    When Client A inserted "добрый" after text "привет "
    When Client B restored the connection
    Then The text is the same on both clients
    Then The text on both clients is: "привет добрый"
    Then The text on both clients has "добрый" text in bold style

  Scenario: Client B inserts text into the second node while Client A adds a new node before it
    Given Board with the text "привет добрый мир" for clients A and B
    Given Added text "мир" in "Bold" style in "привет добрый " for clients A and B
    When Client B lost the connection
    When Client A bolded the first word "привет"
    When Client B inserted "!" after text "привет добрый мир"
    When Client B restored the connection
    Then The text is the same on both clients
    Then The text on both clients is: "привет добрый мир!"
    Then The text on both clients has "привет" and "мир!" text in bold style

  Scenario: Client B adds a new node while Client A inserts text into the second node
    Given Board with the text "привет добрый мир" for clients A and B
    Given Added text "мир" in "Bold" style in "привет добрый " for clients A and B
    When Client B lost the connection
    When Client A inserted "!" after text "привет добрый мир"
    When Client B bolded the first word "привет"
    When Client B restored the connection
    Then The text is the same on both clients
    Then The text on both clients is: "привет добрый мир!"
    Then The text on both clients has "привет" and "мир!" text in bold style

  Scenario: Client B inserts text into the third node while Client A merges the first and second nodes
    Given Board with the text "привет мир как дела" for clients A and B
    Given Added text "мир" in "Bold" style in "привет " for clients A and B
    Given Added text "как дела" in "Italics" style in "привет мир " for clients A and B
    When Client B lost the connection
    When Client A delete bold style in word "мир" in text "привет "
    When Client B inserted "?" after text "привет мир как дела"
    When Client B restored the connection
    Then The text is the same on both clients
    Then The text on both clients is: "привет мир как дела?"
    Then The text on both clients has "как дела?" text in italics style

  Scenario: Client B merges the first and second nodes while Client A inserts text into the third node
    Given Board with the text "привет мир как дела" for clients A and B
    Given Added text "мир" in "Bold" style in "привет " for clients A and B
    Given Added text "как дела" in "Italics" style in "привет мир " for clients A and B
    When Client B lost the connection
    When Client A inserted "?" after text "привет мир как дела"
    When Client B delete bold style in word "мир" in text "привет "
    When Client B restored the connection
    Then The text is the same on both clients
    Then The text on both clients is: "привет мир как дела?"
    Then The text on both clients has "как дела?" text in italics style

  Scenario: Client B inserts text into the second node while Client A merges the first and second nodes
    Given Board with the text "привет мир" for clients A and B
    Given Added text "мир" in "Bold" style in "привет " for clients A and B
    When Client B lost the connection
    When Client A delete bold style in word "мир" in text "привет "
    When Client B inserted "добрый " after text "привет "
    When Client B restored the connection
    Then The text is the same on both clients
    Then The text on both clients is: "привет добрый мир"

  Scenario: Client B merges the first and second nodes while Client A inserts text into the second node
    Given Board with the text "привет мир" for clients A and B
    Given Added text "мир" in "Bold" style in "привет " for clients A and B
    When Client B lost the connection
    When Client A inserted "добрый " after text "привет "
    When Client B delete bold style in word "мир" in text "привет "
    When Client B restored the connection
    Then The text is the same on both clients
    Then The text on both clients is: "привет добрый мир"

  Scenario: Client B inserts text into one of the nodes while Client A splits it into two nodes before the position where Client B is inserting the text
    Given Board with the text "Привет, мир" for clients A and B
    When Client B lost the connection
    When Client A bolded the first word "Привет"
    When Client B inserted "!" after text "Привет, мир"
    When Client B restored the connection
    Then The text is the same on both clients
    Then The text on both clients is: "Привет, мир!"
    Then The text on both clients has "Привет," text in bold style

  Scenario: Client B splits it into two nodes before the position where Client A is inserting the text while Client A inserts text into one of the nodes
    Given Board with the text "Привет, мир" for clients A and B
    When Client B lost the connection
    When Client A inserted "!" after text "Привет, мир"
    When Client B bolded the first word "Привет"
    When Client B restored the connection
    Then The text is the same on both clients
    Then The text on both clients is: "Привет, мир!"
    Then The text on both clients has "Привет," text in bold style

  Scenario: Client A splits the text into two lines and then undoes the action
    Given Board with the text "привет мир" for clients A and B
    When Client A split the text into two lines after "привет "
    When Client A undid the action
    Then The text is the same on both clients
    Then The paragraph text on both clients is: "привет мир"

  Scenario: Client B splits the text into two lines and then undoes the action
    Given Board with the text "привет мир" for clients A and B
    When Client B split the text into two lines after "привет "
    When Client B undid the action
    Then The text is the same on both clients
    Then The paragraph text on both clients is: "привет мир"
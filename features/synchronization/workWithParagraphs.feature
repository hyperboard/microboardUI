@sync
@paragraphs
Feature: Work with paragraphs

  Scenario: Client B adds a new paragraph while Client A deletes the paragraph before it
    Given Board with 2 paragraphs of text for Client A and Client B
    When Client B lost the connection
    When Client A delete paragraph first paragraph "Параграф 1"
    When Client B add new paragraph after "Параграф 1 Параграф 2 "
    When Client B restored the connection
    Then The text is the same on both clients
    Then The paragraph text on both clients is: " Параграф 2 Новый параграф"

  Scenario: Client B deletes the paragraph while Client A adds a new paragraph before it
    Given Board with 2 paragraphs of text for Client A and Client B
    When Client B lost the connection
    When Client A add new paragraph after "Параграф 1 Параграф 2 "
    When Client B delete paragraph first paragraph "Параграф 1"
    When Client B restored the connection
    Then The text is the same on both clients
    Then The paragraph text on both clients is: " Параграф 2 Новый параграф"

  Scenario: Client B edits the content of the paragraph while Client A deletes this paragraph
    Given Board with 2 paragraphs of text for Client A and Client B
    When Client B lost the connection
    When Client A delete paragraph last paragraph "Параграф 2" in "Параграф 1"
    When Client B inserted " измененный" after text "Параграф 1  Параграф 2"
    When Client B restored the connection
    Then The text is the same on both clients
    Then The paragraph text on both clients is: "Параграф 1"

  Scenario: Client B deletes this paragraph while Client A edits the content of the paragraph
    Given Board with 2 paragraphs of text for Client A and Client B
    When Client B lost the connection
    When Client A inserted " измененный" after text "Параграф 1  Параграф 2"
    When Client B delete paragraph last paragraph "Параграф 2" in "Параграф 1"
    When Client B restored the connection
    Then The text is the same on both clients
    Then The paragraph text on both clients is: "Параграф 1"

  Scenario: Client B edits the second paragraph while Client A adds a new paragraph in front of it
    Given Board with 2 paragraphs of text for Client A and Client B
    When Client B lost the connection
    When Client A added new paragraph "Новый параграф" after "Параграф 1"
    When Client B inserted " измененный" after text "Параграф 1  Параграф 2"
    When Client B restored the connection
    Then The text is the same on both clients
    Then The paragraph text on both clients is: "Параграф 1 Новый параграф Параграф 2 измененный"

  Scenario: Client B adds a new paragraph in front of it while Client A edits the second paragraph
    Given Board with 2 paragraphs of text for Client A and Client B
    When Client B lost the connection
    When Client A inserted " измененный" after text "Параграф 1  Параграф 2"
    When Client B added new paragraph "Новый параграф" after "Параграф 1"
    When Client B restored the connection
    Then The text is the same on both clients
    Then The paragraph text on both clients is: "Параграф 1 Новый параграф Параграф 2 измененный"

  Scenario: Client B makes changes to the third paragraph while Client A merges the first and second paragraphs
    Given Board with 3 paragraphs of text for Client A and Client B
    When Client B lost the connection
    When Client A merged the first two paragraphs into a single paragraph
    When Client B inserted " измененный" after text "Параграф 1  Параграф 2  Параграф 3" 
    When Client B restored the connection
    Then The text is the same on both clients
    Then The paragraph text on both clients is: "Параграф 1 Параграф 2 Параграф 3 измененный"

  Scenario: Client B merges the first and second paragraphs while Client A makes changes to the third paragraph
    Given Board with 3 paragraphs of text for Client A and Client B
    When Client B lost the connection
    When Client A inserted " измененный" after text "Параграф 1  Параграф 2  Параграф 3" 
    When Client B merged the first two paragraphs into a single paragraph
    When Client B restored the connection
    Then The text is the same on both clients
    Then The paragraph text on both clients is: "Параграф 1 Параграф 2 Параграф 3 измененный"

  Scenario: Client B edits the second paragraph while Client A merges the first and second paragraphs
    Given Board with 2 paragraphs of text for Client A and Client B
    When Client B lost the connection
    When Client A merged the first two paragraphs into a single paragraph
    When Client B inserted " измененный" after text "Параграф 1  Параграф 2" 
    When Client B restored the connection
    Then The text is the same on both clients
    Then The paragraph text on both clients is: "Параграф 1 Параграф 2 измененный"

  Scenario: Client B merges the first and second paragraphs while Client A edits the second paragraph
  Given Board with 2 paragraphs of text for Client A and Client B
  When Client B lost the connection
  When Client A inserted " измененный" after text "Параграф 1  Параграф 2" 
  When Client B merged the first two paragraphs into a single paragraph
  When Client B restored the connection
  Then The text is the same on both clients
  Then The paragraph text on both clients is: "Параграф 1 Параграф 2 измененный"

  Scenario: Client B edits the second paragraph while Client A merges the first and second paragraphs
    Given Board with long paragraphs of text for Client A and Client B
    When Client B lost the connection
    When Client A splits the paragraph into two after the word "Это длинный"
    When Client B inserted " очень" after text "Это длинный параграф текста " 
    When Client B restored the connection
    Then The text is the same on both clients
    Then The paragraph text on both clients is: "Это длинный  параграф текста очень"

  Scenario: Client B merges the first and second paragraphs while Client A edits the second paragraph
    Given Board with long paragraphs of text for Client A and Client B
    When Client B lost the connection
    When Client A inserted " очень" after text "Это длинный параграф текста " 
    When Client B splits the paragraph into two after the word "Это длинный"
    When Client B restored the connection
    Then The text is the same on both clients
    Then The paragraph text on both clients is: "Это длинный  параграф текста очень"

  Scenario: Client A splits the text into two lines and then undoes the action
    Given Board with 2 paragraphs of text for Client A and Client B
    When Client A merged the first two paragraphs into a single paragraph
    When Client A undid the action
    Then The text is the same on both clients
    Then The paragraph text on both clients is: "Параграф 1 Параграф 2"

  Scenario: Client B splits the text into two lines and then undoes the action
    Given Board with 2 paragraphs of text for Client A and Client B
    When Client B merged the first two paragraphs into a single paragraph
    When Client B undid the action
    Then The text is the same on both clients
    Then The paragraph text on both clients is: "Параграф 1 Параграф 2"
@workWithText
Feature: Work with text tool

  @microboard
  Scenario: Adding text from the clipboard using the text tool
    Given Text added to x: 200, y: 200
    Given Text "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Faucibus pulvinar elementum integer enim. Sed ullamcorper morbi tincidunt ornare massa eget. Interdum varius sit amet mattis vulputate. Dictum fusce ut placerat orci nulla." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Cras ornare arcu dui vivamus arcu. Facilisi nullam vehicula ipsum a arcu cursus vitae. Semper quis lectus nulla at volutpat diam ut venenatis tellus. Iaculis eu non diam phasellus vestibulum lorem sed. Neque aliquam vestibulum morbi blandit cursus. Ante in nibh mauris cursus mattis molestie a. Senectus et netus et malesuada fames ac. Arcu felis bibendum ut tristique et egestas quis. Mi in nulla posuere sollicitudin aliquam ultrices sagittis orci. Metus dictum at tempor commodo ullamcorper a." added to object
    Given User copy the text
    Given Text added to x: 100, y: 100
    When The user presses the "Control+V" key
    Then Text "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Faucibus pulvinar elementum integer enim. Sed ullamcorper morbi tincidunt ornare massa eget. Interdum varius sit amet mattis vulputate. Dictum fusce ut placerat orci nulla.Cras ornare arcu dui vivamus arcu. Facilisi nullam vehicula ipsum a arcu cursus vitae. Semper quis lectus nulla at volutpat diam ut venenatis tellus. Iaculis eu non diam phasellus vestibulum lorem sed. Neque aliquam vestibulum morbi blandit cursus. Ante in nibh mauris cursus mattis molestie a. Senectus et netus et malesuada fames ac. Arcu felis bibendum ut tristique et egestas quis. Mi in nulla posuere sollicitudin aliquam ultrices sagittis orci. Metus dictum at tempor commodo ullamcorper a." of object number 0 has been inserted in full
    # Then Paragraph division preserved
    # Then Text saved 5 paragraphs
    Then Text container of object 0 width: 600
    When Cursor clicked at x: 900, y: 700
    When Cursor clicked at x: 150, y: 300 twice
    Then Text "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Faucibus pulvinar elementum integer enim. Sed ullamcorper morbi tincidunt ornare massa eget. Interdum varius sit amet mattis vulputate. Dictum fusce ut placerat orci nulla.Cras ornare arcu dui vivamus arcu. Facilisi nullam vehicula ipsum a arcu cursus vitae. Semper quis lectus nulla at volutpat diam ut venenatis tellus. Iaculis eu non diam phasellus vestibulum lorem sed. Neque aliquam vestibulum morbi blandit cursus. Ante in nibh mauris cursus mattis molestie a. Senectus et netus et malesuada fames ac. Arcu felis bibendum ut tristique et egestas quis. Mi in nulla posuere sollicitudin aliquam ultrices sagittis orci. Metus dictum at tempor commodo ullamcorper a." of object number 0 has been inserted in full
    # Then Text saved 5 paragraphs
    Then Text container of object 0 width: 600

  @microboard
  Scenario: Adding text from the clipboard
    Given Text added to x: 200, y: 200
    When Cursor clicked at x: 200, y: 200
    Given Text "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Faucibus pulvinar elementum integer enim. Sed ullamcorper morbi tincidunt ornare massa eget. Interdum varius sit amet mattis vulputate. Dictum fusce ut placerat orci nulla." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Cras ornare arcu dui vivamus arcu. Facilisi nullam vehicula ipsum a arcu cursus vitae. Semper quis lectus nulla at volutpat diam ut venenatis tellus. Iaculis eu non diam phasellus vestibulum lorem sed. Neque aliquam vestibulum morbi blandit cursus. Ante in nibh mauris cursus mattis molestie a. Senectus et netus et malesuada fames ac. Arcu felis bibendum ut tristique et egestas quis. Mi in nulla posuere sollicitudin aliquam ultrices sagittis orci. Metus dictum at tempor commodo ullamcorper a." added to object
    Given User copy the text
    When Cursor clicked at x: 100, y: 100
    When The user presses the "Control+V" key
    When Cursor clicked at x: 150, y: 300
    When Cursor clicked at x: 150, y: 300
    Then Text "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Faucibus pulvinar elementum integer enim. Sed ullamcorper morbi tincidunt ornare massa eget. Interdum varius sit amet mattis vulputate. Dictum fusce ut placerat orci nulla.Cras ornare arcu dui vivamus arcu. Facilisi nullam vehicula ipsum a arcu cursus vitae. Semper quis lectus nulla at volutpat diam ut venenatis tellus. Iaculis eu non diam phasellus vestibulum lorem sed. Neque aliquam vestibulum morbi blandit cursus. Ante in nibh mauris cursus mattis molestie a. Senectus et netus et malesuada fames ac. Arcu felis bibendum ut tristique et egestas quis. Mi in nulla posuere sollicitudin aliquam ultrices sagittis orci. Metus dictum at tempor commodo ullamcorper a." of object number 0 has been inserted in full
    # Then Text saved 5 paragraphs
    Then Text container of object 0 width: 600
    When Cursor clicked at x: 900, y: 700
    When Cursor clicked at x: 150, y: 300
    When Cursor clicked at x: 150, y: 300
    Then Text "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Faucibus pulvinar elementum integer enim. Sed ullamcorper morbi tincidunt ornare massa eget. Interdum varius sit amet mattis vulputate. Dictum fusce ut placerat orci nulla.Cras ornare arcu dui vivamus arcu. Facilisi nullam vehicula ipsum a arcu cursus vitae. Semper quis lectus nulla at volutpat diam ut venenatis tellus. Iaculis eu non diam phasellus vestibulum lorem sed. Neque aliquam vestibulum morbi blandit cursus. Ante in nibh mauris cursus mattis molestie a. Senectus et netus et malesuada fames ac. Arcu felis bibendum ut tristique et egestas quis. Mi in nulla posuere sollicitudin aliquam ultrices sagittis orci. Metus dictum at tempor commodo ullamcorper a." of object number 0 has been inserted in full
    # Then Text saved 5 paragraphs
    Then Text container of object 0 width: 600

  @microboard
  Scenario: Placing cursor at click location on text tool by double clicking
    Given Text added to x: 100, y: 100
    When Cursor clicked at x: 100, y: 100
    Given Text "lorem ipsum dolor" added to object
    When Cursor clicked at x: 900, y: 700
    When Cursor clicked at x: 100, y: 100 twice
    Then 1 items are selected
    Then Panel is near item and item has a cursor

  @microboard
  Scenario: Placing cursor at click location on sticker tool by double clicking
    Given Sticker added to x: 100, y: 100
    Given Text "lorem ipsum dolor" added to object
    When Cursor clicked at x: 900, y: 700
    When Cursor clicked at x: 100, y: 100 twice
    Then 1 items are selected
    Then Panel is near item and item has a cursor

  @microboard
  Scenario: Placing cursor at click location on shape tool by double clicking
    Given Shape added to x: 100, y: 100
    Given Text "lorem ipsum dolor" added to object
    When Cursor clicked at x: 900, y: 700
    When Cursor clicked at x: 120, y: 120 twice
    Then 1 items are selected
    Then Panel is near item and item has a cursor

  @microboard
  Scenario: Placing cursor at click location on connector tool by double clicking
    Given Connector added to x: 100, y: 100 and x: 100, y: 300
    When Cursor clicked at x: 100, y: 150
    Given Text "lorem ipsum dolor" added to object
    When Cursor clicked at x: 900, y: 700
    When Cursor clicked at x: 100, y: 150 twice
    Then 1 items are selected
    Then Panel is near item and item has a cursor

  @microboard
  Scenario: Placing cursor at click location on text tool by clicking
    Given Text added to x: 100, y: 100
    When Cursor clicked at x: 100, y: 100
    Given Text "lorem ipsum dolor" added to object
    When Cursor clicked at x: 120, y: 110
    Then 1 items are selected
    Then Panel is near item and item has a cursor

  @microboard
  Scenario: Placing cursor at click location on sticker tool by clicking
    Given Sticker added to x: 100, y: 100
    Given Text "lorem ipsum dolor" added to object
    When Cursor clicked at x: 100, y: 100
    Then 1 items are selected
    Then Panel is near item and item has a cursor

  @microboard
  Scenario: Placing cursor at click location on shape tool by clicking
    Given Shape added to x: 100, y: 100
    When Cursor clicked at x: 100, y: 100
    Given Text "lorem ipsum dolor" added to object
    When Cursor clicked at x: 120, y: 120
    Then 1 items are selected
    Then Panel is near item and item has a cursor

  @microboard
  Scenario: Placing cursor at click location on connector tool by clicking
    Given Connector added to x: 100, y: 100 and x: 100, y: 300
    When Cursor clicked at x: 100, y: 150
    Given Text "lorem ipsum dolor" added to object
    When Cursor clicked at x: 100, y: 190
    Then 1 items are selected
    Then Panel is near item and item has a cursor

  @microboard
  Scenario: Resizing text object outside the right side frame
    When The user presses the "V" key
    Given Text added to x: 100, y: 100
    Given Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." added to object
    When User transform object beyond the 700 and 150 corner to 900 and 150
    Then Object is transformed to w: 780 and y: h: 170
    Then Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex.Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." of object number 0 has been inserted in full
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 100, y: 100 twice
    Then Object is transformed to w: 780 and y: h: 170
    Then Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex.Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." of object number 0 has been inserted in full
  
  @microboard
  Scenario: Resizing text object outside the button right corner
    Given Text added to x: 100, y: 100
    Given Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." added to object
    When User transform object beyond the 700 and 316 corner to 800 and 400
    Then Object is transformed to w: 710 and y: h: 250
    Then Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex.Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." of object number 0 has been inserted in full
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 710 and y: h: 250
    Then Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex.Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." of object number 0 has been inserted in full
  
  @microboard
  Scenario: Adding a new one to replace the selected one
    When The user presses the "V" key
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given User typed the text: "The quick"
    When The user presses the "Enter" key
    Given User typed the text: "Two driven jocks"
    When Cursor clicked at x: 300, y: 330
    When User selected paragraph 0
    Given User typed the text: "texttext"
    Then Paragraph text number: 0 has text: "texttext"
    Then Paragraph text number: 1 has text: "Two driven jocks"

  @microboard
  @applyTextFragmentColor
  Scenario: Application of white color to selected fragment of text on sticker
    Given Sticker added to x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text color on "255, 255, 255"
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)" 
    When Cursor clicked at x: 350, y: 350 twice
    Then Object with number: 0 has a paragraph: 2 with text color: "black"
    Then Text color changed on the panel on "black" 

  @microboard
  @applyTextFragmentColor
  Scenario: Application of white color to selected fragment of text on shape
    Given Shape added to x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax" added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 350, y: 350 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 2
    When User changed text color on "255, 255, 255"
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)" 
    When The user presses the "Control+A" key
    Then Object with number: 0 has a paragraph: 0 with text color: "black"
    When User selected paragraph 0
    Then Text color changed on the panel on "black"   

  @microboard
  @applyTextFragmentColor
  Scenario: Application of white color to selected fragment of text on text
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs!" added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text color on "255, 255, 255"
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)" 
    Then Object with number: 0 has a paragraph: 2 with text color: "black"
    When User selected paragraph 2
    Then Text color changed on the panel on "black" 

  @microboard
  @applyTextFragmentColor
  Scenario: Application of white color to selected fragment of text on connector
    Given Text added to x: 200, y: 200
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled." added to object
    Given User copy the text
    When Cursor clicked at x: 350, y: 350
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 350 twice
    When The user presses the "Control+V" key
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 450 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text color on "255, 255, 255"
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)" 
    When Cursor clicked at x: 300, y: 480 twice
    Then Object with number: 0 has a paragraph: 2 with text color: "black"
    Then Text color changed on the panel on "black" 

  @microboard
  @applyTextFragmentHighlightColor
  Scenario: Application of highlight color on white to selected fragment of text on sticker
    Given Sticker added to x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text highlight color on "255, 255, 255"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    When Cursor clicked at x: 350, y: 350 twice 
    Then Text highlight color changed on ""

  @microboard
  @applyTextFragmentHighlightColor
  Scenario: Application of highlight color on white to selected fragment of text on shape
    Given Shape added to x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 350, y: 350 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 2
    When User changed text highlight color on "255, 255, 255"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    When Cursor clicked at x: 390, y: 390 twice
    Then Text highlight color changed on ""

  @microboard
  @applyTextFragmentHighlightColor
  Scenario: Application of highlight color on white to selected fragment of text on text
    Given Text added to x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text highlight color on "255, 255, 255"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    When Cursor clicked at x: 450, y: 450 twice
    Then Text highlight color changed on ""

  @microboard
  @applyTextFragmentHighlightColor
  Scenario: Application of highlight color on white to selected fragment of text on connector
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 350 twice
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled." added to object
    When The user presses the "Control+V" key
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 450 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text highlight color on "255, 255, 255"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    When Cursor clicked at x: 300, y: 480 twice
    Then Text highlight color changed on ""

  @microboard
  @applyTextFragmentStyle
  Scenario: Application of text underline to selected fragment of text on sticker
    Given Sticker added to x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text style on "Underline"
    Then Paragraph text number: 0 has text style: "underline"
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    When User selected paragraph 0
    Then Text style changed on the panel on "Underline"
    Then Paragraph text number: 2 hasnt text styles

  @microboard
  @applyTextFragmentStyle
  Scenario: Application of text underline to selected fragment of text on shape
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 2
    When User changed text style on "Underline"
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    Then Paragraph text number: 2 has text style: "underline"
    Then Paragraph text number: 0 hasnt text styles
    When User selected paragraph 2
    Then Text style changed on the panel on "Underline"

  @microboard
  @applyTextFragmentStyle
  Scenario: Application of text underline to selected fragment of text on text
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text style on "Underline"
    Then Paragraph text number: 0 has text style: "underline"
    Then Paragraph text number: 2 hasnt text styles
    When Cursor clicked at x: 300, y: 300 twice
    Then Text style changed on the panel on "Underline" 

  @microboard
  @applyTextFragmentStyle
  Scenario: Application of text underline to selected fragment of text on connector
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 350 twice
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled." added to object
    When The user presses the "Control+V" key
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 450 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text style on "Underline"
    Then Paragraph text number: 0 has text style: "underline" 
    Then Paragraph text number: 2 hasnt text styles
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 450 twice
    When User selected paragraph 0
    Then Text style changed on the panel on "Underline"

  @microboard
  @applyTextFragmentStyle
  Scenario: Application of text bold to selected fragment of text on sticker
    Given Sticker added to x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text style on "Bold"
    Then Paragraph text number: 0 has text style: "bold"
    Then Paragraph text number: 2 hasnt text styles
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    When User selected paragraph 0
    Then Text style changed on the panel on "Bold"

  @microboard
  @applyTextFragmentStyle
  Scenario: Application of text bold to selected fragment of text on text
    Given Text added to x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text style on "Bold"
    Then Paragraph text number: 0 has text style: "bold"
    When Cursor clicked at x: 300, y: 300 twice
    Then Text style changed on the panel on "Bold" 
    Then Paragraph text number: 2 hasnt text styles

  @microboard
  @applyTextFragmentStyle
  Scenario: Application of text bold to selected fragment of text on connector
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 350 twice
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz." added to object
    When The user presses the "Control+V" key
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 450 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    Then Context panel is visible
    When User changed text style on "Bold"
    Then Paragraph text number: 0 has text style: "bold"
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 450 twice
    When User selected paragraph 0
    Then Text style changed on the panel on "Bold" 
    Then Paragraph text number: 2 hasnt text styles

  @microboard
  @applyTextFragmentSize
  Scenario: Changing text size by panel dropdown to selected fragment of text on sticker
    Given Sticker added to x: 350, y: 350
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs!" added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 350, y: 350 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text size by clicking on panel dropdown 10 font size
    Then Paragraph text number: 0 has text size: 10
    Then Text size changed on the panel on "10"
    Then Paragraph text number: 2 has text size: 14

  @microboard
  @applyTextFragmentSize
  Scenario: Changing text size by clicking on top arrow to selected fragment of text on shape
    Given Shape added to x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz" added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 2
    When User changed text size by clicking on top arrow
    Then Paragraph text number: 2 has text size: 18
    Then Text size changed on the panel on "18"
    Then Paragraph text number: 0 has text size: 14
    
  @microboard
  @applyTextFragmentSize
  Scenario: Changing text size by panel dropdown to selected fragment of text on shape
    Given Shape added to x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 2
    When User changed text size by clicking on panel dropdown 12 font size
    Then Paragraph text number: 2 has text size: 12
    Then Text size changed on the panel on "12"
    Then Paragraph text number: 0 has text size: 14

  @microboard
  @applyTextFragmentSize
  Scenario: Changing text size by clicking on top arrow to selected fragment of text on text
    Given Text added to x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text size by clicking on top arrow
    Then Paragraph text number: 0 has text size: 18
    Then Text size changed on the panel on "18"
    Then Paragraph text number: 2 has text size: 14

  @microboard
  @applyTextFragmentSize
  Scenario: Changing text size by clicking on down arrow to selected fragment of text on text
    Given Text added to x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text size by clicking on down arrow
    Then Paragraph text number: 0 has text size: 12
    Then Text size changed on the panel on "12"

  @microboard
  @applyTextFragmentSize
  Scenario: Changing text size by panel dropdown to selected fragment of text on text
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text size by clicking on panel dropdown 12 font size
    Then Paragraph text number: 0 has text size: 12
    Then Text size changed on the panel on "12"
    Then Paragraph text number: 2 has text size: 14

  @microboard
  @applyTextFragmentSize
  Scenario: Changing text size by clicking on top arrow to selected fragment of text on connector
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 350 twice
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled." added to object
    When The user presses the "Control+V" key
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 450 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text size by clicking on top arrow
    Then Paragraph text number: 0 has text size: 18
    Then Text size changed on the panel on "18"
    Then Paragraph text number: 2 has text size: 14

  @microboard
  @applyTextFragmentSize
  Scenario: Changing text size by clicking on down arrow to selected fragment of text on connector
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 350 twice
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled." added to object
    When The user presses the "Control+V" key
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 450 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text size by clicking on down arrow
    Then Paragraph text number: 0 has text size: 12
    Then Text size changed on the panel on "12"
    Then Paragraph text number: 2 has text size: 14

  @microboard
  @applyTextFragmentSize
  Scenario: Changing text size by panel dropdown to selected fragment of text on connector
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 350 twice
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled." added to object
    When The user presses the "Control+V" key
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 450 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text size by clicking on panel dropdown 12 font size
    Then Paragraph text number: 0 has text size: 12
    Then Text size changed on the panel on "12"
    Then Paragraph text number: 2 has text size: 14

  @microboard
  @applyTextFragmentAligment
  Scenario: Application of text alignment horisontal left to selected fragment of text on sticker
    Given Sticker added to x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 250, y: 250 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text alignment on "HorisontalAlignmentLeft"
    Then Paragraph text number: 0 has text alignment: "left"
    Then Text alignment changed on the panel on "HorisontalAlignmentLeft"
    Then Paragraph text number: 2 has text alignment: "center"

  @microboard
  @applyTextFragmentAligment
  Scenario: Application of text bold to selected fragment of text on shape
    Given Shape added to x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help" added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 350, y: 350 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 2
    When User changed text alignment on "HorisontalAlignmentLeft"
    Then Paragraph text number: 0 has text alignment: "center"
    When User selected paragraph 2
    Then Text alignment changed on the panel on "HorisontalAlignmentLeft"
    Then Paragraph text number: 2 has text alignment: "left"

  @microboard
  @applyTextFragmentAligment
  Scenario: Application of text bold to selected fragment of text on text
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." added to object
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300 twice
    Then Panel is near item and item has a cursor
    When User selected paragraph 0
    When User changed text alignment on "HorisontalAlignmentCenter"
    Then Paragraph text number: 0 has text alignment: "center"
    When User selected paragraph 0
    Then Text alignment changed on the panel on "HorisontalAlignmentCenter"
    Then Paragraph text number: 2 has text alignment: "left"

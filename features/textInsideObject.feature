@textInsideObject
Feature: Working with text inside an object
  
  @microboard
  Scenario: Displying text in sticker when refreshing a page
    Given Sticker added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps." added to object
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled." added to object
    When User duplicate object
    Then Text container of object 0 width: 187
    Then Text container of object 1 width: 187
    Then Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps.Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled." of object number 0 has been inserted in full
    Then Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps.Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled." of object number 1 has been inserted in full
    When Cursor clicked at x: 700, y: 700
    When Reload page
    When Clicked at zoomToFit
    Then Text container of object 0 width: 187
    Then Text container of object 1 width: 187
    Then Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps.Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled." of object number 0 has been inserted in full
    Then Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps.Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled." of object number 1 has been inserted in full
   
  @microboard
  Scenario: Checking text in sticker when refreshing a page
    Given Sticker added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "Text1" added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Text2" added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Text3" added to object
    Then Text "Text1Text2Text3" of object number 0 has been inserted in full
    When User selected paragraph 0
    When User changed text style on "underline" by app
    When User selected paragraph 2
    When User changed text color on "rgb(254, 244, 69)" by app
    When Cursor clicked at x: 700, y: 700
    When Reload page
    When Clicked at zoomToFit
    Then Text "Text1Text2Text3" of object number 0 has been inserted in full
    When Cursor clicked at x: 300, y: 300
    When Cursor clicked at x: 300, y: 300 twice
    Then Text hasnt an error "An editor error has occured"
    Then Object with number: 0 has a paragraph: 0 with text style: "underline"
    Then Object with number: 0 has a paragraph: 2 with text color: "rgb(254, 244, 69)"
    Then Text saved 5 paragraphs

  @microboard
  Scenario: Checking text in shape when refreshing a page
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 350, y: 350
    Given Text "Text1" added to object
    When The user presses the "Enter" key
    Given Text "Text2" added to object
    When The user presses the "Enter" key
    Given Text "Text3" added to object
    Then Text "Text1Text2Text3" of object number 0 has been inserted in full
    When User selected paragraph 0
    When User changed text style on "Underline"
    When User selected paragraph 3
    When User changed text color on "254, 244, 69"
    When Cursor clicked at x: 700, y: 700
    When Reload page
    When Clicked at zoomToFit
    Then Text "Text1Text2Text3" of object number 0 has been inserted in full
    When Cursor clicked at x: 350, y: 350 twice
    When Cursor clicked at x: 350, y: 350 twice
    Then Text hasnt an error "An editor error has occured"
    Then Object with number: 0 has a paragraph: 0 with text style: "underline"
    Then Object with number: 0 has a paragraph: 3 with text color: "rgb(254, 244, 69)"
    Then Text saved 3 paragraphs

  @microboard
  Scenario: Checking text in text when refreshing a page
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "Text1" added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Text2" added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Text3" added to object
    Then Text "Text1Text2Text3" of object number 0 has been inserted in full
    When User selected paragraph 0
    When User changed text style on "underline" by app
    When User selected paragraph 2
    When User changed text color on "rgb(254, 244, 69)" by app
    When Cursor clicked at x: 700, y: 700
    When Reload page
    Then Text "Text1Text2Text3" of object number 0 has been inserted in full
    When Cursor clicked at x: 310, y: 310 twice
    When Cursor clicked at x: 310, y: 310 twice
    Then Text hasnt an error "An editor error has occured"
    Then Object with number: 0 has a paragraph: 0 with text style: "underline"
    Then Object with number: 0 has a paragraph: 2 with text color: "rgb(254, 244, 69)"
    Then Text saved 5 paragraphs

  @microboard
  Scenario: Checking text in connector when refreshing a page
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 400 twice
    Given Text "Text1" added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Text2" added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Text3" added to object
    Then Text "Text1Text2Text3" of object number 0 has been inserted in full
    When User selected paragraph 0
    When User changed text style on "underline" by app
    When User selected paragraph 2
    When User changed text color on "rgb(254, 244, 69)" by app
    When Cursor clicked at x: 700, y: 700
    When Reload page
    Then Text "Text1Text2Text3" of object number 0 has been inserted in full
    When Cursor clicked at x: 300, y: 400 twice
    When Cursor clicked at x: 300, y: 400 twice
    Then Text hasnt an error "An editor error has occured"
    Then Object with number: 0 has a paragraph: 0 with text style: "underline"
    Then Object with number: 0 has a paragraph: 2 with text color: "rgb(254, 244, 69)"
    Then Text saved 5 paragraphs

  @microboard
  Scenario: Paste text from the clipboard into a sticker
    Given Text added to x: 200, y: 200
    When Cursor clicked at x: 200, y: 200
    Given Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." added to object
    When Cursor clicked at x: 300, y: 200 twice
    Given User copy the text
    When Cursor clicked at x: 700, y: 700
    Given Sticker added to x: 100, y: 100
    When The user presses the "Control+v" key
    Then Text container of object 0 width: 187
    Then Text container of object 0 height: 187
    When Cursor clicked at x: 700, y: 700
    Then Text "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex! Fox nymphs grab quick-jived waltz. Brick quiz whangs jumpy veldt fox. Bright vixens jump; dozy fowl quack. Quick wafting zephyrs vex bold Jim. Quick zephyrs blow, vexing daft Jim. Sex-charged fop blew my junk TV quiz. How quickly daft jumping zebras vex.Two driven jocks help fax my big quiz. Quick, Baz, get my woven flax jodhpurs! \"Now fax quiz Jack! \" my brave ghost pled. Five quacking zephyrs jolt my wax bed. Flummoxed by job, kvetching W. zaps Iraq. Cozy sphinx waves quart jug of bad milk. A very bad quack might jinx zippy fowls. Few quips galvanized the mock jury box. Quick brown dogs jump over the lazy fox. The jay, pig, fox, zebra, and my wolves quack! Blowzy red vixens fight for a quick jump." of object number 0 has been inserted in full
    When Cursor clicked at x: 200, y: 100
    When Cursor clicked at x: 200, y: 100 twice
    Then Text saved 3 paragraphs

  @microboard
  @checkingTextFragment
  Scenario: Checking text selection of sticker after applying style to fragment
    Given Sticker added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300 twice
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jock" added to object
    When User selected paragraph 2
    Then Text selection is "Two driven jock"
    When User changed text style on "Bold"
    Then Paragraph text number: 2 has text style: "bold"
    Then Paragraph text number: 0 hasnt text styles
    When Cursor clicked at x: 700, y: 700
    Then Paragraph text number: 2 has text style: "bold"
    Then Paragraph text number: 0 hasnt text styles

  @microboard
  @checkingTextFragment
  Scenario: Checking text selection of shape after applying style to fragment
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 350, y: 350
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz" added to object
    When Cursor clicked at x: 310, y: 310
    When User selected paragraph 2
    When User changed text style on "Bold"
    Then Paragraph text number: 2 has text style: "bold"
    Then Paragraph text number: 0 hasnt text styles
    When Cursor clicked at x: 700, y: 700
    Then Paragraph text number: 2 has text style: "bold"
    Then Paragraph text number: 0 hasnt text styles

  @microboard
  @checkingTextFragment
  Scenario: Checking text selection of text after applying style to fragment
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz." added to object
    When Cursor clicked at x: 300, y: 310
    When User selected paragraph 2
    When User changed text style on "Bold"
    Then Paragraph text number: 2 has text style: "bold"
    Then Paragraph text number: 0 hasnt text styles
    When Cursor clicked at x: 700, y: 700
    Then Paragraph text number: 2 has text style: "bold"
    Then Paragraph text number: 0 hasnt text styles

  @microboard
  @checkingTextFragment
  Scenario: Checking text selection of connector after applying style to fragment
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 450 twice
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz." added to object
    When Cursor clicked at x: 170, y: 450
    When User selected paragraph 2
    When User changed text style on "Bold"
    Then Paragraph text number: 2 has text style: "bold"
    Then Paragraph text number: 0 hasnt text styles
    When Cursor clicked at x: 700, y: 700
    Then Paragraph text number: 2 has text style: "bold"
    Then Paragraph text number: 0 hasnt text styles

  @microboard
  @checkingTextFragment
  Scenario: Checking text selection of sticker after applying style to fragment and all text
    Given Sticker added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz." added to object
    When User selected paragraph 1
    When User changed text style on "Bold"
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300
    When Cursor clicked at x: 250, y: 250 twice
    When User selected paragraph 0
    When User selected paragraph 1
    When User changed text style on "Underline"
    Then Text style changed on "underline"
    Then Paragraph text number: 1 has text style: "underline"
    Then Paragraph text number: 1 has text style: "bold"

  @microboard
  @checkingTextFragment
  Scenario: Checking text selection of shape after applying style to fragment and all text
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 350, y: 350
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz." added to object
    When Cursor clicked at x: 310, y: 310
    When User selected paragraph 1
    When User changed text style on "Bold"
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 350, y: 350
    When User changed text style on "Underline"
    Then Text style changed on "underline"
    Then Paragraph text number: 0 has text style: "underline"
    Then Paragraph text number: 1 has text style: "bold"
    Then Paragraph text number: 1 has text style: "underline"

  @microboard
  @checkingTextFragment
  Scenario: Checking text selection of text after applying style to fragment and all text
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz." added to object
    When Cursor clicked at x: 300, y: 310
    When User selected paragraph 1
    When User changed text style on "Bold"
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300
    When Cursor clicked at x: 400, y: 300
    When User changed text style on "Underline"
    Then Text style changed on "underline"
    Then Paragraph text number: 0 has text style: "underline"
    Then Paragraph text number: 1 has text style: "bold"
    Then Paragraph text number: 1 has text style: "underline"
  
  @microboard
  @checkingTextFragment
  Scenario: Checking text selection of connector after applying style to fragment and all text
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 450 twice
    Given Text "The quick, brown fox jumps over a lazy dog." added to object
    When The user presses the "Enter" key
    Given Text "Two driven jocks help fax my big quiz." added to object
    When Cursor clicked at x: 170, y: 450
    When User selected paragraph 1
    When User changed text style on "Bold"
    Then Paragraph text number: 1 has text style: "bold"
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300
    When User changed text style on "Underline"
    Then Text style changed on "underline"
    Then Paragraph text number: 0 has text style: "underline"
    Then Paragraph text number: 1 has text style: "bold"
    Then Paragraph text number: 1 has text style: "underline"

  @microboard
  @checkingStickerAutoSize
  Scenario: Check sticker auto text size
    Given Sticker added to x: 300, y: 300
    Then Sticker text size is automatically detected
    Then Text size changed on the panel on "Auto"
   
  @microboard
  @changingTextSize
  Scenario: Changing the text size in sticker by clicking on top arrow 
    Given Sticker added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "text" added to object
    When User changed text size by clicking on top arrow
    Then Text size changed on 144
    When Cursor clicked at x: 700, y: 700
    Then Text size changed on 144
    When The user presses the "Control+A" key
    Then Text size changed on the panel on "144"

  @microboard
  @changingTextSize
  Scenario: Changing the text size in shape by clicking on top arrow
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 350, y: 350
    Given Text "text" added to object
    When User changed text size by clicking on top arrow
    Then Text size changed on 18
    When Cursor clicked at x: 700, y: 700
    Then Text size changed on 18
    When The user presses the "Control+A" key
    Then Text size changed on the panel on "18"

  @changingTextSize
  Scenario: Changing the text size in shape by clicking on top arrow
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 350, y: 350
    Given Text "text" added to object
    When User changed text size by clicking on top arrow
    Then Text size changed on 15
    When Cursor clicked at x: 700, y: 700
    Then Text size changed on 15
    When Cursor clicked at x: 350, y: 350 twice
    Then Text size changed on the panel on "15"

  @microboard
  @changingTextSize
  Scenario: Changing the text size in text by clicking on top arrow
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "text" added to object
    When Cursor clicked at x: 300, y: 300 twice
    When User changed text size by clicking on top arrow
    Then Text size changed on 18
    When Cursor clicked at x: 700, y: 700
    Then Text size changed on 18
    When Cursor clicked at x: 300, y: 300
    When The user presses the "Control+A" key
    Then Text size changed on the panel on "18"

  @changingTextSize
  Scenario: Changing the text size in text by clicking on top arrow
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "text" added to object
    When User changed text size by clicking on top arrow
    Then Text size changed on 15
    When Cursor clicked at x: 700, y: 700
    Then Text size changed on 15
    When Cursor clicked at x: 300, y: 300
    When Cursor clicked at x: 310, y: 310
    Then Text size changed on the panel on "15"

  @microboard
  @changingTextSize
  Scenario: Changing the text size in connector by clicking on top arrow
    Given Connector added to x: 100, y: 100 and x: 100, y: 300
    When Cursor clicked at x: 100, y: 200 twice
    Given Text "text" added to object
    When User changed text size by clicking on top arrow
    Then Text size changed on 18
    When Cursor clicked at x: 400, y: 100
    Then Text size changed on 18
    When The user presses the "Control+A" key
    Then Text size changed on the panel on "18"

  @microboard
  Scenario: Changing the text size in sticker by clicking on down arrow
    Given Sticker added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "text" added to object
    When User changed text size by clicking on down arrow
    Then Text size changed on 80
    When Cursor clicked at x: 700, y: 700
    Then Text size changed on 80
    When The user presses the "Control+A" key
    Then Text size changed on the panel on "80"

  @microboard
  @changingTextSizeA
  Scenario: Changing the text size in shape by clicking on down arrow
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 350, y: 350 twice
    Given Text "text" added to object
    When User changed text size by clicking on down arrow
    Then Text size changed on 12
    When Cursor clicked at x: 700, y: 700
    Then Text size changed on 12
    When The user presses the "Control+A" key
    Then Text size changed on the panel on "12"

  @microboard
  @changingTextSize
  Scenario: Changing the text size in text by clicking on down arrow
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "text" added to object
    When User changed text size by clicking on down arrow
    Then Text size changed on 12
    When Cursor clicked at x: 700, y: 700
    Then Text size changed on 12
    When The user presses the "Control+A" key
    Then Text size changed on the panel on "12"

  @microboard
  @changingTextSize
  Scenario: Changing the text size in connector by clicking on down arrow
    Given Connector added to x: 100, y: 100 and x: 100, y: 300
    When Cursor clicked at x: 100, y: 200 twice
    Given Text "text" added to object
    When User changed text size by clicking on down arrow
    Then Text size changed on 12
    When Cursor clicked at x: 400, y: 100
    Then Text size changed on 12
    When The user presses the "Control+A" key
    Then Text size changed on the panel on "12"

  @microboard
  @changingTextSize
  Scenario: Changing the text size on 12 in sticker by clicking on panel dropdown
    Given Sticker added to x: 350, y: 350
    When Cursor clicked at x: 350, y: 350
    Given Text "text" added to object
    When User changed text size by clicking on panel dropdown 12 font size
    Then Text size changed on 12
    Then Text size changed on the panel on "12"
    When Cursor clicked at x: 700, y: 700
    Then Text size changed on 12
  
  @microboard
  @changingTextSize
  Scenario: Changing the text size on 18 in shape by clicking on panel dropdown
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 350, y: 350
    Given Text "text" added to object
    When User changed text size by clicking on panel dropdown 18 font size
    Then Text size changed on 18
    Then Text size changed on the panel on "18"
    When Cursor clicked at x: 700, y: 700
    Then Text size changed on 18
  
  @microboard
  @changingTextSize
  Scenario: Changing the text size on 18 in text by clicking on panel dropdown
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "text" added to object
    When User changed text size by clicking on panel dropdown 18 font size
    Then Text size changed on 18
    Then Text size changed on the panel on "18"
    When Cursor clicked at x: 400, y: 100
    Then Text size changed on 18

  @microboard
  @changingTextSize
  Scenario: Changing the text size on 12 in connector by clicking on panel dropdown
    Given Connector added to x: 100, y: 100 and x: 100, y: 300
    When Cursor clicked at x: 100, y: 200
    Given Text "text" added to object
    When User changed text size by clicking on panel dropdown 12 font size
    Then Text size changed on 12
    Then Text size changed on the panel on "12"
    When Cursor clicked at x: 400, y: 100
    Then Text size changed on 12
  
  @microboard
  @changingTextSize
  Scenario: Changing the text size on 20 in sticker by typing on panel
    Given Sticker added to x: 350, y: 350
    Given Text "text" added to object
    When User changed text size by typing "20" font size
    Then Text size changed on 20
    Then Text size changed on the panel on "20"
    When Cursor clicked at x: 700, y: 700
    Then Text size changed on 20
  
  @microboard
  @changingTextSize
  Scenario: Changing the text size on 16 in shape by typing on panel
    Given Shape added to x: 350, y: 350
    Given Text "text" added to object
    Then Context panel is visible
    When User changed text size by typing "16" font size
    Then Text size changed on 16
    Then Text size changed on the panel on "16"
    When Cursor clicked at x: 700, y: 700
    Then Text size changed on 16

  @microboard
  @changingTextSize
  Scenario: Changing the text size on 288 in text by typing on panel
    Given Text added to x: 350, y: 350
    Given Text "text" added to object
    Then Context panel is visible
    When User changed text size by typing "288" font size
    Then Text size changed on 288
    Then Text size changed on the panel on "288"
    When Cursor clicked at x: 700, y: 700
    Then Text size changed on 288

  @microboard
  @changingTextSize
  Scenario: Changing the text size on 16 in connector by typing on panel
    Given Connector added to x: 300, y: 100 and x: 300, y: 300
    When Cursor clicked at x: 100, y: 200
    Given Text "text" added to object
    Then Context panel is visible
    When User changed text size by typing "16" font size
    Then Text size changed on 16
    Then Text size changed on the panel on "16"
    When Cursor clicked at x: 700, y: 700
    Then Text size changed on 16

  @microboard
  @textInsideObjectTextAlignment
  Scenario: Changing text alignment on <alignmentType> in sticker
    Given Sticker added to x: 100, y: 100
    Given Text "text" added to object
    When User changed text alignment on "<alignmentTypeBtn>"
    Then Text alignment "<alignmentDirection>" changed on "<alignmentType>"
    When Cursor clicked at x: 400, y: 100
    Then Text alignment "<alignmentDirection>" changed on "<alignmentType>"
    Examples: 
    | alignmentTypeBtn          | alignmentDirection | alignmentType |
    | VerticalAlignmentBottom   | Vertical           | bottom        |
    | HorisontalAlignmentRight  | Horisontal         | right         |

  @microboard
  @textInsideObjectTextAlignment
  Scenario: Changing text alignment on <alignmentType> in shape
    Given Shape added to x: 100, y: 100
    Given Text "text" added to object
    When User changed text alignment on "<alignmentTypeBtn>"
    Then Text alignment "<alignmentDirection>" changed on "<alignmentType>"
    When Cursor clicked at x: 400, y: 100
    Then Text alignment "<alignmentDirection>" changed on "<alignmentType>"
    Examples: 
    | alignmentTypeBtn          | alignmentDirection | alignmentType |
    | VerticalAlignmentBottom   | Vertical           | bottom        |
    | HorisontalAlignmentRight  | Horisontal         | right         |

  @microboard
  @textInsideObjectTextAlignment
  Scenario: Changing text alignment on <alignmentType> in text
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "text" added to object
    When User changed text alignment on "<alignmentTypeBtn>"
    Then Text alignment "<alignmentDirection>" changed on "<alignmentType>"
    When Cursor clicked at x: 400, y: 100
    Then Text alignment "<alignmentDirection>" changed on "<alignmentType>"
    Examples: 
    | alignmentTypeBtn          | alignmentDirection | alignmentType |
    | HorisontalAlignmentRight  | Horisontal         | right         |

  @microboard
  @textInsideObjectTextStyle
  Scenario: Changing text style on <textStyleName> in <object>
    Given <object> added to x: 300, y: 300
    Given Text "text" added to object
    When Cursor clicked at x: 700, y: 700
    When The user presses the "Control+A" key
    When User changed text style on "<textStyle>"
    Then Text style changed on "<textStyleName>"
    Then Text style changed on the panel on "<textStyle>"    
    When Cursor clicked at x: 700, y: 700
    Then Text style changed on "<textStyleName>"
    Examples: 
    | object  | textStyle     | textStyleName |
    | Sticker | Bold          | bold          |
    | Sticker | Italics       | italic        |
    | Sticker | Underline     | underline     |
    | Sticker | Strikethrough | line-through  |
    | Text    | Bold          | bold          |
    | Text    | Italics       | italic        |
    | Text    | Underline     | underline     |
    | Text    | Strikethrough | line-through  |

  @microboard
  @textInsideObjectTextStyle
  Scenario: Changing text style on <textStyleName> in shape
    Given Shape added to x: 100, y: 100
    Given Text "text" added to object
    When Cursor clicked at x: 700, y: 700
    When The user presses the "Control+A" key
    When User changed text style on "<textStyle>"
    Then Text style changed on "<textStyleName>"
    Then Text style changed on the panel on "<textStyle>"    
    When Cursor clicked at x: 700, y: 700
    Then Text style changed on "<textStyleName>"
      Examples: 
      | textStyle     | textStyleName |
      | Bold          | bold          |
      | Italics       | italic        |
      | Underline     | underline     |
      | Strikethrough | line-through  |

  @microboard
  @textInsideObjectTextStyle
  Scenario: Changing text style on <textStyle> in connector
    Given Connector added to x: 100, y: 100 and x: 100, y: 300
    When Cursor clicked at x: 100, y: 200
    Given Text "text" added to object
    When The user presses the "Control+A" key
    When User changed text style on "<textStyle>"
    Then Text style changed on "<textStyleName>"
    Then Text style changed on the panel on "<textStyle>"    
    When Cursor clicked at x: 400, y: 100
    Then Text style changed on "<textStyleName>"
    Examples: 
    | textStyle     | textStyleName |
    | Bold          | bold          |
    | Italics       | italic        |
    | Underline     | underline     |
    | Strikethrough | line-through  |

  @microboard
  @applyTextStylesToObjectGroup
  Scenario: Applying <groupTextStyleName> style to group of shapes
    Given Shape with id: "Rectangle" added to x: 300, y: 200
    When Cursor clicked at x: 350, y: 250
    Given Text "text" added to object number 0
    When Cursor clicked at x: 700, y: 700
    Given Shape with id: "RoundedRectangle" added to x: 300, y: 450
    When Cursor clicked at x: 350, y: 500
    Given Text "text" added to object number 1
    When Cursor clicked at x: 700, y: 700
    Given Shape with id: "Circle" added to x: 500, y: 200
    When Cursor clicked at x: 550, y: 250
    Given Text "text" added to object number 2
    When Cursor clicked at x: 700, y: 700
    Given Shape with id: "Rhombus" added to x: 500, y: 450
    When Cursor clicked at x: 550, y: 500
    Given Text "text" added to object number 3
    When Cursor clicked at x: 700, y: 700
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    When User changed text style on "<groupTextStyle>"
    Then Text style changed to "<groupTextStyleName>" on 0 object
    Then Text style changed to "<groupTextStyleName>" on 1 object
    Then Text style changed to "<groupTextStyleName>" on 2 object
    Then Text style changed to "<groupTextStyleName>" on 3 object
    Then Text style changed on the panel on "<groupTextStyle>" 
    Examples: 
    | groupTextStyle     | groupTextStyleName |
    | Bold               | bold               |
    | Italics            | italic             |
    | Underline          | underline          |
    | Strikethrough      | line-through       | 

  @microboard
  @applyTextStylesToObjectGroup
  Scenario: Applying <groupTextStyleName> style to group of shapes by hotkeys
    Given Shape with id: "Rectangle" added to x: 300, y: 200
    When Cursor clicked at x: 350, y: 250
    Given Text "text" added to object number 0
    When Cursor clicked at x: 700, y: 700
    Given Shape with id: "RoundedRectangle" added to x: 300, y: 450
    When Cursor clicked at x: 350, y: 500
    Given Text "text" added to object number 1
    When Cursor clicked at x: 700, y: 700
    Given Shape with id: "Circle" added to x: 500, y: 200
    When Cursor clicked at x: 550, y: 250
    Given Text "text" added to object number 2
    When Cursor clicked at x: 700, y: 700
    Given Shape with id: "Rhombus" added to x: 500, y: 450
    When Cursor clicked at x: 550, y: 500
    Given Text "text" added to object number 3
    When Cursor clicked at x: 700, y: 700
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    When The user presses the "<key>" key
    Then Text style changed to "<groupTextStyleName>" on 0 object
    Then Text style changed to "<groupTextStyleName>" on 1 object
    Then Text style changed to "<groupTextStyleName>" on 2 object
    Then Text style changed to "<groupTextStyleName>" on 3 object
    Then Text style changed on the panel on "<groupTextStyle>" 
    Examples: 
    | key          | groupTextStyle     | groupTextStyleName |
    | Control+B    | Bold               | bold               |
    | Control+I    | Italics            | italic             |
    | Control+U    | Underline          | underline          |
    | Control+S    | Strikethrough      | line-through       |  

  @microboard
  @applyTextStylesToObjectGroup
  Scenario: Applying <groupTextStyleName> style to group of text
    Given Text added to x: 300, y: 200
    When Cursor clicked at x: 300, y: 200
    Given Text "text" added to object number 0
    Given Text added to x: 300, y: 450
    When Cursor clicked at x: 300, y: 450
    Given Text "text" added to object number 1
    Given Text added to x: 500, y: 200
    When Cursor clicked at x: 500, y: 200
    Given Text "text" added to object number 2
    Given Text added to x: 500, y: 450
    When Cursor clicked at x: 500, y: 450
    Given Text "text" added to object number 3
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    When User changed text style on "<groupTextStyle>"
    Then Text style changed to "<groupTextStyleName>" on 0 object
    Then Text style changed to "<groupTextStyleName>" on 1 object
    Then Text style changed to "<groupTextStyleName>" on 2 object
    Then Text style changed to "<groupTextStyleName>" on 3 object
    Then Text style changed on the panel on "<groupTextStyle>" 
    Examples: 
    | groupTextStyle     | groupTextStyleName |
    | Bold               | bold               |
    | Italics            | italic             |
    | Underline          | underline          |
    | Strikethrough      | line-through       |  

  @microboard
  @applyTextStylesToObjectGroup
  Scenario: Applying <groupTextStyleName> style to group of text by hotkeys
    Given Text added to x: 300, y: 200
    When Cursor clicked at x: 300, y: 200
    Given Text "text" added to object number 0
    Given Text added to x: 300, y: 450
    When Cursor clicked at x: 300, y: 450
    Given Text "text" added to object number 1
    Given Text added to x: 500, y: 200
    When Cursor clicked at x: 500, y: 200
    Given Text "text" added to object number 2
    Given Text added to x: 500, y: 450
    When Cursor clicked at x: 500, y: 450
    Given Text "text" added to object number 3
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    When The user presses the "<key>" key
    Then Text style changed to "<groupTextStyleName>" on 0 object
    Then Text style changed to "<groupTextStyleName>" on 1 object
    Then Text style changed to "<groupTextStyleName>" on 2 object
    Then Text style changed to "<groupTextStyleName>" on 3 object
    Then Text style changed on the panel on "<groupTextStyle>" 
    Examples: 
    | key          | groupTextStyle     | groupTextStyleName |
    | Control+B    | Bold               | bold               |
    | Control+I    | Italics            | italic             |
    | Control+U    | Underline          | underline          |
    | Control+S    | Strikethrough      | line-through       |  

  @microboard
  @applyTextStylesToObjectGroup
  Scenario: Applying <groupTextStyleName> style to group of connectors
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 300
    Given Text "text" added to object number 0
    Given Connector added to x: 350, y: 300 and x: 350, y: 600
    When Cursor clicked at x: 350, y: 300
    Given Text "text" added to object number 1
    Given Connector added to x: 400, y: 300 and x: 400, y: 600
    When Cursor clicked at x: 400, y: 300
    Given Text "text" added to object number 2
    Given Connector added to x: 450, y: 300 and x: 450, y: 600
    When Cursor clicked at x: 450, y: 300
    Given Text "text" added to object number 3
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    When User changed text style on "<groupTextStyle>"
    Then Text style changed to "<groupTextStyleName>" on 0 object
    Then Text style changed to "<groupTextStyleName>" on 1 object
    Then Text style changed to "<groupTextStyleName>" on 2 object
    Then Text style changed to "<groupTextStyleName>" on 3 object
    Then Text style changed on the panel on "<groupTextStyle>" 
    Examples: 
    | groupTextStyle     | groupTextStyleName |
    | Bold               | bold               |
    | Italics            | italic             |
    | Underline          | underline          |
    | Strikethrough      | line-through       |

  @microboard
  @applyTextStylesToObjectGroup
  Scenario: Applying <groupTextStyleName> style to group of connectors by hotkeys
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 300
    Given Text "text" added to object number 0
    Given Connector added to x: 350, y: 300 and x: 350, y: 600
    When Cursor clicked at x: 350, y: 300
    Given Text "text" added to object number 1
    Given Connector added to x: 400, y: 300 and x: 400, y: 600
    When Cursor clicked at x: 400, y: 300
    Given Text "text" added to object number 2
    Given Connector added to x: 450, y: 300 and x: 450, y: 600
    When Cursor clicked at x: 450, y: 300
    Given Text "text" added to object number 3
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    When The user presses the "<key>" key
    Then Text style changed to "<groupTextStyleName>" on 0 object
    Then Text style changed to "<groupTextStyleName>" on 1 object
    Then Text style changed to "<groupTextStyleName>" on 2 object
    Then Text style changed to "<groupTextStyleName>" on 3 object
    Then Text style changed on the panel on "<groupTextStyle>" 
    Examples: 
    | key          | groupTextStyle     | groupTextStyleName |
    | Control+B    | Bold               | bold               |
    | Control+I    | Italics            | italic             |
    | Control+U    | Underline          | underline          |
    | Control+S    | Strikethrough      | line-through       |   

  @microboard
  @applyTextStylesToObjectGroup
  Scenario: Applying <groupTextStyleName> style to group of stickers
    Given Sticker added to x: 300, y: 300
    Given Text "text" added to object number 0
    Given Sticker added to x: 600, y: 300
    Given Text "text" added to object number 1
    Given Sticker added to x: 300, y: 500
    Given Text "text" added to object number 2
    Given Sticker added to x: 600, y: 500
    Given Text "text" added to object number 3
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    When User changed text style on "<groupTextStyle>"
    Then Text style changed to "<groupTextStyleName>" on 0 object
    Then Text style changed to "<groupTextStyleName>" on 1 object
    Then Text style changed to "<groupTextStyleName>" on 2 object
    Then Text style changed to "<groupTextStyleName>" on 3 object
    Then Text style changed on the panel on "<groupTextStyle>" 
    Examples: 
    | groupTextStyle     | groupTextStyleName |
    | Bold               | bold               |
    | Italics            | italic             |
    | Underline          | underline          |
    | Strikethrough      | line-through       |   

  @microboard
  @applyTextStylesToObjectGroup
  Scenario: Applying <groupTextStyleName> style to group of stickers by hotkeys
    Given Sticker added to x: 300, y: 300
    Given Text "text" added to object number 0
    Given Sticker added to x: 600, y: 300
    Given Text "text" added to object number 1
    Given Sticker added to x: 300, y: 500
    Given Text "text" added to object number 2
    Given Sticker added to x: 600, y: 500
    Given Text "text" added to object number 3
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    When The user presses the "<key>" key
    Then Text style changed to "<groupTextStyleName>" on 0 object
    Then Text style changed to "<groupTextStyleName>" on 1 object
    Then Text style changed to "<groupTextStyleName>" on 2 object
    Then Text style changed to "<groupTextStyleName>" on 3 object
    Then Text style changed on the panel on "<groupTextStyle>" 
    Examples: 
    | key          | groupTextStyle     | groupTextStyleName |
    | Control+B    | Bold               | bold               |
    | Control+I    | Italics            | italic             |
    | Control+U    | Underline          | underline          |
    | Control+S    | Strikethrough      | line-through       | 

  @microboard
  @applyTextStylesToObjectGroup
  Scenario: Applying <groupTextStyleName> style to group of sticker and shape by hotkeys
    Given Sticker added to x: 300, y: 300
    Given Text "text" added to object number 0
    Given Shape added to x: 600, y: 300
    Given Text "text" added to object number 1
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    When The user presses the "<key>" key
    Then Text style changed to "<groupTextStyle>" on 0 object
    Then Text style changed to "<groupTextStyle>" on 1 object
    Examples: 
    | key          | groupTextStyle     |
    | Control+B    | bold               |
    | Control+I    | italic             |
    | Control+U    | underline          |
    | Control+S    | line-through       |

  @microboard
  @applyTextStylesToObjectGroup
  Scenario: Applying <groupTextStyleName> style to group of sticker and text by hotkeys
    Given Sticker added to x: 300, y: 300
    Given Text "text" added to object number 0
    Given Shape added to x: 600, y: 300
    Given Text "text" added to object number 1
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    When The user presses the "<key>" key
    Then Text style changed to "<groupTextStyle>" on 0 object
    Then Text style changed to "<groupTextStyle>" on 1 object
    Examples: 
    | key          | groupTextStyle     |
    | Control+B    | bold               |
    | Control+I    | italic             |
    | Control+U    | underline          |
    | Control+S    | line-through       |  

  @microboard
  @applyTextStylesToObjectGroup
  Scenario: Applying <groupTextStyleName> style to group of sticker and connectors by hotkeys
    Given Sticker added to x: 300, y: 300
    Given Text "text" added to object number 0
    Given Connector added to x: 500, y: 300 and x: 500, y: 600
    Given Text "text" added to object number 1
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    When The user presses the "<key>" key
    Then Text style changed to "<groupTextStyle>" on 0 object
    Then Text style changed to "<groupTextStyle>" on 1 object
    Examples: 
    | key          | groupTextStyle     |
    | Control+B    | bold               |
    | Control+I    | italic             |
    | Control+U    | underline          |
    | Control+S    | line-through       |

  @microboard
  @applyTextStylesToObjectGroup
  Scenario: Applying <groupTextStyleName> style to group of shape and text by hotkeys
    Given Shape added to x: 300, y: 300
    Given Text "text" added to object number 0
    Given Text added to x: 500, y: 300
    Given Text "text" added to object number 1
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    When The user presses the "<key>" key
    Then Text style changed to "<groupTextStyle>" on 0 object
    Then Text style changed to "<groupTextStyle>" on 1 object
    Examples: 
    | key          | groupTextStyle     |
    | Control+B    | bold               |
    | Control+I    | italic             |
    | Control+U    | underline          |
    | Control+S    | line-through       |

  @microboard
  @applyTextStylesToObjectGroup
  Scenario: Applying <groupTextStyleName> style to group of shape and connector by hotkeys
    Given Shape added to x: 300, y: 300
    Given Text "text" added to object number 0
    Given Connector added to x: 500, y: 300 and x: 500, y: 600
    When Cursor clicked at x: 500, y: 300
    Given Text "text" added to object number 1
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    When The user presses the "<key>" key
    Then Text style changed to "<groupTextStyle>" on 0 object
    Then Text style changed to "<groupTextStyle>" on 1 object
    Examples: 
    | key          | groupTextStyle     |
    | Control+B    | bold               |
    | Control+I    | italic             |
    | Control+U    | underline          |
    | Control+S    | line-through       | 

  @microboard
  @applyTextStylesToObjectGroup
  Scenario: Applying <groupTextStyleName> style to group of text and connector by hotkeys
    Given Text added to x: 300, y: 300
    Given Text "text" added to object number 0
    Given Connector added to x: 500, y: 300 and x: 500, y: 600
    When Cursor clicked at x: 500, y: 300
    Given Text "text" added to object number 1
    When Selecting a group start x: 100, y: 100 and end x: 700, y: 700
    When The user presses the "<key>" key
    Then Text style changed to "<groupTextStyle>" on 0 object
    Then Text style changed to "<groupTextStyle>" on 1 object
    Examples: 
    | key          | groupTextStyle     |
    | Control+B    | bold               |
    | Control+I    | italic             |
    | Control+U    | underline          |
    | Control+S    | line-through       | 

  @microboard
  @changingTextInObject
  Scenario: Changing text in the Sticker
    Given Sticker added to x: 300, y: 300
    Given Text "text" added to object
    Then Text "text" of object number 0 has been inserted in full
    When Cursor clicked at x: 700, y: 700
    When The user presses the "Control+A" key
    Given User typed the text: "Texttext"
    Then Text "Texttext" of object number 0 has been inserted in full

  @microboard
  @changingTextInObject
  Scenario: Changing text in the Text
    Given Text added to x: 500, y: 500
    Given Text "text" added to object
    Then Text "text" of object number 0 has been inserted in full
    When Cursor clicked at x: 700, y: 700
    When The user presses the "Control+A" key
    Given User typed the text: "Texttext"
    Then Text "Texttext" of object number 0 has been inserted in full

  @microboard
  @changingTextInObject
  Scenario: Changing text in the Shape
    Given Shape added to x: 500, y: 500
    When Cursor clicked at x: 550, y: 550 twice
    Given Text "text" added to object
    Then Text "text" of object number 0 has been inserted in full
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 550, y: 550
    When Cursor clicked at x: 550, y: 550
    Given User typed the text: "Texttext"
    Then Text "Texttext" of object number 0 has been inserted in full

  @microboard
  @changingTextInObject
  Scenario: Changing text in the Connector
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 450 twice
    Given Text "text" added to object
    Then Text "text" of object number 0 has been inserted in full
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 500
    Given User typed the text: "Texttext"
    Then Text "Texttext" of object number 0 has been inserted in full

  @microboard
  @checkingTextModeAfterChangingTextStyle
  Scenario: Checking text mode after changing text style
    Given Sticker added to x: 500, y: 500
    When Cursor clicked at x: 500, y: 500
    When User changed text style on "bold" by app
    When User changed text size by clicking on panel dropdown 24 font size
    When User changed text color on "rgb(254, 244, 69)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    # Then Panel is near item and item has a cursor
    Given Text "text" added to object
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(254, 244, 69)"
    Then Text size changed on 24
    Then Text style changed on "bold"

  @microboard
  @checkingTextModeAfterChangingTextStyle
  Scenario: Checking text mode after changing text style
    Given Text added to x: 500, y: 500
    When Cursor clicked at x: 500, y: 500
    When User changed text style on "bold" by app
    When User changed text size on 24 by app
    When User changed text color on "rgb(254, 244, 69)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    # Then Panel is near item and item has a cursor
    Given Text "text" added to object
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(254, 244, 69)"
    Then Text size changed on 24
    Then Text style changed on "bold"

  @microboard
  @checkingTextModeAfterChangingTextStyle
  Scenario: Checking text mode after changing text style
    When Cursor clicked at x: 500, y: 500
    Given Shape added to x: 500, y: 500
    When Cursor clicked at x: 550, y: 550
    When User changed text style on "bold" by app
    When User changed text size on 24 by app
    When User changed text color on "rgb(254, 244, 69)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    # Then Panel is near item and item has a cursor
    Given Text "text" added to object
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(254, 244, 69)"
    Then Text size changed on 24
    Then Text style changed on "bold"

  @microboard
  @checkingTextModeAfterChangingTextStyle
  Scenario: Checking text mode after changing text style
    Given Connector added to x: 300, y: 300 and x: 300, y: 600
    When Cursor clicked at x: 300, y: 450 twice
    When User changed text style on "bold" by app
    When User changed text size on 24 by app
    When User changed text color on "rgb(254, 244, 69)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    # Then Panel is near item and item has a cursor
    Given Text "text" added to object
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(254, 244, 69)"
    Then Text size changed on 24
    Then Text style changed on "bold"
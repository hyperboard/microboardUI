@transformObject
Feature: Transform object by corner and lateral border

  @microboard
  Scenario: Increase sticker size beyond the button right corner and text has been inserted in full
    Given Sticker added to x: 100, y: 100
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Faucibus pulvinar elementum integer enim. Sed ullamcorper morbi tincidunt ornare massa eget. Interdum varius sit amet mattis vulputate. Dictum fusce ut placerat orci nulla. Sed euismod nisi porta lorem mollis aliquam ut porttitor leo. Congue mauris rhoncus aenean vel elit. Nulla facilisi morbi tempus iaculis urna id volutpat lacus laoreet." added to object
    When User transform object beyond the 200 and 200 corner to 400 and 400
    When Cursor clicked at x: 100, y: 100
    When Cursor clicked at x: 100, y: 100 twice
    Then Text saved 3 paragraphs
    Then Sticker text size is automatically detected
    Then Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.Faucibus pulvinar elementum integer enim. Sed ullamcorper morbi tincidunt ornare massa eget. Interdum varius sit amet mattis vulputate. Dictum fusce ut placerat orci nulla. Sed euismod nisi porta lorem mollis aliquam ut porttitor leo. Congue mauris rhoncus aenean vel elit. Nulla facilisi morbi tempus iaculis urna id volutpat lacus laoreet." of object number 0 has been inserted in full

  @microboard
  Scenario: Decrease sticker size beyond the button right corner and text has been inserted in full
    Given Sticker added to x: 300, y: 300
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Faucibus pulvinar elementum integer enim. Sed ullamcorper morbi tincidunt ornare massa eget. Interdum varius sit amet mattis vulputate. Dictum fusce ut placerat orci nulla. Sed euismod nisi porta lorem mollis aliquam ut porttitor leo. Congue mauris rhoncus aenean vel elit. Nulla facilisi morbi tempus iaculis urna id volutpat lacus laoreet." added to object
    When User transform object beyond the 400 and 400 corner to 350 and 350
    When Cursor clicked at x: 700, y: 700
    When Cursor clicked at x: 300, y: 300
    When Cursor clicked at x: 300, y: 300 twice
    Then Text saved 3 paragraphs
    Then Sticker text size is automatically detected
    Then Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.Faucibus pulvinar elementum integer enim. Sed ullamcorper morbi tincidunt ornare massa eget. Interdum varius sit amet mattis vulputate. Dictum fusce ut placerat orci nulla. Sed euismod nisi porta lorem mollis aliquam ut porttitor leo. Congue mauris rhoncus aenean vel elit. Nulla facilisi morbi tempus iaculis urna id volutpat lacus laoreet." of object number 0 has been inserted in full
  
  @microboard
  Scenario: Transform sticker beyond the button right corner
    Given Sticker added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book." added to object
    When The user presses the "Enter" key
    When The user presses the "Enter" key
    Given Text "Faucibus pulvinar elementum integer enim. Sed ullamcorper morbi tincidunt ornare massa eget. Interdum varius sit amet mattis vulputate. Dictum fusce ut placerat orci nulla. Sed euismod nisi porta lorem mollis aliquam ut porttitor leo. Congue mauris rhoncus aenean vel elit. Nulla facilisi morbi tempus iaculis urna id volutpat lacus laoreet." added to object
    When Cursor clicked at x: 210, y: 210
    When User changed text alignment on "right" by app
    When User changed text style on "bold" by app
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 400 and 400 corner to 600 and 600
    Then Object is transformed to w: 380 and y: h: 380
    Then Text is transformed
    # Then Text isnt doubled
    When The user presses the "Control+A" key
    Then Text alignment "Horisontal" changed on "right"
    Then Text style changed on "bold"
    Then Text style changed on the panel on "Bold" 
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)"
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 380 and y: h: 380
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text style changed on "bold" 
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When Cursor clicked at x: 200, y: 200 twice
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)" 

  @microboard
  Scenario: Transform shape beyond the button right corner
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 350, y: 350
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 350, y: 350
    When The user presses the "Control+A" key
    When User changed text alignment on "right" by app
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 400 and 400 corner to 500 and 500
    Then Object is transformed to w: 190 and y: h: 190
    # Then Text isnt doubled
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"  
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)"
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 190 and y: h: 190
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on the panel on "rgb(255, 255, 255)"

  @microboard
  Scenario: Transform text beyond the button right corner
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 300, y: 300
    When The user presses the "Control+A" key
    When User changed text alignment on "right" by app
    When User changed text style on "bold" by app
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 898 and 438 corner to 998 and 538
    Then Object is transformed to w: 700 and y: h: 150
    # Then Text isnt doubled
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text style changed on "bold"
    Then Text style changed on the panel on "Bold" 
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"  
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)"
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 700 and y: h: 150
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text style changed on "bold"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When Cursor clicked at x: 310, y: 310
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"  
    Then Text color changed on the panel on "rgb(255, 255, 255)"  

  @microboard
  Scenario: Transform sticker beyond the top right corner
    Given Sticker added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 300, y: 300
    When The user presses the "Control+A" key
    When User changed text alignment on "right" by app
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 400 and 200 corner to 600 and 100
    Then Object is transformed to w: 340 and y: h: 340
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)"
    # Then Text isnt doubled
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 340 and y: h: 340
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When Cursor clicked at x: 300, y: 300
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"  
    Then Text color changed on the panel on "rgb(255, 255, 255)" 

  @microboard
  Scenario: Transform shape beyond the top right corner
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 350, y: 350
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 350, y: 350
    When The user presses the "Control+A" key
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User changed text alignment on "right" by app
    When User transform object beyond the 400 and 300 corner to 500 and 200
    Then Object is transformed to w: 180 and y: h: 180
    # Then Text isnt doubled
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)"
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 180 and y: h: 180
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"  
    Then Text color changed on the panel on "rgb(255, 255, 255)" 

  @microboard
  Scenario: Transform text beyond the top right corner
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 300, y: 300
    When The user presses the "Control+A" key
    When User changed text alignment on "right" by app
    When User changed text style on "Bold"
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 900 and 300 corner to 1000 and 200
    Then Object is transformed to w: 700 and y: h: 150
    # Then Text isnt doubled
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text style changed on "bold"
    Then Text style changed on the panel on "Bold" 
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)"
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 700 and y: h: 150
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text style changed on "bold" 
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"  
    Then Text color changed on the panel on "rgb(255, 255, 255)" 

  @microboard
  @transformObject
  Scenario: Transform sticker beyond the top left corner
    Given Sticker added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 300, y: 300
    When The user presses the "Control+A" key
    When User changed text alignment on "right" by app
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 200 and 200 corner to 100 and 100
    Then Object is transformed to w: 290 and y: h: 290
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)"
    # Then Text isnt doubled
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 290 and y: h: 290
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"  
    Then Text color changed on the panel on "rgb(255, 255, 255)" 

  @microboard
  Scenario: Transform shape beyond the top left corner
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 350, y: 350
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 350, y: 350
    When The user presses the "Control+A" key
    When User changed text alignment on "right" by app
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 300 and 300 corner to 200 and 200
    Then Object is transformed to w: 190 and y: h: 190
    # Then Text isnt doubled
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)"
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 190 and y: h: 190
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"  
    Then Text color changed on the panel on "rgb(255, 255, 255)" 

  @microboard
  Scenario: Transform text beyond the top left corner
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 350, y: 350
    When The user presses the "Control+A" key
    When User changed text alignment on "right" by app
    When User changed text style on "bold" by app
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 299 and 299 corner to 200 and 200
    Then Object is transformed to w: 700 and y: h: 150
    # Then Text isnt doubled
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text style changed on "bold"
    Then Text style changed on the panel on "Bold" 
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)"
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 700 and y: h: 150
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text style changed on "bold" 
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When Cursor clicked at x: 300, y: 300
    When Cursor clicked at x: 300, y: 300 twice
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"  
    Then Text color changed on the panel on "rgb(255, 255, 255)" 

  @microboard
  Scenario: Transform sticker beyond the bottom left corner
    Given Sticker added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 300, y: 300 twice
    When The user presses the "Control+A" key
    When User changed text alignment on "right" by app
    When User changed text style on "Bold"
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 200 and 400 corner to 100 and 600
    Then Object is transformed to w: 340 and y: h: 340
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text style changed on "bold"
    Then Text style changed on the panel on "Bold" 
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)" 
    # Then Text isnt doubled
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 340 and y: h: 340
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text style changed on "bold" 
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)" 
    When The user presses the "Control+A" key
    Then Text color changed on the panel on "rgb(255, 255, 255)" 
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 

  @microboard
  Scenario: Transform shape beyond the bottom left corner
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 350, y: 350
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 350, y: 350 twice
    When The user presses the "Control+A" key
    When User changed text alignment on "right" by app
    When User changed text style on "Bold"
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 300 and 400 corner to 200 and 500
    Then Object is transformed to w: 180 and y: h: 180
    # Then Text isnt doubled
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text style changed on "bold"
    Then Text style changed on the panel on "Bold" 
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)" 
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 180 and y: h: 180
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text style changed on "bold"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When The user presses the "Control+A" key
    When Cursor clicked at x: 350, y: 350
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"  
    Then Text color changed on the panel on "rgb(255, 255, 255)"
  
  @microboard
  Scenario: Transform text beyond the bottom left corner
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 300, y: 300
    When The user presses the "Control+A" key
    When User changed text alignment on "right" by app
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 305 and 437 corner to 200 and 700
    Then Object is transformed to w: 760 and y: h: 160
    # Then Text isnt doubled
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)"
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 760 and y: h: 160
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When The user presses the "Control+A" key
    When Cursor clicked at x: 300, y: 300
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"  
    Then Text color changed on the panel on "rgb(255, 255, 255)"

  @microboard
  Scenario: Transform sticker beyond the right lateral border
    Given Sticker added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 300, y: 300
    When The user presses the "Control+A" key
    When User changed text alignment on "right" by app
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 400 and 350 corner to 600 and 350
    Then Object is transformed to w: 250 and y: h: 180
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)"
    # Then Text isnt doubled
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 250 and y: h: 180
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"  
    Then Text color changed on the panel on "rgb(255, 255, 255)"

  @microboard
  Scenario: Transform shape beyond the right lateral border
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 350, y: 350
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 350, y: 350
    When The user presses the "Control+A" key
    When User changed text alignment on "right" by app
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 400 and 350 corner to 600 and 350
    Then Object is transformed to w: 290 and y: h: 100
    # Then Text isnt doubled
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"  
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)"
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 290 and y: h: 100
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on the panel on "rgb(255, 255, 255)" 

  @microboard
  Scenario: Transform text beyond the right lateral border
    Given Text added to x: 300, y: 300
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 320, y: 320
    When The user presses the "Control+A" key
    When User changed text alignment on "right" by app
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 900 and 350 corner to 1100 and 350
    Then Object is transformed to w: 780 and y: h: 97
    # Then Text isnt doubled
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"  
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)"
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 780 and y: h: 97
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on the panel on "rgb(255, 255, 255)" 

  @microboard
  Scenario: Transform shape beyond the top lateral border
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 350, y: 350
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 350, y: 350
    When The user presses the "Control+A" key
    When User changed text alignment on "right" by app
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 350 and 300 corner to 350 and 150
    Then Object is transformed to w: 100 and y: h: 240
    # Then Text isnt doubled
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"  
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)"
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 100 and y: h: 240
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on the panel on "rgb(255, 255, 255)" 

  @microboard
  Scenario: Transform sticker beyond the left lateral border
    Given Sticker added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 300, y: 300
    When The user presses the "Control+A" key
    When User changed text alignment on "right" by app
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 200 and 350 corner to 200 and 150
    Then Object is transformed to w: 260 and y: h: 190
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)" 
    # Then Text isnt doubled
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 260 and y: h: 190
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on the panel on "rgb(255, 255, 255)" 

  @microboard
  Scenario: Transform shape beyond the left lateral border
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 350, y: 350
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 350, y: 350
    When The user presses the "Control+A" key
    When User changed text alignment on "right" by app
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 300 and 350 corner to 200 and 350
    Then Object is transformed to w: 190 and y: h: 100
    # Then Text isnt doubled
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"  
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)"
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 190 and y: h: 100
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on the panel on "rgb(255, 255, 255)" 

  @microboard
  Scenario: Transform text beyond the left lateral border
    Given Text added to x: 300, y: 300
    When Cursor clicked at x: 300, y: 300
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 300, y: 300
    When The user presses the "Control+A" key
    When User changed text alignment on "right" by app
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 299 and 400 corner to 100 and 400
    Then Object is transformed to w: 760 and y: h: 97
    # Then Text isnt doubled
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"  
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)"
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 760 and y: h: 97
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on the panel on "rgb(255, 255, 255)" 

  @microboard
  Scenario: Transform shape beyond the button lateral border
    Given Shape added to x: 300, y: 300
    When Cursor clicked at x: 350, y: 350
    Given Text "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." added to object
    When Cursor clicked at x: 350, y: 350
    When The user presses the "Control+A" key
    When User changed text alignment on "right" by app
    When User changed text color on "rgb(255, 255, 255)" by app
    When User changed text highlight color on "rgb(255, 255, 255)" by app
    When User transform object beyond the 350 and 400 corner to 350 and 600
    Then Object is transformed to w: 100 and y: h: 280
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)"  
    Then Text color changed on "rgb(255, 255, 255)"
    Then Text color changed on the panel on "rgb(255, 255, 255)" 
    # Then Text isnt doubled
    When Cursor clicked at x: 700, y: 700
    Then Object is transformed to w: 100 and y: h: 280
    Then Text is transformed
    Then Text alignment "Horisontal" changed on "right"
    Then Text highlight color changed on "rgb(255, 255, 255)"
    Then Text color changed on "rgb(255, 255, 255)"
    When The user presses the "Control+A" key
    Then Text highlight color changed on the panel on "rgb(255, 255, 255)" 
    Then Text color changed on the panel on "rgb(255, 255, 255)" 

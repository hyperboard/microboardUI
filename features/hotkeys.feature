@hotkeys
Feature: Hotkeys
  @microboard
  Scenario: User can press a hotkey to select the "<toolName>" tool
    When The user presses the "<key>" key
    Then "<toolName>" tool is selected
    Examples: 
    | toolName        | key |
    | AddShape        | S   |
    | AddText         | T   |
    | AddConnector    | L   |
    | AddSticker      | N   |
    | AddDrawing      | P   |
    | AddFrame        | F   |
    | Select          | V   |

  @microboard
  Scenario: User can press a hotkey to zoom in
    When The user presses the "Control+Equal" key
    Then The board is zoomed in
    When The user presses the "Control+Minus" key
  @microboard
  Scenario: User can press a hotkey to zoom out
    When The user presses the "Control+Minus" key
    Then The board is zoomed out
    When The user presses the "Control+Equal" key
  @microboard
  Scenario: User can press a hotkey to zoom default
    Given The board is zooming out
    When The user presses the "Control+0" key
    Then The board is zoomed default
  @microboard
  Scenario: User can press a hotkey to duplicate
    Given Sticker added to x: 100, y: 100
    When The user presses the "Control+D" key
    Then Selected item duplicated
  @microboard
  Scenario: User can press a hotkey to delete
    Given Sticker added to x: 300, y: 300
    Given Cursor clicked at x: 700, y: 700
    Given Cursor clicked at x: 300, y: 300
    Given Cursor clicked at x: 200, y: 200
    When The user presses the "Delete" key
    Then 0 items on the board
  @microboard
  Scenario: User can press a hotkey to select all items
    Given Sticker added to x: 100, y: 100
    Given Sticker added to x: 200, y: 100
    Given Sticker added to x: 300, y: 100
    Given Cursor clicked at x: 300, y: 300
    When The user presses the "Control+A" key
    Then 3 items are selected
  @microboard
  Scenario: User can press a hotkey to cancel
    Given Export enabled
    When The user presses the "Escape" key
    Then Export canceled
  @microboard
  Scenario: User can press a hotkey to undo
    Given Sticker added to x: 100, y: 100
    When The user presses the "Control+Z" key
    Then 0 items on the board
  @microboard
  Scenario: User can press a hotkey to redo
    Given Sticker added to x: 100, y: 100
    When The user presses the "Control+Z" key
    When The user presses the "Control+Shift+Z" key
    Then 1 items on the board
  @microboard
  Scenario: User can press a hotkey to send to back
    Given Sticker added to x: 100, y: 100
    Given Sticker added to x: 200, y: 200
    When The user presses the "PageDown" key
    Then Selected item has zIndex 0
  @microboard
  Scenario: User can press a hotkey to bring to front
    Given Sticker added to x: 100, y: 100
    Given Sticker added to x: 300, y: 100
    Given Cursor clicked at x: 110, y: 110
    When The user presses the "PageUp" key
    Then Selected item has zIndex 1
  @microboard
  Scenario: User can copy and paste
    Given Sticker added to x: 100, y: 100
    When User clicks to x: 700, y: 700
    When User clicks to x: 100, y: 100
    When The user presses the "Control+C" key
    When User clicks to x: 200, y: 200
    When The user presses the "Control+V" key
    Then 2 items on the board
  @microboard
  Scenario: User can press a hotkey to apply the <style> style on the <os>
    Given Shape added to x: 100, y: 100
    Given Text "text" added to object
    Given Cursor clicked at x: 700, y: 700
    Given Cursor clicked at x: 150, y: 150
    When The user presses the "<key>" key
    Then Text is textStyle: "<style>"
    Examples: 
    | style      | key         | os        |
    | bold       | Control+B   |  windows  |
    | strike     | Control+S   |  windows  |
    | underline  | Control+U   |  windows  |
    | italic     | Control+I   |  windows  |
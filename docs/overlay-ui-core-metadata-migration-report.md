# Overlay UI Core Metadata Migration Report

## A. Executive Summary

This pass removes the active UI-side identity tables that still encoded core/plugin knowledge for the migrated overlay surfaces.

The toolbar renderer now derives its entries from `listToolOverlays()`, the context panel renderer now derives its actions from `intersectOverlayActions(items)` plus `getSelectionOverlayActions(items)`, and the generic editor layer renders supported controls from metadata without tool/action allowlists.

The main architectural improvement is that the overlay renderer no longer contains hardcoded enumerations of tool ids, action ids, icon ids, shape ids, or pointer ids for the migrated surfaces.

Intentionally still custom in this phase:

- `AddCard` modal launcher behavior
- screen background image add/remove flow
- richer text controls beyond metadata font size
- connector text controls
- lock/group/delete/rest-menu actions
- exact row decomposition, overflow policy, and surrounding layout composition

## B. Toolbar Migration

Toolbar entries are now rendered by iterating metadata from `listToolOverlays()` instead of a UI-owned list of tool names.

Metadata-driven fields now used directly:

- tool identity
- label
- icon
- defaults controls
- defaults groups
- tool kind behavior through the overlay contract and board tool activation

UI simplifications retained in this phase:

- drawing-family tools are rendered as separate top-level entries rather than preserving the old launcher wrapper
- game-item tools are rendered as ordinary top-level metadata entries rather than preserving the old submenu wrapper
- toolbar placement is still UI-owned

Ordering status:

- the toolbar no longer uses a hardcoded `TOOL_ORDER`
- current ordering is generic metadata sorting by `family` and then `label`
- if core needs canonical cross-plugin ordering, it should expose explicit ordering metadata

## C. Context Panel Migration

Context-panel actions are now rendered directly from:

- `intersectOverlayActions(items)`
- `getSelectionOverlayActions(items)`

There is no longer a UI allowlist of supported action ids in the active renderer.

Metadata-driven fields now used directly:

- action identity
- label
- icon
- controls
- groups
- invocation metadata

Hardcoded overlay branches removed from the active renderer:

- shape type/fill/stroke overlay wiring
- connector pointer/style/smart-jump overlay wiring
- dice throw/range/fill overlay wiring
- deck draw/shuffle/flip overlay wiring
- card flip/rotate overlay wiring
- the mixed `Card + Deck` special-case create-deck overlay branch

The context panel still has item-type branches, but they now serve custom layout and non-metadata controls around the migrated overlay actions rather than acting as the source of truth for the migrated action sets.

## D. Generic Editor Layer

Implemented generic editor kinds:

- `color`
- `enum-icon`
- `enum-list`
- `number`
- `number-stepper`
- `slider`
- `toggle`
- `dynamic-options`
- `catalog`

Generic behavior now supported:

- grouped controls through metadata `groups`
- dynamic option lookup through `resolveDynamicOptions(...)`
- metadata-driven catalogs
- metadata-driven option labels and icons
- optional `icon.state.swatch` badge rendering

The active renderer no longer translates shape types, connector pointers, or similar option spaces through UI-owned identity maps.

## E. Icon Migration

Supported icon contract in the active renderer:

- `symbol`
- `asset`
- optional `icon.state.swatch`

Current rendering behavior:

- `symbol` is rendered generically by trying the symbol key directly against the UI sprite
- `asset` is rendered generically by deriving a symbol id from the asset filename basename, then attempting to render that sprite symbol
- `state.swatch` renders as a generic swatch badge
- when neither symbol resolution path works, the renderer falls back to a generic label initial instead of a per-icon lookup table

What was removed:

- hardcoded tool icon map
- hardcoded action icon map
- hardcoded shape asset-path map
- hardcoded shape symbol-to-type map
- hardcoded connector pointer-symbol map

Important limitation:

- the current core/package contract still does not provide a universally renderable icon payload for every `symbol`/`asset` in a plugin-independent way
- the UI therefore relies on a generic local convention: sprite id matches metadata symbol key or asset basename
- when that convention does not hold, the renderer falls back generically instead of restoring hardcoded maps

## F. Hardcoded-Knowledge Audit

### Removed

- `TOOL_ORDER`
- `SUPPORTED_ACTION_IDS`
- `TOOL_ICON_MAP`
- `ACTION_ICON_MAP`
- `SHAPE_SYMBOL_TO_TYPE`
- `SHAPE_ASSET_TO_TYPE`
- `POINTER_SYMBOL_TO_UI`
- active-renderer filtering of overlay actions by known ids
- active-renderer filtering of toolbar tools by known tool names

### Still Present Temporarily

- item-type layout branches in [ContextPanel.tsx](/home/alex/microboard/hyperboard/microboardUI/src/features/ContextPanel/ContextPanel.tsx) still decide which surrounding non-metadata controls are shown
- custom `AddCard` handling in [ToolsPanel.tsx](/home/alex/microboard/hyperboard/microboardUI/src/features/ToolsPanel/ToolsPanel.tsx) remains outside metadata because this phase intentionally keeps that modal flow custom
- legacy bespoke button components for older overlay behavior still exist in the repo, but they are no longer the active renderer for the migrated overlay surfaces

### Blocked By Missing Core Metadata

- canonical toolbar ordering across plugins
- canonical toolbar family/wrapper presentation beyond simple generic grouping/sorting
- guaranteed renderable icon payload for every metadata `symbol`
- guaranteed browser-consumable asset payload or asset URL for every metadata `asset`

## G. Blocker Report Back To Core

### 1. Toolbar ordering and presentation

UI hardcoding otherwise needed:

- explicit tool-name order arrays
- explicit knowledge of which tools belong inside wrappers/submenus

Missing core capability:

- stable ordering metadata for tools
- optional metadata describing wrapper/family presentation when exact product grouping matters

Minimal core change:

- add explicit numeric ordering metadata for tool overlays
- optionally add presentation/family metadata that distinguishes simple family labels from actual wrapper semantics

### 2. Plugin-independent icon rendering

UI hardcoding otherwise needed:

- icon-key lookup maps
- asset-path lookup maps
- per-option symbol translation tables

Missing core capability:

- a guaranteed renderable icon payload or stable UI-independent icon resource contract for metadata icons

Minimal core change:

- either expose inline-safe render data for icons, or expose stable asset URLs / bundled sprite ids that are guaranteed to resolve in UI without local conventions

### 3. Exact wrapper behavior for launcher-style tools

UI hardcoding otherwise needed:

- explicit knowledge that some tools should appear under a drawing launcher or game-item submenu

Missing core capability:

- metadata that describes launcher/wrapper behavior as first-class presentation, if that behavior is intended to be portable across plugins

Minimal core change:

- expose wrapper metadata, or explicitly declare wrapper composition to be permanently UI-owned so the contract boundary is clear

## H. Remaining Custom Logic

Intentionally outside metadata in this phase:

- `AddCard` modal creation flow
- screen background image add/remove flow
- connector text editing controls
- non-metadata rich-text controls beyond font size
- lock/unlock behavior
- grouping, detach-from-group, select-parent, delete, duplicate, and rest-menu actions
- exact row decomposition and placement policy
- overflow/rest-menu strategy

## I. Remaining Blockers

- `bun run typecheck` still fails because the `microboard-temp` update introduced wider API breakages outside the overlay migration area in paste/media/import/export/AI paths
- metadata icon rendering is now generic, but fully plugin-portable icon fidelity still depends on stronger core icon delivery guarantees
- if product-exact toolbar ordering or wrapper behavior must be preserved across plugins, core still needs to expose that presentation metadata explicitly

## Final Question

After this pass, what concrete knowledge about tools, items, actions, options, and icons still remains in the UI repository, and why has it not yet been eliminated?

Remaining concrete knowledge in the active UI renderer:

- generic assumptions about icon resolution conventions: metadata `symbol` should match a local sprite id, and metadata `asset` should have a basename matching a local sprite id
- generic sorting policy for toolbar entries: `family`, then `label`
- item-type-based layout composition around the overlay actions in the context panel, because the surrounding non-overlay controls are still intentionally custom

Knowledge intentionally still custom because it is outside this phase:

- `AddCard` is still a custom modal entry
- screen background image behavior is still a custom flow
- richer text and connector text behaviors still use custom controls
- surrounding lock/group/delete/rest-menu behavior is still owned by the UI layer

Knowledge not yet eliminated because core does not yet expose enough contract surface:

- exact cross-plugin toolbar ordering
- exact wrapper/submenu presentation semantics
- fully portable icon payloads for arbitrary plugin-defined `symbol` and `asset` metadata without relying on UI-side sprite conventions

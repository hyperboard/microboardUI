# Board Templates Feature Documentation

This document describes the current implementation of the board templates and translation features and outlines the plan for refactoring.

## Current Implementation

### Templates

- **Storage**: Templates are currently stored and managed on the server side.
- **Selection**:
  - `SelectTemplateModal.tsx` fetches a list of available templates from `${getApiUrl()}/templates` (GET).
  - It supports filtering by category (tag) and search term.
- **Usage**:
  - When a user selects a template, `TemplateItem` or `TemplateItemPreview` calls `fetchTemplateSnapshot(templateId)`.
  - `fetchTemplateSnapshot` (in `src/features/Templates/lib.ts`) makes a POST request to `${getApiUrl()}/templates/${templateId}/connect`, which returns a WebSocket URL and a JWT.
  - The client connects via WebSocket to receive the `BoardSnapshot`.
  - The snapshot is then pasted into the board using `pasteSnapshot`.
- **Preview**:
  - `TemplateItemPreview` displays a live preview of the template in an `iframe` by navigating to `/templates/${templateId}`.
- **Creation**:
  - `CreateTemplateModal.tsx` allows authorized users to create a template from the current board.
  - It handles preview image upload and sends template metadata (names, descriptions, tags) to the server.

### Translations (Tolgee)

- **Integration**:
  - Tolgee is used for machine translations during the template creation process.
  - `TolgeeProvider.tsx` initializes the Tolgee SDK with environment variables (`TOLGEE_API_URL`, `TOLGEE_API_KEY`, `TOLGEE_PROJECT_ID`).
- **Usage**:
  - In `CreateTemplateModal.tsx`, a "Translate" button triggers machine translations via Tolgee's suggest API.
  - It uses a custom `detectLanguage` function to determine the source language.
  - Translated names and descriptions are stored as multi-language maps in the template object on the server.

## Refactoring Plan

### Goal 1: Repository-Based Templates

- **Objective**: Move template storage from the server to the repository to simplify deployment and versioning.
- **Proposed Changes**:
  - Create a `src/templates` directory to store template data.
  - Each template will consist of:
    - `snapshot.json`: The `BoardSnapshot` data.
    - `preview.png`: A static preview image.
    - `metadata.json`: Template name, description, tags, and ID.
  - Create a central registry (e.g., `src/templates/registry.ts`) that exports all templates.
  - Update `SelectTemplateModal` to use the local registry instead of an API call.
  - Update `fetchTemplateSnapshot` to load the local JSON data.
  - Replace the `iframe` preview with a static image or a lightweight read-only board renderer.

### Goal 2: Remove Tolgee Dependency

- **Objective**: Eliminate the dependency on Tolgee and use static multi-language files for template translations.
- **Proposed Changes**:
  - Remove `@tolgee/react` and associated packages.
  - Delete `src/features/Templates/TolgeeProvider.tsx`.
  - Move template translations (names, descriptions) into the repository (e.g., in `metadata.json` or standard `en.json`/`ru.json` files).
  - Simplify or remove the translation logic in `CreateTemplateModal`, as templates will be primarily managed via repository and PRs.

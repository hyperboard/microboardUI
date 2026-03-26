# UI Agent Handoff: Auth and WebSocket Coordination

The core repository ([microboard](file:///home/alex/microboard/hyperboard/microboard)) has been updated with the infrastructure for authentication handoff and universal request coordination.

**Your goal is to implement the UI-side logic to fulfill this contract.**

## 1. Implement [conf](file:///home/alex/microboard/hyperboard/microboard/src/Events/Log/EventsLog.ts#68-76) Hooks

In the UI repository, where you initialize the [Board](file:///home/alex/microboard/hyperboard/microboard/src/Board.ts#59-1632), you MUST provide implementations for the two new hooks in [Settings.ts](file:///home/alex/microboard/hyperboard/microboard/src/Settings.ts):

### `conf.onAuthInvalid(boardId?: string): Promise<boolean>`

- **Trigger**: Called by [authenticatedFetch](file:///home/alex/microboard/hyperboard/microboard/src/api/AuthRequest.ts#3-45) (core) when a request returns `401 AUTH_INVALID_ACCESS_TOKEN`.
- **Requirement**:
  - Implement a **deduplicated** token refresh. If multiple requests fail at once, only ONE refresh should be triggered.
  - Return `true` if refresh succeeds; the original core request will then be retried once.
  - Return `false` if refresh fails (e.g., terminal expiry).

### `conf.onAuthTerminalFailure(boardId?: string, reason?: string): void`

- **Trigger**: Called by the core when an auth request can never be fulfilled (e.g., refresh failed or was revoked).
- **Requirement**:
  - Trigger UI state changes (logout, "session expired" modal, or guest-mode notification).
  - If on a public board, initiate anonymous fallback.

## 2. WebSocket Reconnect & Anonymous Fallback

When a terminal auth failure occurs on a public board:

1.  **Clear Local State**: Discard the stale access token and anything tied to the authenticated user.
2.  **Update Connection**: Ensure the `Board.events.connection` object (the one you provided) now returns a NEW anonymous `sessionId` and specifies `authorUserId: undefined`.
3.  **WebSocket Init**: Re-instantiate the WebSocket (or call your reconnect method) ensuring it does NOT send the old auth cookie or Bearer tokens.
4.  **Sync Local Identity**:
    - **CRITICAL**: Call `board.events.refreshIdentity()` immediately after the connection object is updated but before the first WebSocket message is sent.
    - This will rewrite the `sessionId` and `authorUserId` for any unconfirmed (pending) local events, ensuring the server doesn't reject them for using the old stale identity.

## 3. Core Utilities to Use

The core now provides:

- [authenticatedFetch(url, options)](file:///home/alex/microboard/hyperboard/microboard/src/api/AuthRequest.ts#3-45): Usage of this is internal to `MediaHelpers`, but you can also use it in the UI if you want centralized retry logic.
- `board.events.refreshIdentity()`: Use this to synchronize pending items with the current auth state (both after refresh and after anonymous switch).

## 4. Media System Update

The `MediaHelpers` in the core no longer require an `accessToken` argument. All functions ([uploadMediaToStorage](file:///home/alex/microboard/hyperboard/microboard/src/api/MediaHelpers.ts#76-93), `prepare*`, [getMediaSignedUrl](file:///home/alex/microboard/hyperboard/microboard/src/api/MediaHelpers.ts#114-143)) now automatically use `conf.getAccessToken()`.

If the UI repo has its own copies or wrappers of these, update them to remove the `accessToken` parameter.

---

**Done in Core**: All hooks added, [authenticatedFetch](file:///home/alex/microboard/hyperboard/microboard/src/api/AuthRequest.ts#3-45) implemented, `MediaHelpers` refactored, TS errors fixed.
**Remaining in UI**: Implement refresh logic, hook registration, and anonymous fallback lifecycle.

import Cookies from "js-cookie";
import { conf } from "microboard-temp";

/**
 * Universal authenticated fetch wrapper for the UI.
 */
export async function authenticatedFetch(
  url: string,
  init: RequestInit = {},
  boardId?: string,
): Promise<Response> {
  const getAuthInit = (originalInit: RequestInit): RequestInit => {
    const token = Cookies.get("mb_accessToken");
    if (!token) {
      return originalInit;
    }

    const headers = new Headers(originalInit.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return { ...originalInit, headers };
  };

  let response = await fetch(url, getAuthInit(init));

  if (response.status === 401) {
    const body = await response
      .clone()
      .json()
      .catch(() => ({}));

    if (body.code === "AUTH_INVALID_ACCESS_TOKEN") {
      // Coordinate with core settings if needed, or handle refresh here
      const refreshed = await conf.onAuthInvalid(boardId);
      if (refreshed) {
        response = await fetch(url, getAuthInit(init));
      } else {
        conf.onAuthTerminalFailure(boardId, body.code);
      }
    }
  }

  return response;
}

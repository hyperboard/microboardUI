import React, { useEffect } from "react";
import { ErrorNotification } from "./Notifications";
import { useCopyBoardItems } from "./ImportBoardItem/useCopyBoardItems";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "features/AppContext";
import { getApiUrl } from "Config";
import Cookies from "js-cookie";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { ERROR_NOTIFICATION } from "./Notifications/ErrorNotification";

export function ImportMiro(): React.ReactElement | null {
  const { app } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const authCode = searchParams.get("code");
  const teamIdSearch = searchParams.get("team_id");
  const { openModal } = useUiModalContext();

  const fetchToken = async (authCode: string) => {
    try {
      const response = await fetch(getApiUrl("/miro/get-token"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: authCode }),
      });

      if (!response.ok) {
        throw new Error("Error getting token");
      }

      const tokenData = await response.json();

      if (tokenData && tokenData.access_token) {
        Cookies.set("miro_accessToken", tokenData.access_token);
        openSeenLastBoard();
      }
    } catch (error) {
      console.error(error);
      openModal(ERROR_NOTIFICATION);
    }
  };

  const openSeenLastBoard = async (): Promise<void> => {
    const lastSeenBoardId = app.getLastBoardId();

    if (!lastSeenBoardId) {
      console.error("Last seen board is undefined");
      return;
    }

    await app.openBoard(lastSeenBoardId).then(() => {
      navigate(`/boards/${lastSeenBoardId}?clipboard=true`, {
        replace: true,
      });
      app.render();
    });
    const lastSeenBoard = app.getBoard();
    useCopyBoardItems(lastSeenBoard);
  };

  useEffect(() => {
    const token = Cookies.get("miro_accessToken");

    if (!authCode && !teamIdSearch) {
      return;
    }

    if (!token || token === "undefined") {
      fetchToken(authCode!);
    }

    if (token && token !== "undefined") {
      openSeenLastBoard();
    }
  }, []);

  return <ErrorNotification />;
}

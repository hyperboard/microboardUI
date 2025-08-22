import React from "react";
import { App } from "App";
import { UnauthGuard } from "entities/account";
import { LocalAppView } from "features/AppView";
import { LocalSidePanelContextProvider } from "features/SidePanel/LocalSidePanelContext";
import { AddEmailPage } from "pages/AddEmailView";
import { BindEmailPage } from "pages/BindEmailPage";
import { BoardPage } from "pages/BoardPage";
import { ForgotPasswordPage } from "pages/ForgotPasswordPage";
import { HTMLSnapshot } from "pages/HTMLSnapshot";
import { AppLayout, LocalAppLayout } from "pages/layouts/AppLayout";
import { AuthLayout } from "pages/layouts/AuthLayout";
import { RestorePasswordPage } from "pages/RestorePasswordPage";
import { SelectBoardPage } from "pages/SelectBoardPage";
import { SigninPage } from "pages/SigninPage";
import { SignupPage } from "pages/SignupPage/SignupPage";
import { VerifyMailPage } from "pages/VerifyMailPage";
import { WelcomePage } from "pages/WelcomePage/WelcomePage";
import { WheelEventLoggerPage } from "pages/WheelLogger/WheelLogger";

import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import { createRoot, type Root } from "react-dom/client";
import { TestPage } from "pages/TestPage";

export function getRender(app: App): {
  render: () => void;
  router: ReturnType<typeof createBrowserRouter>;
} {
  const router = createBrowserRouter([
    {
      element: <AppLayout app={app} />,
      children: [
        { path: "/", element: <Navigate to={"/boards/blank"} /> },
        {
          path: "/auth",
          element: <AuthLayout showPolicies />,
          children: [
            {
              element: <UnauthGuard />,
              children: [
                { path: "sign-up", element: <SignupPage /> },
                { path: "sign-in", element: <SigninPage /> },
                { path: "verify", element: <VerifyMailPage /> },
                { path: "restore-password", element: <RestorePasswordPage /> },
                { path: "forgot-password", element: <ForgotPasswordPage /> },
              ],
            },
          ],
        },
        {
          path: "/bind-email",
          element: <AuthLayout />,
          children: [
            { path: "add-email", element: <AddEmailPage /> },
            { path: "verify", element: <BindEmailPage /> },
          ],
        },
        { path: "/welcome", element: <WelcomePage /> },
        { path: "/boards/:boardId?", element: <BoardPage /> },
        { path: "/selectBoard", element: <SelectBoardPage /> },
        { path: "/test-wheel", element: <WheelEventLoggerPage /> },
        { path: "/snapshots/:uid?", element: <HTMLSnapshot /> },
        // { path: "test", element: <TestPage /> },
      ],
    },
  ]);

  let root: Root | null = null;

  return {
    render() {
      const container = document.getElementById(
        "root",
      ) as HTMLDivElement | null;
      if (!container) {
        throw new Error('Root container with id="root" not found');
      }
      if (!root) {
        root = createRoot(container);
      }
      root.render(<RouterProvider router={router} />);
    },
    router,
  };
}

export function getLocalRender(app: App): (rootId: string) => void {
  let root: Root | null = null;

  return (rootId: string) => {
    const container = document.getElementById(rootId) as HTMLElement | null;
    if (!container) {
      throw new Error(`Container with id="${rootId}" not found`);
    }
    if (!root) {
      root = createRoot(container);
    }
    root.render(
      <LocalAppLayout app={app}>
        <LocalSidePanelContextProvider>
          <LocalAppView />
        </LocalSidePanelContextProvider>
      </LocalAppLayout>,
    );
  };
}

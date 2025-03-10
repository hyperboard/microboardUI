import { App } from "App";
import { AddEmailPage } from "pages/AddEmailView";
import { BindEmailPage } from "pages/BindEmailPage";
import { BoardPage } from "pages/BoardPage";
import { ForgotPasswordPage } from "pages/ForgotPasswordPage";
import { AppLayout } from "pages/layouts/AppLayout";
import { AuthLayout } from "pages/layouts/AuthLayout";
import { RestorePasswordPage } from "pages/RestorePasswordPage";
import { SelectBoardPage } from "pages/SelectBoardPage";
import { SigninPage } from "pages/SigninPage";
import { SignupPage } from "pages/SignupPage/SignupPage";
import { TestPage } from "pages/TestPage";
import { VerifyMailPage } from "pages/VerifyMailPage";
import { WelcomePage } from "pages/WelcomePage/WelcomePage";
import React from "react";
import ReactDOM from "react-dom";
import {
	createBrowserRouter,
	Navigate,
	RouterProvider,
} from "react-router-dom";
import { AppContext } from "features/AppContext";
import { LocalAppView } from "features/AppView";
import { LocalSidePanelContextProvider } from "features/SidePanel/LocalSidePanelContext";
import { UnauthGuard } from "entities/account";

export function getRender(app: App): {
	render: () => void;
	router: ReturnType<typeof createBrowserRouter>;
} {
	// new IframeModule(app);
	// const iframeModule = IframeModule.getInstance(app);

	const router = createBrowserRouter([
		{
			element: <AppLayout app={app} />,
			children: [
				{
					path: "/",
					element: <Navigate to={"/boards/blank"} />,
				},
				{
					path: "/auth",
					element: <AuthLayout />,
					children: [
						{
							element: <UnauthGuard />,
							children: [
								{
									path: "sign-up",
									element: <SignupPage />,
								},
								{
									path: "sign-in",
									element: <SigninPage />,
								},
								{
									path: "verify",
									element: <VerifyMailPage />,
								},
								{
									path: "restore-password",
									element: <RestorePasswordPage />,
								},
								{
									path: "forgot-password",
									element: <ForgotPasswordPage />,
								},
							],
						},
					],
				},
				{
					path: "/bind-email",
					element: <AuthLayout />,
					children: [
						{
							path: "add-email",
							element: <AddEmailPage />,
						},
						{
							path: "verify",
							element: <BindEmailPage />,
						},
					],
				},

				{
					path: "/welcome",
					element: <WelcomePage />,
				},

				{
					path: "/boards/:boardId?",
					element: <BoardPage />,
				},

				{
					path: "/test",
					element: <TestPage />,
				},
				{
					path: "/selectBoard",
					element: <SelectBoardPage />,
				},
			],
		},
	]);

	return {
		render: function () {
			ReactDOM.render(
				<RouterProvider router={router} />,
				document.getElementById("root") as HTMLDivElement,
			);
		},
		router,
	};
}

export function getLocalRender(app: App, customId: string): () => void {
	return () => {
		ReactDOM.render(
			<AppContext.Provider value={{ app, board: app.getBoard() }}>
				<LocalSidePanelContextProvider>
					<LocalAppView />
				</LocalSidePanelContextProvider>
			</AppContext.Provider>,
			document.getElementById(customId) as HTMLElement,
		);
	};
}

import { App } from "App";
import { BoardView } from "View/BoardView";
import { IframeModule } from "lib/IframeModule";
import React from "react";
import ReactDOM from "react-dom";
import { SigninView } from "./SigninView/SigninView";
import { SignupView } from "./SignupView/SignupView";
import { VerifyMailView } from "./VerifyMailView/VerifyMailView";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootView from "./RootView/RootView";
import AuthView from "./AuthView/AuthView";
import { RestorePassword } from "./RestorePassword/RestorePassword";
import { ForgotPassword } from "./ForgotPassword/ForgotPassword";
import { ProtectedRoute } from "./Routes/ProtectedRoute";

export function getRender(app: App): () => void {
	new IframeModule(app);

	const router = createBrowserRouter([
		{
			path: "/",
			element: <RootView app={app} />,
		},
		{
			path: "/auth",
			element: <AuthView />,
			children: [
				{
					path: "sign-up",
					element: <SignupView />,
				},
				{
					path: "sign-in",
					element: <SigninView app={app} />,
				},
				{
					path: "verify",
					element: <VerifyMailView app={app} />,
				},
				{
					path: "restore-password",
					element: <RestorePassword />,
				},
				{
					path: "forgot-password",
					element: <ForgotPassword />,
				},
			],
		},
		{
			path: "/boards/:boardId",
			element: <ProtectedRoute isPublic={true} />,
			children: [
				{
					path: "",
					element: <BoardView app={app} />,
				},
			],
		},
	]);

	return function () {
		ReactDOM.render(
			<RouterProvider router={router} />,
			document.getElementById("root") as HTMLDivElement,
		);
	};
}

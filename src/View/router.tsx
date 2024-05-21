import React from "react";
import { DashboardView } from "./DashboardView/DashboardView";
import { SigninView } from "./SigninView/SigninView";
import { SignupView } from "./SignupView/SignupView";
import { App } from "App";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom";
import { BoardView } from "./BoardView";
import "../index.css";
import { ProtectedRoute } from "./Routes/ProtectedRoute";
import RootView from "./RootView/RootView";
import { IframeModule } from "lib/IframeModule";
import { VerifyMailView } from "./VerifyMailView/VerifyMailView";

export function getRender(app: App): () => void {
	new IframeModule(app);

	const router = createBrowserRouter([
		{
			path: "/",
			element: <RootView app={app} />,
		},
		{
			path: "/sign-up",
			element: <SignupView />,
		},
		{
			path: "/sign-in",
			element: <SigninView />,
		},
		{
			path: "/verify",
			element: <VerifyMailView />,
		},
		{
			path: "/dashboard",
			element: <ProtectedRoute />,
			children: [
				{
					path: "",
					element: <DashboardView app={app} />,
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

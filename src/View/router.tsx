import { App } from "App";
import { IframeModule } from "lib/IframeModule";
import React from "react";
import ReactDOM from "react-dom";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppContext } from "./AppContext";
import AuthView from "./AuthView/AuthView";
import { BoardView } from "View/BoardView";
import SelectBoard from "./Embedding/SelectBoard";
import TestComponent from "./Embedding/Test";
import { ForgotPassword } from "./ForgotPassword/ForgotPassword";
import { RestorePassword } from "./RestorePassword/RestorePassword";
import RootView from "./RootView/RootView";
import { ProtectedRoute } from "./Routes/ProtectedRoute";
import { SigninView } from "./SigninView/SigninView";
import { SignupView } from "./SignupView/SignupView";
import { ToastProvider } from "./ToastProvider";
import { VerifyMailView } from "./VerifyMailView/VerifyMailView";
import { WelcomeBoard } from "./WelcomeBoard";

export function getRender(app: App) {
	// new IframeModule(app);
	const iframeModule = IframeModule.getInstance(app);
	const board = app.getBoard();

	const router = createBrowserRouter([
		{
			path: "/",
			element: <RootView app={app} />,
			children: [],
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
			path: "/welcome",
			element: <ProtectedRoute isPublic={true} />,
			children: [
				{
					path: "",
					element: <WelcomeBoard app={app} />,
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
		{
			path: "/boards",
			element: <ProtectedRoute isPublic={true} />,
			children: [
				{
					path: "",
					element: <BoardView app={app} />,
				},
			],
		},
		// {
		// 	path: "/test",
		// 	element: <ProtectedRoute isPublic={true} />,
		// 	children: [
		// 		{
		// 			path: "",
		// 			element: <TestComponent />,
		// 		},
		// 	],
		// },
		{
			path: "/selectBoard",
			element: <ProtectedRoute isPublic={true} />,
			children: [
				{
					path: "",
					element: <SelectBoard app={app} />,
				},
			],
		},
	]);

	return {
		render: function () {
			ReactDOM.render(
				<AppContext.Provider value={{ app, board }}>
					<RouterProvider router={router} />
					<ToastProvider />
				</AppContext.Provider>,
				document.getElementById("root") as HTMLDivElement,
			);
		},
		router,
	};
}

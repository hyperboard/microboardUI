import { useAccount } from "App/useAccount";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const KeycloakCallback: React.FC = () => {
	const account = useAccount();
	const navigate = useNavigate();
	const location = useLocation();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function handleCallback() {
			try {
				// Get the authorization code from URL params
				const params = new URLSearchParams(location.search);
				const code = params.get("code");

				if (!code) {
					throw new Error(
						"No authorization code received from Keycloak",
					);
				}

				// Call the Account method to complete the login
				await account.loginWithKeycloak(code);

				// Redirect to boards page after successful login
				navigate("/boards/blank", { replace: true });
			} catch (err) {
				console.error("Keycloak login error:", err);
				setError("Authentication failed. Please try again.");
				// Redirect to login page after a delay
				setTimeout(() => navigate("/auth/sign-in"), 3000);
			}
		}

		handleCallback();
	}, [account, navigate, location]);

	// Show loading or error state while processing
	return (
		<div
			className="keycloak-callback-container"
			style={{ textAlign: "center", padding: "50px" }}
		>
			{error ? (
				<div className="error" style={{ color: "red" }}>
					<h3>Authentication Error</h3>
					<p>{error}</p>
					<p>Redirecting to login page...</p>
				</div>
			) : (
				<div className="loading">
					<h3>Completing Login</h3>
					<p>Please wait while we complete your authentication...</p>
					{/* Add your application's loader component here */}
				</div>
			)}
		</div>
	);
};

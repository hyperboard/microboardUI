import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "App/useAccount";
import { useSearchParams } from "react-router-dom";
import { Loader } from "shared/ui-lib/Button/Loader";

export const GoogleCallbackHandler: React.FC = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const account = useAccount();

	useEffect(() => {
		const token = searchParams.get("token");
		if (token) {
			account
				.loginWithGoogle(token)
				.then(() => {
					navigate("/");
				})
				.catch(() => {
					navigate("/auth/sign-in");
				});
		} else {
			navigate("/auth/sign-in");
		}
	}, [navigate, searchParams, account]);

	return (
		<div>
			<Loader></Loader>
		</div>
	);
};

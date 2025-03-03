import { Navbar } from "View/Widgets/Navbar/Navbar";
import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./AuthView.css";
import QuickAddButtonsClear from "Board/Selection/QuickAddButtons/QuickAddButtonsClear";
import { notify } from "View/Ui/Toast";
import { useTranslation } from "react-i18next";

const AuthView: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { t } = useTranslation();

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		if (params.get("authException") === "true") {
			setTimeout(() => {
				notify({
					header: t("auth.unknownError"),
					body: t("auth.googleError"),
					variant: "error",
				});
			}, 0);
			params.delete("authException");
			navigate({ search: params.toString() }, { replace: true });
		}
	}, [location, navigate]);

	return (
		<QuickAddButtonsClear>
			<div className="AuthView">
				<div className="Navbar">
					<Navbar />
				</div>
				<div className="Content">
					<Outlet />
				</div>
			</div>
		</QuickAddButtonsClear>
	);
};

export default AuthView;

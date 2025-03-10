import { Navbar } from "features/Widgets/Navbar/Navbar";
import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import style from "./AuthLayout.module.css";
import QuickAddButtonsClear from "Board/Selection/QuickAddButtons/QuickAddButtonsClear";
import { notify } from "shared/ui-lib/Toast";
import { useTranslation } from "react-i18next";

export const AuthLayout: React.FC = () => {
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
			<div className={style.authView}>
				<div className={style.navbar}>
					<Navbar />
				</div>
				<div className={style.content}>
					<Outlet />
				</div>
			</div>
		</QuickAddButtonsClear>
	);
};

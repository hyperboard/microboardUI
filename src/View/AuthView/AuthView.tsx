import { Navbar } from "View/Widgets/Navbar/Navbar";
import React from "react";
import { Outlet } from "react-router-dom";
import "./AuthView.css";
import QuickAddButtonsClear from "Board/Selection/QuickAddButtons/QuickAddButtonsClear";

const AuthView: React.FC = () => {
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

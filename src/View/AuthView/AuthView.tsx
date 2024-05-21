import { Navbar } from "View/Widgets/Navbar/Navbar";
import React from "react";
import { Outlet } from "react-router-dom";
import "./AuthView.css";

const AuthView: React.FC = () => {
	return (
		<>
			<div className="AuthView">
				<div className="Navbar">
					<Navbar />
				</div>
				<div className="Content">
					<Outlet />
				</div>
			</div>
		</>
	);
};

export default AuthView;

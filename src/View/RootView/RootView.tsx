import { App } from "App";
import React from "react";
import { useNavigate } from "react-router-dom";

type RootViewProps = {
	app: App;
};

const RootView: React.FC<RootViewProps> = ({ app }) => {
	const navigate = useNavigate();

	React.useEffect(() => {
		navigate(`/boards`);
	}, []);

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<label htmlFor="loading">
				<h1>Loading...</h1>
			</label>
		</div>
	);
};

export default RootView;

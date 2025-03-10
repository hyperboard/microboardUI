import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export interface WithRouterProps {
	router: {
		location: ReturnType<typeof useLocation>;
		navigate: ReturnType<typeof useNavigate>;
		params: ReturnType<typeof useParams>;
	};
}

export function withRouter(Component) {
	function ComponentWithRouterProp(props) {
		const location = useLocation();
		const navigate = useNavigate();
		const params = useParams();
		return <Component {...props} router={{ location, navigate, params }} />;
	}

	return ComponentWithRouterProp;
}

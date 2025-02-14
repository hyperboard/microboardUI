import React, { useState } from "react";
import PropTypes from "prop-types";
import { GoogleIcon } from "./icons";
import { darkStyle, lightStyle, disabledStyle, hoverStyle } from "./styles";

export function GoogleAuthBtn({
	label = "Sign in with Google",
	disabled = false,
	tabIndex = 0,
	type = "dark",
	style,
}) {
	const [hovered, setHovered] = useState(false);
	const mouseOver = () => {
		if (!disabled) {
			setHovered(true);
		}
	};

	const mouseOut = () => {
		if (!disabled) {
			setHovered(false);
		}
	};

	const getStyle = () => {
		const baseStyle = type === "dark" ? darkStyle : lightStyle;
		if (hovered) {
			return { ...baseStyle, ...hoverStyle, ...style };
		}
		if (disabled) {
			return { ...baseStyle, ...disabledStyle, ...style };
		}
		return { ...baseStyle, ...style };
	};

	const handleClick = e => {
		if (!disabled) {
			window.location.replace(
				`${window.location.origin}/api/v1/auth/google`,
			);
		}
	};

	return (
		<div
			disabled={disabled}
			tabIndex={tabIndex}
			onClick={handleClick}
			role="button"
			style={getStyle()}
			onMouseOver={mouseOver}
			onMouseOut={mouseOut}
		>
			<GoogleIcon disabled={disabled} type={type} />
			<span>{label}</span>
		</div>
	);
}

GoogleAuthBtn.propTypes = {
	label: PropTypes.string,
	disabled: PropTypes.bool,
	tabIndex: PropTypes.number,
	onClick: PropTypes.func,
	type: PropTypes.oneOf(["light", "dark"]),
	style: PropTypes.object,
};

import React from "react";

interface Props {
	fill?: string;
	className?: string;
}

export const Chevron: React.FC<Props> = ({ fill = "#14151A", className }) => {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path
				d="M8.00054 9.99985L5.17188 7.17118L6.11521 6.22852L8.00054 8.11452L9.88588 6.22852L10.8292 7.17118L8.00054 9.99985Z"
				fill={fill}
			/>
		</svg>
	);
};

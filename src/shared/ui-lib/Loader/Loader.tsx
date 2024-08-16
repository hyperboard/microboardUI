import styles from "./Loader.module.css";
import React from "react";

interface LoaderProps {
	className?: string;
}

export const Loader = ({ className }: LoaderProps) => {
	return (
		<div className={className}>
			<svg
				width="32"
				height="32"
				viewBox="0 0 32 32"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className={styles.loader}
			>
				<rect
					x="14.9336"
					y="1.06665"
					width="2.13333"
					height="9.6"
					rx="1.06667"
					fill="#D4B1F6"
				/>
				<rect
					x="14.9336"
					y="21.3333"
					width="2.13333"
					height="9.6"
					rx="1.06667"
					fill="#FBF7FF"
				/>
				<rect
					x="1.06641"
					y="17.0667"
					width="2.13333"
					height="9.6"
					rx="1.06667"
					transform="rotate(-90 1.06641 17.0667)"
					fill="#F5EBFD"
				/>
				<rect
					x="21.332"
					y="17.0667"
					width="2.13333"
					height="9.6"
					rx="1.06667"
					transform="rotate(-90 21.332 17.0667)"
					fill="#AF77EE"
				/>
				<rect
					x="2.53125"
					y="9.45728"
					width="2.13333"
					height="9.60018"
					rx="1.06667"
					transform="rotate(-60 2.53125 9.45728)"
					fill="#EEE1FA"
				/>
				<rect
					x="20.082"
					y="19.5896"
					width="2.13333"
					height="9.60175"
					rx="1.06667"
					transform="rotate(-60 20.082 19.5896)"
					fill="#A163EB"
				/>
				<rect
					x="7.60938"
					y="3.60083"
					width="2.13333"
					height="9.6"
					rx="1.06667"
					transform="rotate(-30 7.60938 3.60083)"
					fill="#EAD8FB"
				/>
				<rect
					x="17.7461"
					y="21.1562"
					width="2.13333"
					height="9.6"
					rx="1.06667"
					transform="rotate(-30 17.7461 21.1562)"
					fill="#924FE8"
				/>
				<rect
					width="2.13333"
					height="9.6"
					rx="1.06667"
					transform="matrix(0.5 0.866025 0.866025 -0.5 2.53125 22.5427)"
					fill="#F9F2FF"
				/>
				<rect
					width="2.13333"
					height="9.59834"
					rx="1.06667"
					transform="matrix(0.5 0.866025 0.866025 -0.5 20.0898 12.4084)"
					fill="#BC8AF1"
				/>
				<rect
					width="2.13333"
					height="9.60218"
					rx="1.06667"
					transform="matrix(0.866025 0.5 0.5 -0.866025 7.60938 28.3989)"
					fill="#FBF7FF"
				/>
				<rect
					width="2.13333"
					height="9.6"
					rx="1.06667"
					transform="matrix(0.866025 0.5 0.5 -0.866025 17.7383 10.8572)"
					fill="#C89EF4"
				/>
			</svg>
		</div>
	);
};

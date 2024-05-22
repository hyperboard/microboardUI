import React from "react";

interface Props {
	width?: number;
	height?: number;
}

export const LeadIcon: React.FC<Props> = ({ width = 20, height = 20 }) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g clipPath="url(#clip0_576_11290)">
				<path
					d="M6.86133 17.5C15.8647 17.4994 13.0944 3.82447 13.0944 1.79292"
					stroke="url(#paint0_linear_576_11290)"
					strokeWidth="4.16824"
					strokeLinecap="round"
				/>
				<path
					d="M17.5 6.58398C17.4994 15.5871 3.82407 12.8169 1.79247 12.8169"
					stroke="url(#paint1_linear_576_11290)"
					strokeWidth="4.16824"
					strokeLinecap="round"
				/>
				<path
					d="M12.9766 1.66699C3.97316 1.66763 6.74349 15.3425 6.74349 17.3741"
					stroke="url(#paint2_linear_576_11290)"
					strokeWidth="4.16824"
					strokeLinecap="round"
				/>
				<path
					d="M1.66602 12.6992C1.66665 3.69607 15.3419 6.46632 17.3735 6.46632"
					stroke="url(#paint3_linear_576_11290)"
					strokeWidth="4.16824"
					strokeLinecap="round"
				/>
			</g>
			<defs>
				<linearGradient
					id="paint0_linear_576_11290"
					x1="8.21037"
					y1="23.2627"
					x2="6.39234"
					y2="2.8309"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#8041FF" />
					<stop offset="1" stopColor="#C03AFF" />
				</linearGradient>
				<linearGradient
					id="paint1_linear_576_11290"
					x1="23.2628"
					y1="7.93299"
					x2="2.83049"
					y2="6.1148"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="white" />
					<stop offset="1" stopColor="#C03AFF" />
				</linearGradient>
				<linearGradient
					id="paint2_linear_576_11290"
					x1="11.6275"
					y1="-4.09567"
					x2="13.4455"
					y2="16.3361"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#B48EFF" />
					<stop offset="1" stopColor="#C03AFF" />
				</linearGradient>
				<linearGradient
					id="paint3_linear_576_11290"
					x1="-4.09681"
					y1="11.3502"
					x2="16.3355"
					y2="13.1684"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="white" />
					<stop offset="1" stopColor="#C03AFF" />
				</linearGradient>
				<clipPath id="clip0_576_11290">
					<rect width="20" height="20" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
};

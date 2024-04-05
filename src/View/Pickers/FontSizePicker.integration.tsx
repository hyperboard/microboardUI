import { applyStyle } from "lib/applyStyle";
import * as React from "react";

export const FontSizes = [10, 12, 14, 18, 24, 36, 48, 64, 80, 144, 288];

interface Props {
	onPick: (size: number) => void;
	maxSize?: number;
}

export function FontSizePicker(props: Props): React.ReactElement {
	const max = props.maxSize || 288;
	const buttonStyle: React.CSSProperties = {
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
    fontSize: '16px',
    fontWeight: '500',
    padding: '6px 0',
		border: "none",
		cursor: "pointer",
		backgroundColor: "white",
		float: "left",
		position: "relative",
	};

	const fontButtons = [];
	for (let i = 0; i < FontSizes.length; i++) {
		const size = FontSizes[i];
		const isDisabled = max < size;
		const additionalStyle: React.CSSProperties = {}
		if (isDisabled) {
			additionalStyle.color = "rgba(0, 0, 0, 0.4)";
			additionalStyle.cursor = "default";
		}
		fontButtons.push(
			<React.Fragment key={i}>
				<button
					onClick={() => {
						props.onPick(size);
					}}
					className={'FontSizeBtn'}
					style={{...buttonStyle, ...additionalStyle}}
					disabled={isDisabled}
				>
					{size}
				</button>
				<br></br>
			</React.Fragment>,
		);
	}
	return <>{fontButtons}</>;
}

applyStyle(`
	@media (hover:hover) {
		.FontSizeBtn:hover {
			color: rgba(20, 129, 221, 1);
		}
	}
	.FontSizeBtn {
		transition: color .3s;
	}
`)
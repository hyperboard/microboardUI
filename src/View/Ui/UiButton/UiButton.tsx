import * as React from "react";
import "./UiButton.css";

interface Props extends React.PropsWithChildren<{}> {
	id: string;
	buttonRef?: React.Ref<HTMLButtonElement>;
	onClick: () => void;
	title?: string;
	margin?: number;
	isOn?: boolean;
	tipOnLeft?: boolean;
	tipOnBottomLeft?: boolean;
	tipOnTop?: boolean;
	hotkey?: string;
	width?: number;
	style?: React.CSSProperties;
	tipWidth?: number;
	onMouseEnter?: React.MouseEventHandler<HTMLButtonElement>;
	onMouseLeave?: React.MouseEventHandler<HTMLButtonElement>;
}

export function UiButton(props: Props): React.ReactElement {
	const margin = props.margin ?? 5;
	const width = props.width ?? 40;
	const tipWidth = props.tipWidth;

	const handleMouseEnter: React.MouseEventHandler<
		HTMLButtonElement
	> = event => {
		event.currentTarget.style.color = "blue";
		if (props.onMouseEnter) {
			props.onMouseEnter(event);
		}
	};

	const handleMouseLeave: React.MouseEventHandler<
		HTMLButtonElement
	> = event => {
		event.currentTarget.style.color = props.isOn ? "blue" : "black";
		if (props.onMouseLeave) {
			props.onMouseLeave(event);
		}
	};

	return (
		<div className="ButtonContainer" style={{}}>
			<button
				id={props.id}
				ref={props.buttonRef}
				onClick={props.onClick}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				className="Button"
				style={{
					marginLeft: `${margin}px`,
					marginRight: `${margin}px`,
					minWidth: `${width}px`,
					color: props.isOn ? "blue" : "black",
					...props.style,
				}}
			>
				{props.children}
			</button>
			{props.title && (
				<span
					style={{ width: tipWidth }}
					className={
						props.tipOnLeft
							? "ButtonTipOnLeft"
							: props.tipOnBottomLeft
							? "ButtonTipOnBottomLeft"
							: props.tipOnTop
							? "ButtonTipOnTop"
							: "ButtonTipOnBottom"
					}
				>
					{props.title + " "}
					{props.hotkey && (
						<span
							style={{
								backgroundColor: "rgba(255, 255, 255, 0.3)",
							}}
						>
							{props.hotkey}
						</span>
					)}
				</span>
			)}
		</div>
	);
}

import * as React from "react";

const style = document.createElement("style");

style.innerHTML = `
.ButtonContainer {
	position: relative;
	display: inline-block;
}
  
.ButtonContainer .ButtonTipOnBottom {
	visibility: hidden;
	width: 120px;
	background-color: black;
	color: #fff;
	text-align: center;
	border-radius: 6px;
	padding: 5px 0;
	position: absolute;
	z-index: 2;
	top: 100%;
	left: 50%;
	margin-left: -60px;
}
  
.ButtonContainer .ButtonTipOnBottom::after {
	content: "";
	position: absolute;
	bottom: 100%;
	left: 50%;
	margin-left: -5px;
	border-width: 5px;
	border-style: solid;
	border-color: transparent transparent black transparent;
}
  
.ButtonContainer .ButtonTipOnLeft {
	visibility: hidden;
	width: 140px;
	background-color: black;
	color: #fff;
	text-align: center;
	border-radius: 6px;
	padding: 5px 0;
	position: absolute;
	z-index: 2;
	top: 10%;
	left: 110%;
}
  
.ButtonContainer .ButtonTipOnLeft::after {
	content: "";
	position: absolute;
	top: 50%;
	right: 100%;
	margin-top: -5px;
	border-width: 5px;
	border-style: solid;
	border-color: transparent black transparent transparent;
}

.ButtonContainer .ButtonTipOnBottomLeft {
	visibility: hidden;
	width: 120px;
	background-color: black;
	color: #fff;
	text-align: center;
	border-radius: 6px;
	padding: 5px 0;
	position: absolute;
	z-index: 2;
	top: 100%;
	left: 110%;
	margin-left: -60px;
}
  
.ButtonContainer .ButtonTipOnBottomLeft::after {
	content: "";
	position: absolute;
	bottom: 100%;
	left: 25%;
	margin-left: -5px;
	border-width: 5px;
	border-style: solid;
	border-color: transparent transparent black transparent;
}

.ButtonContainer .ButtonTipOnTop {
	visibility: hidden;
	width: 120px;
	background-color: black;
	color: #fff;
	text-align: center;
	border-radius: 6px;
	padding: 5px 0;
	position: absolute;
	z-index: 2;
	bottom: 100%;
	left: 50%;
	margin-left: -60px;
}
  
.ButtonContainer .ButtonTipOnTop::after {
	content: "";
	position: absolute;
	top: 100%;
	left: 50%;
	margin-left: -5px;
	border-width: 5px;
	border-style: solid;
	border-color: black transparent transparent transparent;
}

.ButtonContainer:hover .ButtonTipOnBottom {
	visibility: visible;
}

.ButtonContainer .ButtonTipOnBottom:hover {
	visibility: hidden;
}

.ButtonContainer:hover .ButtonTipOnLeft {
	visibility: visible;
}

.ButtonContainer .ButtonTipOnLeft:hover {
	visibility: hidden;
}

.ButtonContainer:hover .ButtonTipOnBottomLeft {
	visibility: visible;
}

.ButtonContainer .ButtonTipOnBottomLeft:hover {
	visibility: hidden;
}

.ButtonContainer:hover .ButtonTipOnTop {
	visibility: visible;
}

.ButtonContainer .ButtonTipOnTop:hover {
	visibility: hidden;
}


.Button {

}
`;

document.head.appendChild(style);

interface Props extends React.PropsWithChildren<{}> {
	id: string;
	buttonRef?: React.Ref<HTMLButtonElement>;
	onClick: () => void;
	title: string;
	margin?: number;
	isOn?: boolean;
	tipOnLeft?: boolean;
	tipOnBottomLeft?: boolean;
	tipOnTop?: boolean;
	hotkey?: string;
	width?: number;
}

export function Button(props: Props): React.ReactElement {
	const margin = props.margin ?? 5;
	const width = props.width ?? 40;
	return (
		<div className="ButtonContainer" style={{}}>
			<button
				id={props.id}
				ref={props.buttonRef}
				onClick={props.onClick}
				onMouseEnter={event => {
					event.currentTarget.style.color = "blue";
				}}
				onMouseLeave={event => {
					event.currentTarget.style.color = props.isOn
						? "blue"
						: "black";
				}}
				style={{
					display: "flex",
					marginLeft: `${margin}px`,
					marginRight: `${margin}px`,
					width: `${width}px`,
					height: "44px",
					justifyContent: "center",
					alignItems: "center",
					padding: "0px",
					border: "none",
					backgroundColor: "white",
					cursor: "pointer",
					color: props.isOn ? "blue" : "black",
				}}
			>
				{props.children}
			</button>
			<span
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
						style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
					>
						{props.hotkey}
					</span>
				)}
			</span>
		</div>
	);
}

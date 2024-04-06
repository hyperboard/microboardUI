import { applyStyle } from "lib/applyStyle";
import * as React from "react";

applyStyle(`
.ButtonContainer {
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
}

.Button {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	width: 100%;
	padding: 4px;
	border: none;
	background-color: white;
	cursor: pointer;
  border-radius: 8px;
  transition: background ease-in .2s;
	outline: none;
}

.Button.Active {
  background-color: rgba(20, 129, 221, .1);
	color: rgb(20, 129, 221);
}

  @media(hover:hover) {
    .Button:hover {
      background-color: rgba(0, 0, 0, .05);
    }
  }

.ButtonContainer .ButtonTip {
	visibility: hidden;
	background-color: #222222;
	color: #F6F6F6;
	border-radius: 8px;
	padding: 8px 10px;
	position: absolute;
	z-index: 2;
	display: flex;
	justify-content: center;
	gap: 6px;
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
	pointer-events: none;
}
.ButtonContainer .ButtonTipOnLeft {
	text-align: center;
	align-items: center;
	left: 120%;
}
.ButtonContainer .ButtonTipOnBottom {
	top: 120%;
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
	pointer-events: none;
}
  
  

.ButtonContainer .ButtonTipOnBottomLeft {
	top: 120%;
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
	pointer-events: none;
}

.ButtonContainer .ButtonTipOnTop {
	bottom: 130%;
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
	pointer-events: none;
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
`);

type Props = React.PropsWithChildren<{
	buttonRef?: React.Ref<HTMLButtonElement>;
	title?: string;
	margin?: number;
	isOn?: boolean;
	tipOnLeft?: boolean;
	tipOnBottomLeft?: boolean;
	tipOnTop?: boolean;
	hotkey?: string;
	width?: number | string;
	height?: number | string;
}> & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: Props): React.ReactElement {
	const {margin = 5, width = 32, height = 32, isOn, tipOnBottomLeft, style, className, tipOnLeft, tipOnTop, title, buttonRef, hotkey, children, ...restProps} = props;
	return (
		<div className="ButtonContainer" style={{
			justifyContent: tipOnBottomLeft ? 'stretch' : 'center',
		}}>
			<button
				ref={buttonRef}
				className={`Button ${isOn ? "Active" : ""} ${className ?? ''}`}
				style={{
					marginLeft: `${margin}px`,
					marginRight: `${margin}px`,
					width: typeof width === 'number' ? `${width}px` : width,
					height: typeof height === 'number' ? `${height}px` : height,
					...style
				}}
				{...restProps}
			>
				{children}
			</button>
			{title && <span
				className={`
				ButtonTip
				${
					tipOnLeft
						? "ButtonTipOnLeft"
						: tipOnBottomLeft
						? "ButtonTipOnBottomLeft"
						: tipOnTop
						? "ButtonTipOnTop"
						: "ButtonTipOnBottom"
				}
				`}
			>
				<span style={{whiteSpace: 'nowrap'}}>{title}</span>
				{hotkey && (
					<span
						style={{ opacity: '.48' }}
					>
						{hotkey}
					</span>
				)}
			</span>}
		</div>
	);
}

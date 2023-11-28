import * as React from "react";

export class HorisontalSeparator extends React.PureComponent<{
	height?: number;
}> {
	render(): React.ReactElement {
		return (
			<div
				style={{
					height: `${this.props.height ?? 1}px`,
					background: "rgb(230, 230, 230)",
					flex: "1 0 100%",
					display: "flex",
				}}
			/>
		);
	}
}

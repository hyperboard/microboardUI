import * as React from "react";

export class VerticalSeparator extends React.PureComponent {
	render(): React.ReactElement {
		return (
			<div
				style={{
					display: "flex",
					marginLeft: "5px",
					marginRight: "5px",
					width: "1px",
					backgroundColor: "rgb(230, 230, 230)",
				}}
			></div>
		);
	}
}

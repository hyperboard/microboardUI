import * as React from "react";

export class VerticalSeparator extends React.PureComponent {
	render(): React.ReactElement {
		return (
			<div
				style={{
					width: "1px",
					backgroundColor: "rgba(0, 0, 0, 0.08)",
					height: "26px",
					alignSelf: "center",
					borderRadius: "20px",
					content: "",
				}}
			/>
		);
	}
}

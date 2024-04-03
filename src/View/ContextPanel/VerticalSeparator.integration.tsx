import * as React from "react";

export class VerticalSeparator extends React.PureComponent {
	render(): React.ReactElement {
		return (
			<div
				style={{
					display: "flex",
					width: "1px",
					backgroundColor: "rgba(0, 0, 0, 0.08)",
          height: '80%',
          borderRadius: '20px',
          alignSelf: 'center'
				}}
			></div>
		);
	}
}

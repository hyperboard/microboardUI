import * as React from "react";

export class HorisontalSeparator extends React.PureComponent<{
	height?: number;
}> {
	render(): React.ReactElement {
		return (
			<div
				style={{
					height: `${this.props.height ?? 1}px`,
					background: "rgba(0, 0, 0, 0.08)",
          content: '',
          width: '80%',
          borderRadius: '20px'
				}}
			/>
		);
	}
}

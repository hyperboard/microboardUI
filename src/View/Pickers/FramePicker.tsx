import { Frames, FrameType } from "Board/Items/Frame/Basic";
import * as React from "react";
import { Icon } from "../Icon";
import { UiButton } from "View/Ui/UiButton";
import { Frame } from "Board/Items";
import { DrawingContext } from "Board/Items/DrawingContext";

const frames = [
	{ id: "Custom", label: "Custom proportions" },
	{ id: "Frame16x9", label: "16:9" },
	{ id: "Frame4x3", label: "4:3" },
	{ id: "A4", label: "A4" },
	{ id: "Letter", label: "Letter" },
	{ id: "Frame1x1", label: "1:1" },
] as const;

FramePicker.defaultProps = {
	isChanging: false,
};

export function FramePicker(props: {
	onPick: (type: FrameType) => void;
	isChanging?: boolean;
	frame?: Frame;
}): React.ReactElement {
	const handleMouseEnter = (type: FrameType) => () => {
		if (props.frame) {
			props.frame.setNewShape(type);
		}
	};
	const handleMouseLeave = (): void => {
		if (props.frame) {
			props.frame.setNewShape(null);
		}
	};
	return (
		<div>
			{frames.map(frame => (
				<UiButton
					id={
						!props.isChanging ? `Pick${frame.id}` : `Set${frame.id}`
					}
					title={frame.label}
					onClick={() => {
						props.onPick(frame.id);
					}}
					margin={0}
					key={
						!props.isChanging ? `Pick${frame.id}` : `Set${frame.id}`
					}
					onMouseEnter={handleMouseEnter(frame.id)}
					onMouseLeave={handleMouseLeave}
				>
					<Icon name={frame.id} width={24} height={24} />
				</UiButton>
			))}
		</div>
	);
}

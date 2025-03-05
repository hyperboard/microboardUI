import type { FrameType } from "Board/Items/Frame/Basic";
import React from "react";
import { FrameIcon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";
import style from "./FramePicker.module.css";
import { FRAME_TYPES } from "Board/Items/Frame/FrameData";

type Props = {
	onPick: (type: FrameType) => void;
	selected: FrameType;
	onPointerEnter?: (type: FrameType) => void;
	onPointerLeave?: (type: FrameType) => void;
};

export function FramePicker({
	onPick,
	onPointerEnter,
	onPointerLeave,
	selected,
}: Props): React.ReactElement {
	return (
		<>
			{FRAME_TYPES.map(({ id, label }) => (
				<UiButton
					onClick={() => onPick(id)}
					className={style.button}
					variant="secondary"
					active={id === selected}
					onPointerEnter={() => onPointerEnter && onPointerEnter(id)}
					onPointerLeave={() => onPointerLeave && onPointerLeave(id)}
					key={id}
					id={`frame-picker-${id}`}
				>
					<FrameIcon iconName={id} />
					<span>{label}</span>
				</UiButton>
			))}
		</>
	);
}

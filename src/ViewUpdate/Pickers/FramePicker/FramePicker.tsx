import type { FrameType } from "Board/Items/Frame/Basic";
import React from "react";
import { FrameIcon } from "ViewUpdate/Icon";
import { FRAME_TYPES } from "ViewUpdate/Items/Frame";
import { UiButton } from "ViewUpdate/Ui/UiButton";
import style from "./FramePicker.module.css";

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
}: Props) {
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
				>
					<FrameIcon iconName={id} />
					<span>{label}</span>
				</UiButton>
			))}
		</>
	);
}

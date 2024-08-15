import React from "react";
import { Icon } from "ViewTalkIntegration/Icon";
import { IconId } from "ViewTalkIntegration/Icon/Icon";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";

const pointerTypes = [
	{ id: "None", icon: "PointerStart" },
	{ id: "AngleTalk", icon: "PointerEnd" },
	{ id: "TriangleFilledTalk", icon: "PointerEndCompact" },
];

type Props = {
	onPick: (pointer: string) => void;
	selected: string;
};

export function ConnectorPointerPicker({
	onPick,
	selected,
}: Props): React.ReactElement {
	return (
		<>
			{pointerTypes.map(type => (
				<UiButton
					id={`pointer-${type.id}`}
					key={type.id}
					onClick={() => {
						onPick(type.id);
					}}
					active={selected === type.id}
				>
					<Icon
						width={18}
						height={18}
						iconName={type.icon as IconId}
					/>
				</UiButton>
			))}
		</>
	);
}

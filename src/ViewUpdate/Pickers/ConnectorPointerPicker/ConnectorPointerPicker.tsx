import { ConnectorPointerIcon } from "ViewUpdate/Icon";
import { CONNECTOR_POINTER_TYPES } from "ViewUpdate/Tools/AddConnector";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import React from "react";
import style from "./ConnectorPointerPicker.module.css";

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
			{CONNECTOR_POINTER_TYPES.map(type => (
				<UiButton
					id={`pointer-${type}`}
					key={type}
					onClick={() => {
						onPick(type);
					}}
					active={selected === type}
					variant="secondary"
					className={style.button}
				>
					{type === "None" ? (
						"None"
					) : (
						<ConnectorPointerIcon iconName={type} />
					)}
				</UiButton>
			))}
		</>
	);
}

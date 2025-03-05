import { ConnectorPointerIcon } from "View/Icon";
import { CONNECTOR_POINTER_TYPES } from "Board/Items/Connector/Connector";
import { UiButton } from "View/Ui/UiButton/UiButton";
import React from "react";
import style from "./ConnectorPointerPicker.module.css";
import { ConnectorPointerStyle } from "Board/Items/Connector/Pointers/Pointers";

type Props = {
	onPick: (pointer: ConnectorPointerStyle) => void;
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

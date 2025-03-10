import { ConnectorPointerIcon } from "shared/ui-lib/Icon";
import { CONNECTOR_POINTER_TYPES } from "Board/Items/Connector/Connector";
import React from "react";
import style from "./ConnectorPointerPicker.module.css";
import { ConnectorPointerStyle } from "Board/Items/Connector/Pointers/Pointers";
import { UiButton } from "shared/ui-lib/UiButton";
import { useTranslation } from "react-i18next";

type Props = {
	onPick: (pointer: ConnectorPointerStyle) => void;
	selected: string;
};

export function ConnectorPointerPicker({
	onPick,
	selected,
}: Props): React.ReactElement {
	const { t } = useTranslation();
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
						t("contextPanel.connectorPointerNone")
					) : (
						<ConnectorPointerIcon iconName={type} />
					)}
				</UiButton>
			))}
		</>
	);
}

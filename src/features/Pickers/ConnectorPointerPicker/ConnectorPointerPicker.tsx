import {
	ConnectorPointerStyle,
	CONNECTOR_POINTER_TYPES,
} from "microboard-temp";
import React from "react";
import { useTranslation } from "react-i18next";
import { ConnectorPointerIcon } from "shared/ui-lib/Icon";
import { UiButton } from "shared/ui-lib/UiButton";
import style from "./ConnectorPointerPicker.module.css";

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
					<ConnectorPointerIcon iconName={type} />
				</UiButton>
			))}
		</>
	);
}

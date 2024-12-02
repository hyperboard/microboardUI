import React, { CSSProperties } from "react";
import { UiPanel } from "../../../Ui/UiPanel";
import styles from "./OptionsPanel.module.css";

interface Props {
	canRemove: boolean;
	handleRemove: () => void;
	setTextUnderEditor: () => void;
	style: CSSProperties;
}

export const OptionsPanel = ({
	canRemove,
	handleRemove,
	style,
	setTextUnderEditor,
}: Props) => {
	return (
		<UiPanel className={styles.panel} vertical={true} style={style}>
			{canRemove && (
				<button className={styles.btn} onClick={handleRemove}>
					Delete comment
				</button>
			)}
			<button onClick={setTextUnderEditor} className={styles.btn}>
				Edit...
			</button>
		</UiPanel>
	);
};

import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
// import { useTranslation } from "react-i18next";
import { Board } from "Board";

type Props = {
	board: Board;
};

export function TitlePanel({ board }: Props): null {
	const forceUpdate = useForceUpdate();
	// const { t } = useTranslation();

	useAppSubscription({ observer: forceUpdate, subjects: ["tools"] });

	const isExport = board.tools.getExport();
	if (isExport) {
		return null;
	}

	// const openExport = () => {
	//	board.tools.export();
	// };

	return null;

	// return (
	// 	<UiPanel className={style.panel}>
	// 		<UiButton
	// 			onClick={openExport}
	// 			variant="secondary"
	// 			tooltip={t("export.tooltip")}
	// 			tooltipPosition="bottom"
	// 		>
	// 			<Icon iconName="Export" />
	// 		</UiButton>
	// 	</UiPanel>
	// );
}

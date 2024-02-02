import { FC, ReactNode, useContext } from "react";
import { ExportSnapshotContext } from "./context";

export const ExportSnapshotMode: FC<{ children: ReactNode }> = ({
	children,
}) => {
	const { snapshotMode } = useContext(ExportSnapshotContext);

	return snapshotMode ? null : children;
};

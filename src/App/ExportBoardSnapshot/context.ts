import { createContext } from "react";

const snapshotState = {
	toggleSnapshotMode: () => {},
	confirmSnapshot: () => {},
	snapshotMode: false,
};

export interface IExportSnapshotContext {
	toggleSnapshotMode: VoidFunction;
	confirmSnapshot: VoidFunction;
	snapshotMode: boolean;
}

export const ExportSnapshotContext =
	createContext<IExportSnapshotContext>(snapshotState);

export const { Provider, Consumer } = ExportSnapshotContext;

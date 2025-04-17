import React, { SyntheticEvent, useRef, useState } from "react";
import styles from "./SnapshotNameInput.module.css";
import { notify } from "shared/ui-lib/Toast";
import { useAppContext } from "features/AppContext";
import { api, boardsApi, HTTPError } from "shared/api";
import { MessageResponse } from "shared/api/types";
import { UiButton } from "shared/ui-lib/UiButton";
import clsx from "clsx";
import { nanoid } from "nanoid";

const SnapshotNameInput: React.FC<{
	buttonDisabled?: boolean;
}> = ({ buttonDisabled }) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [snapshotName, setSnapshotName] = useState("");
	const [errMsg, setErrMsg] = useState<null | string>(null);
	const [snapshotURI, setSnapshotURI] = useState<null | string>(null);
	const { board } = useAppContext();

	const stopPropagation = (ev: SyntheticEvent): void => {
		ev.stopPropagation();
	};

	const handleFocusInput = (): void => {
		inputRef.current?.focus();
	};

	const handleInputChange = (
		ev: React.ChangeEvent<HTMLInputElement>,
	): void => {
		ev.stopPropagation();
		ev.preventDefault();
		// setSnapshotName(ev.target.value.replace(/[^A-Za-z0-9._~-]/g, ""));
		setSnapshotName(ev.target.value);
	};

	const handleSnapshotSubmit = async (): Promise<void> => {
		setSnapshotURI(null);
		setErrMsg(null);

		const trimmedName = snapshotName.trim();
		if (!trimmedName) {
			notify({ body: "Name for snapshot is required", variant: "error" });
			setErrMsg("Name can not be empty");
			return;
		}
		const forbiddenSymbols = trimmedName.match(/[^A-Za-z0-9._~-]/g);
		if (forbiddenSymbols) {
			notify({
				body: "Name for snapshot contains forbidden symbols",
				variant: "error",
			});
			setErrMsg(
				`Some characters are not allowed: ${[...new Set(forbiddenSymbols.map(ch => (ch === " " ? "empty space" : ch)))].join(", ")}`,
			);
			return;
		}

		const uniqueSnapshotName = trimmedName + "?" + nanoid(10);
		try {
			const snapshot = board.serializeHTML();
			const data = await boardsApi.publishSnapshot(
				snapshot,
				uniqueSnapshotName,
				board.getBoardId(),
			);
			const userFriendlyURI = decodeURIComponent(data.snapshotURI);

			setSnapshotURI(userFriendlyURI);
			notify({
				body: `Snapshot saved successfully`,
				variant: "success",
			});
			navigator.clipboard.writeText(userFriendlyURI);
			notify({ body: "Copied!", variant: "success" });
			setSnapshotName("");
		} catch (err) {
			if (err instanceof HTTPError) {
				setErrMsg(err.message);
			}
			console.error("Error occured during saving snapshot", err);
			notify({
				body: "Error occured during saving snapshot",
				variant: "error",
			});
		}
	};

	const handleCopySnapshotURI = (
		ev: React.MouseEvent<HTMLSpanElement>,
	): void => {
		ev.stopPropagation();
		if (snapshotURI) {
			navigator.clipboard.writeText(snapshotURI);
			notify({ body: "Copied!", variant: "success" });
		}
	};

	return (
		<div className={styles.wrapper}>
			<div className={styles.inputWrapper}>
				<div className={styles.nativeInput}>
					<div
						className={styles.description}
						onClick={handleFocusInput}
						onFocus={handleFocusInput}
						tabIndex={0}
						style={{
							whiteSpace: "nowrap",
							flexShrink: 0,
							display: "inline-block",
						}}
					>
						{window.location.origin + "/snapshots/"}
					</div>
					<input
						type="text"
						className={styles.userInput}
						onKeyDown={stopPropagation}
						onChange={handleInputChange}
						value={snapshotName}
						ref={inputRef}
					/>
				</div>
			</div>
			<Description
				error={errMsg}
				snapshotURI={snapshotURI}
				handleCopy={handleCopySnapshotURI}
			/>
			<div className={styles.btns}>
				<UiButton
					variant="primary"
					onClick={handleSnapshotSubmit}
					className={styles.btn}
					disabled={buttonDisabled}
					size="lg"
				>
					Share snapshot
				</UiButton>
			</div>
		</div>
	);
};

const Description: React.FC<{
	error?: string | null;
	snapshotURI?: string | null;
	handleCopy: (ev: React.MouseEvent<HTMLSpanElement>) => void;
}> = ({ error, snapshotURI, handleCopy }) => {
	if (!error && !snapshotURI) {
		return null;
	}

	return (
		<div className={clsx(styles.description, error && styles.error)}>
			{error &&
				error === "id already taken" &&
				"This name is already taken, please, use another one"}
			{error && error !== "id already taken" && error}
			{snapshotURI && (
				<>
					Share{" "}
					<span className={styles.snapshot} onClick={handleCopy}>
						{snapshotURI}
					</span>{" "}
					with your friends
				</>
			)}
		</div>
	);
};

export default SnapshotNameInput;

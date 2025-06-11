import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import styles from "./SnapshotNameInput.module.css";
import { notify } from "shared/ui-lib/Toast";
import { useAppContext } from "features/AppContext";
import { boardsApi, HTTPError } from "shared/api";
import { UiButton } from "shared/ui-lib/UiButton";
import clsx from "clsx";
import { nanoid } from "nanoid";
import { Icon } from "shared/ui-lib/Icon";
import { useTranslation } from "react-i18next";
import { Board } from "microboard-temp";
import { TFunction } from "i18next";

function getURLSafeBoardName(
	board: Board,
	tF: TFunction<"default", undefined>,
) {
	const boardName = board.getName();
	if (boardName === tF("board.untitled")) {
		return "Untitled";
	}

	return boardName;
}

const SnapshotNameInput: React.FC<{
	buttonDisabled?: boolean;
}> = ({ buttonDisabled }) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const { t } = useTranslation();
	const { board } = useAppContext();
	const [snapshotName, setSnapshotName] = useState(
		("Board" + getURLSafeBoardName(board, t)).replace(" ", ""),
	);
	const [errMsg, setErrMsg] = useState<null | string | "InvalidURL">(null);
	const [snapshotURI, setSnapshotURI] = useState<null | string>(null);

	const stopPropagation = (ev: SyntheticEvent): void => {
		ev.stopPropagation();
	};

	const handleFocusInput = (): void => {
		inputRef.current?.focus();
	};

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, []);

	const handleInputChange = (
		ev: React.ChangeEvent<HTMLInputElement>,
	): void => {
		ev.stopPropagation();
		ev.preventDefault();
		setSnapshotName(ev.target.value);
		const forbiddenSymbols = ev.target.value
			.trim()
			.match(/[^A-Za-z0-9._~-]/g);
		if (forbiddenSymbols) {
			setErrMsg("InvalidURL");
		} else {
			setErrMsg(null);
			setSnapshotURI(null);
		}
	};

	const handleSnapshotSubmit = async (): Promise<void> => {
		setSnapshotURI(null);
		setErrMsg(null);

		const trimmedName = snapshotName
			.trim()
			.replace(/[^A-Za-z0-9._~-]/g, "");
		if (!trimmedName) {
			setErrMsg(t("export.HTMLSnapshot.nameCantBeEmpty"));
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
			navigator.clipboard.writeText(userFriendlyURI);
			notify({
				body:
					t("export.HTMLSnapshot.successNotificationStart") +
					" " +
					userFriendlyURI +
					" " +
					t("export.HTMLSnapshot.successNotificationEnd"),
				variant: "success",
			});
		} catch (err) {
			if (err instanceof HTTPError) {
				setErrMsg(err.message);
			}
			console.error("Error occured during saving snapshot", err);
			notify({
				body: t("export.HTMLSnapshot.SnapshotSavingError"),
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
				successMsg={
					snapshotURI &&
					t("export.HTMLSnapshot.HTMLSnapshotLinkSuccess")
				}
			/>
			<div className={styles.btns}>
				{snapshotURI ? (
					<UiButton
						variant="primary"
						onClick={handleCopySnapshotURI}
						className={styles.btn}
						disabled={buttonDisabled}
						size="lg"
					>
						<Icon iconName="CopyLink" width={20} height={20} />
						Copy link
					</UiButton>
				) : (
					<UiButton
						variant="primary"
						onClick={handleSnapshotSubmit}
						className={styles.btn}
						disabled={
							buttonDisabled ||
							errMsg === "InvalidURL" ||
							!snapshotName?.trim()
						}
						size="lg"
					>
						<Icon iconName="Tick" width={20} height={20} />
						Save
					</UiButton>
				)}
			</div>
		</div>
	);
};

const Description: React.FC<{
	error?: string | null;
	successMsg?: string | null;
}> = ({ error, successMsg }) => {
	const { t } = useTranslation();

	if (!error && !successMsg) {
		return null;
	}

	return (
		<div
			className={clsx(
				styles.description,
				error && styles.error,
				successMsg && styles.success,
			)}
		>
			{error &&
				error === "id already taken" &&
				t("export.HTMLSnapshot.alreadyTaken")}
			{error &&
				error === "InvalidURL" &&
				t("export.HTMLSnapshot.invalidURL")}
			{error &&
				error !== "id already taken" &&
				error !== "InvalidURL" &&
				error}
			{successMsg}
		</div>
	);
};

export default SnapshotNameInput;

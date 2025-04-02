import React, { SyntheticEvent, useRef, useState } from "react";
import styles from "./SnapshotNameInput.module.css";
import { notify } from "shared/ui-lib/Toast";
import { useAppContext } from "features/AppContext";
import { api, HTTPError } from "shared/api";
import { MessageResponse } from "shared/api/types";
import { UiButton } from "shared/ui-lib/UiButton";
import clsx from "clsx";

const SnapshotNameInput: React.FC<{
	buttonDisabled?: boolean;
}> = ({ buttonDisabled }) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [snapshotName, setSnapshotName] = useState("");
	const [errMsg, setErrMsg] = useState<null | string>(null);
	const [snapshotURI, setSnapshotURI] = useState<null | string>(null);
	const { board } = useAppContext();

	const stopPropagation = (ev: SyntheticEvent): void => {
		ev.stopPropagation();
	};

	const handleInputChange = (
		ev: React.ChangeEvent<HTMLTextAreaElement>,
	): void => {
		ev.stopPropagation();
		ev.preventDefault();
		setSnapshotName(ev.target.value);
	};

	const handleSnapshotSubmit = async (): Promise<void> => {
		if (!snapshotName.trim()) {
			notify({ body: "Name for snapshot is required", variant: "error" });
			setErrMsg("Name can not be empty");
			return;
		}

		setSnapshotURI(null);
		setErrMsg(null);
		try {
			const snapshot = board.serializeHTML();
			const { data } = await api.post<
				MessageResponse & { snapshotURI: string }
			>("/media/snapshot", {
				snapshot,
				snapshotUId: snapshotName,
				boardUId: board.getBoardId(),
			});
			if (!data) {
				throw new Error();
			}
			setSnapshotURI(data.snapshotURI);
			notify({
				body: `Snapshot saved successfully`,
				variant: "success",
			});
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
				<textarea
					rows={1}
					ref={textareaRef}
					value={snapshotName}
					onChange={handleInputChange}
					onKeyUp={stopPropagation}
					onKeyDown={stopPropagation}
					onKeyPress={stopPropagation}
					placeholder="Snapshot name"
					className={styles.nativeInput}
				/>
			</div>
			<Description
				error={errMsg}
				snapshotURI={snapshotURI}
				handleCopy={handleCopySnapshotURI}
			/>
			{/* {(errMsg || snapshotURI) && (
				<div className={styles.description}>
					{errMsg &&
						errMsg === "id already taken" &&
						"This name is already taken, please, use another one"}
					{errMsg && errMsg !== "id already taken" && errMsg}
					{snapshotURI && (
						<>
							Share{" "}
							<span
								className={styles.snapshot}
								onClick={handleCopySnapshotURI}
							>
								{snapshotURI}
							</span>{" "}
							with your friends
						</>
					)}
				</div>
			)} */}
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

import React, { useEffect, useState } from "react";
import { Input } from "shared/ui-lib/Input/Input";
import styles from "./HyperLinkInput.module.css";
import { useHyperLinkContext } from "features/hyperLink/HyperLinkContext";
import { useAppContext } from "features/AppContext";
import { useClickOutside } from "shared/lib/useClickOutside";
import { Icon } from "shared/ui-lib/Icon/Icon";
import { useDomMbr } from "App/useDomMbr";
import { useTranslation } from "react-i18next";
import { conf } from "microboard-temp";
import { notify } from "shared/ui-lib/Toast/notify";

export const HyperLinkInput = () => {
	const [inputValue, setInputValue] = useState<string>("");
	const { isEditingLink, setIsEditingLink, hyperLinkData, setHyperLinkData } =
		useHyperLinkContext();
	const { board, app } = useAppContext();
	const { t } = useTranslation();
	const containerRef = useClickOutside(
		() => {
			if (isEditingLink) {
				setIsEditingLink(false);
			}
		},
		[],
		true,
	);

	const mbr = useDomMbr({
		app,
		board,
		ref: containerRef,
		targetMbr: board.selection.items.getSingle()?.getRichText()?.getMbr(),
		subjects: ["pointer"],
		fit: "hyperLink",
	});

	const richTextEditor = board.selection.items
		.getSingle()
		?.getRichText()?.editor;

	useEffect(() => {
		if (hyperLinkData && hyperLinkData.isWatchMode) {
			const link = richTextEditor?.getFirstSelectionLink(
				hyperLinkData.selection,
			);
			if (link !== inputValue) {
				setInputValue(link || "");
			}
		}
		if (hyperLinkData && isEditingLink) {
			(
				document.querySelector(
					"#hyper-link-input",
				) as HTMLInputElement | null
			)?.focus();
		}
		if (!hyperLinkData) {
			setInputValue("");
		}
	}, [hyperLinkData]);

	if (!hyperLinkData || (!isEditingLink && !hyperLinkData.isWatchMode)) {
		return null;
	}

	const handleConfirmBtnClick = () => {
		if (!conf.URL_REGEX.test(inputValue)) {
			notify({
				header: t("hyperLink.errorTitle"),
				body: t("hyperLink.errorBody"),
				variant: "error",
				duration: 3000,
			});
		} else {
			board.selection.setHyperLink(inputValue, hyperLinkData.selection);
			setInputValue("");
			setIsEditingLink(false);
		}
	};

	const handleInputClick = (
		event: React.MouseEvent<HTMLInputElement>,
	): void => {
		event.stopPropagation();
		if (board.selection.getContext() === "EditTextUnderPointer") {
			board.selection.setContext("EditUnderPointer");
		}
	};

	const onPaste = (event: React.ClipboardEvent<HTMLInputElement>): void => {
		event.stopPropagation();
		if (!conf.URL_REGEX.test(event.clipboardData.getData("text/plain"))) {
			event.preventDefault();
			notify({
				header: t("hyperLink.errorTitle"),
				body: t("hyperLink.errorBody"),
				variant: "error",
				duration: 3000,
			});
		}
	};

	const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
		if (event.key === "Enter") {
			handleConfirmBtnClick();
		}
		event.stopPropagation();
	};

	const handleEditBtnClick = () => {
		setHyperLinkData({ ...hyperLinkData, isWatchMode: false });
		setIsEditingLink(true);
	};

	const handleDeleteBtnClick = () => {
		board.selection.setHyperLink(undefined, hyperLinkData.selection);
	};
	let left = hyperLinkData.inputPosition?.left || mbr.left;
	let top = hyperLinkData.inputPosition?.top || mbr.top;
	const width = containerRef.current?.clientWidth || 0;
	const height = containerRef.current?.clientHeight || 0;
	const right = left + width;
	const bottom = top + height;
	const offset = 20;
	const view = board.camera.window.getMbr();

	if (right >= view.right - offset) {
		left = view.right - offset - width;
	} else if (left <= view.left + offset) {
		left = view.left + offset;
	}

	if (bottom >= view.bottom - offset) {
		top = view.bottom - offset - height;
	} else if (top <= view.top + offset) {
		top = view.top + offset;
	}

	return (
		<div
			ref={containerRef}
			className={styles.container}
			style={{
				top,
				left,
			}}
		>
			{hyperLinkData.isWatchMode ? (
				<>
					<a
						className={styles.link}
						target="_blank"
						href={inputValue}
						rel="noreferrer"
					>
						{inputValue}
					</a>
					<button
						className={styles.iconButton}
						onClick={handleEditBtnClick}
					>
						<Icon iconName={"EditPen"} width={16} height={16} />
					</button>
					<button
						className={styles.iconButton}
						onClick={handleDeleteBtnClick}
					>
						<Icon iconName={"Delete"} width={19} height={19} />
					</button>
				</>
			) : (
				<div className={styles.inputContainer}>
					<Input
						onKeyDown={onKeyDown}
						shouldSelect={true}
						shouldFocus={true}
						id="hyper-link-input"
						placeholder={t("hyperLink.addLink")}
						value={inputValue}
						onClick={handleInputClick}
						onFocus={event => event.currentTarget.select()}
						onPaste={onPaste}
						onChange={e => setInputValue(e.target.value)}
					/>
					<button
						onClick={handleConfirmBtnClick}
						className={styles.confirmBtn}
					>
						{t("hyperLink.done")}
					</button>
				</div>
			)}
		</div>
	);
};

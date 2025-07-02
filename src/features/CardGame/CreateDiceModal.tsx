import React, { useEffect, useRef, useState } from "react";
import styles from "./CreateCardsModal.module.css";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import { UiButton } from "shared/ui-lib/UiButton";
import { uploadImages } from "features/CardGame/CreateCardsModal";
import { useAppContext } from "features/AppContext";
import { useAccount } from "App/useAccount";
import { Dice } from "microboard-temp";

export const CREATE_DICE_MODAL = Symbol("createDiceModal");

const MIN_SIDES = 6;
const MAX_SIDES = 12;

export function CreateDiceModal(): JSX.Element {
	const { closeModal } = useUiModalContext();
	const [faces, setFaces] = useState<(File | null)[]>(
		Array(MIN_SIDES).fill(null),
	);
	const [previews, setPreviews] = useState<(string | null)[]>(
		Array(MIN_SIDES).fill(null),
	);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
	const { board } = useAppContext();
	const account = useAccount();

	// Обновить превью при изменении faces
	useEffect(() => {
		faces.forEach((file, idx) => {
			if (file) {
				const reader = new FileReader();
				reader.onload = ev => {
					setPreviews(prev => {
						const copy = [...prev];
						copy[idx] = ev.target?.result as string;
						return copy;
					});
				};
				reader.readAsDataURL(file);
			} else {
				setPreviews(prev => {
					const copy = [...prev];
					copy[idx] = null;
					return copy;
				});
			}
		});
	}, [faces]);

	const handleFaceClick = (idx: number) => {
		inputRefs.current[idx]?.click();
	};

	const handleFileChange = (
		idx: number,
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0] || null;
		setFaces(prev => {
			const copy = [...prev];
			copy[idx] = file;
			return copy;
		});
	};

	const handleAddFace = () => {
		if (faces.length < MAX_SIDES) {
			setFaces(prev => [...prev, null]);
			setPreviews(prev => [...prev, null]);
		}
	};

	const createDice = (urls: string[]) => {
		const values: string[] | number[] = [];
		let urlsIndex = 0;
		faces.forEach((face, index) => {
			if (!face) {
				values.push(index + 1);
			} else {
				values.push(urls[urlsIndex] || index + 1);
				urlsIndex++;
			}
		});
		board.add(new Dice(board, "", "custom", values));
	};

	const handleAccept = async () => {
		try {
			const files = faces.filter(face => face !== null);
			if (files.length) {
				const urls = await uploadImages(
					files,
					board.getBoardId(),
					account.accessToken,
				);
				createDice(urls);
			}
			closeModal();
		} catch (err) {
			alert("Ошибка загрузки картинок");
		}
		closeModal();
	};

	return (
		<UiModal
			modalId={CREATE_DICE_MODAL}
			closeOnClickOutside={false}
			renderAsPageOnMobile={true}
		>
			<div className={styles.modalContent}>
				<div className={styles.title}>Создание кубика</div>
				<div
					className={styles.cardsRow}
					style={{ flexWrap: "wrap", gap: 16 }}
				>
					{faces.map((face, idx) => (
						<div
							key={idx}
							className={styles.cardSilhouette}
							style={{
								cursor: "pointer",
								width: 80,
								height: 80,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								position: "relative",
							}}
							onClick={() => handleFaceClick(idx)}
						>
							{previews[idx] ? (
								<img
									src={previews[idx] || undefined}
									alt={`face-${idx + 1}`}
									className={styles.cardPreview}
									style={{
										width: "100%",
										height: "100%",
										objectFit: "cover",
									}}
								/>
							) : (
								<span
									className={styles.cardLabel}
									style={{ fontSize: 32, color: "#aaa" }}
								>
									{idx + 1}
								</span>
							)}
							<input
								type="file"
								accept="image/*"
								style={{ display: "none" }}
								ref={el => (inputRefs.current[idx] = el)}
								onChange={e => handleFileChange(idx, e)}
							/>
						</div>
					))}
					{faces.length < MAX_SIDES && (
						<div
							className={styles.cardSilhouette}
							style={{
								cursor: "pointer",
								width: 80,
								height: 80,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								border: "2px dashed #ccc",
								color: "#888",
								fontSize: 40,
							}}
							onClick={handleAddFace}
						>
							+
						</div>
					)}
				</div>
				<UiButton
					className={styles.acceptBtn}
					variant="primary"
					onClick={handleAccept}
				>
					Принять
				</UiButton>
			</div>
		</UiModal>
	);
}

import React from "react";
import styles from "./Modal.module.css";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";
import { useAccount } from "App/useAccount";
import { Card, ItemsMap } from "microboard-temp";

export const CREATE_CARDS_MODAL = Symbol("createCardsModal");

export async function uploadImages(
	files: File[],
	boardId: string,
	accessToken: string | null,
): Promise<string[]> {
	const formData = new FormData();
	files.forEach(file => formData.append("images", file, file.name));
	const resp = await fetch(`/api/v1/media/images/${boardId}`, {
		method: "POST",
		body: formData,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	if (!resp.ok) {
		throw new Error("Ошибка загрузки картинок");
	}
	const data = await resp.json();
	return (data.results || []).map((r: any) => r.src);
}

export function CreateCardsModal(): JSX.Element {
	const { t } = useTranslation();
	const { closeModal } = useUiModalContext();
	const { board } = useAppContext();
	const account = useAccount();

	const [cover, setCover] = React.useState<File | null>(null);
	const [coverPreview, setCoverPreview] = React.useState<string | null>(null);
	const [cards, setCards] = React.useState<File[]>([]);
	const [cardsPreview, setCardsPreview] = React.useState<string[]>([]);
	const [loading, setLoading] = React.useState(false);

	const coverInputRef = React.useRef<HTMLInputElement>(null);
	const cardsInputRef = React.useRef<HTMLInputElement>(null);

	const handleCoverClick = () => coverInputRef.current?.click();
	const handleCardsClick = () => cardsInputRef.current?.click();

	const createDeck = (backsideUrl: string, faceUrls: string[]) => {
		const cards: Card[] = [];

		const { left, top, bottom, right } = board.camera.getMbr();
		const x = (left + right) / 2;
		const y = (top + bottom) / 2;

		faceUrls.forEach((faceUrl, index) => {
			const card = new Card(board, index + faceUrl, {
				backsideUrl,
				faceUrl,
			});
			card.transformation.apply({
				class: "Transformation",
				method: "translateTo",
				item: [card.getId()],
				x: x,
				y: y,
			});
			cards.push(card);
		});

		const itemsMap: ItemsMap = {};
		cards.forEach(card => {
			itemsMap[card.getId()] = card.serialize();
		});

		board.paste(itemsMap, false, false);
	};

	const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setCover(file);
			const reader = new FileReader();
			reader.onload = ev => setCoverPreview(ev.target?.result as string);
			reader.readAsDataURL(file);
		}
	};

	const handleCardsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files ? Array.from(e.target.files) : [];
		setCards(files);
		Promise.all(
			files.map(
				file =>
					new Promise<string>(resolve => {
						const reader = new FileReader();
						reader.onload = ev =>
							resolve(ev.target?.result as string);
						reader.readAsDataURL(file);
					}),
			),
		).then(setCardsPreview);
	};

	const handleAccept = async () => {
		setLoading(true);
		try {
			if (cards.length > 0 && cover) {
				const urls = await uploadImages(
					[cover, ...cards],
					board.getBoardId(),
					account.accessToken,
				);
				createDeck(urls[0], urls.slice(1));
			}
			closeModal();
		} catch (err) {
			alert("Ошибка загрузки картинок");
		} finally {
			setLoading(false);
		}
	};

	return (
		<UiModal
			modalId={CREATE_CARDS_MODAL}
			closeOnClickOutside={false}
			renderAsPageOnMobile={true}
		>
			<div className={styles.modalContent}>
				<div className={styles.title}>Создание карт</div>
				<div className={styles.cardsRow}>
					<div
						className={styles.cardSilhouette}
						onClick={handleCoverClick}
					>
						{coverPreview ? (
							<img
								src={coverPreview}
								alt="cover"
								className={styles.cardPreview}
							/>
						) : (
							<span className={styles.cardLabel}>Обложка</span>
						)}
						<input
							type="file"
							accept="image/*"
							style={{ display: "none" }}
							ref={coverInputRef}
							onChange={handleCoverChange}
						/>
					</div>
					<div
						className={styles.cardSilhouette}
						onClick={handleCardsClick}
					>
						{cardsPreview.length > 0 ? (
							<img
								src={cardsPreview[0]}
								alt="preview"
								className={styles.cardPreview}
							/>
						) : (
							<span className={styles.cardLabel}>Карты</span>
						)}
						<input
							type="file"
							accept="image/*"
							multiple
							style={{ display: "none" }}
							ref={cardsInputRef}
							onChange={handleCardsChange}
						/>
					</div>
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

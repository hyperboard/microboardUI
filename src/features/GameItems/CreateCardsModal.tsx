import React, { useState } from "react";
import styles from "./Modal.module.css";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";
import {
  Card,
  conf,
  ItemsMap,
  DefaultTransformationData,
} from "microboard-temp";
import { uploadImages } from "shared/api/media/uploadImage";

export const CREATE_CARDS_MODAL = Symbol("createCardsModal");

const getImageDimensions = (
  file: File,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
  });
};

export function CreateCardsModal(): React.JSX.Element {
  const { t } = useTranslation();
  const { closeModal } = useUiModalContext();
  const { board } = useAppContext();

  const [cover, setCover] = React.useState<File | null>(null);
  const [coverPreview, setCoverPreview] = React.useState<string | null>(null);
  const [cards, setCards] = React.useState<File[]>([]);
  const [cardsPreview, setCardsPreview] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [cardDimensions, setCardDimensions] = useState(
    conf.DEFAULT_GAME_ITEM_DIMENSIONS,
  );

  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const cardsInputRef = React.useRef<HTMLInputElement>(null);

  const handleCoverClick = () => coverInputRef.current?.click();
  const handleCardsClick = () => cardsInputRef.current?.click();

  const createDeck = (backsideUrl: string, faceUrls: string[]) => {
    const cards: Card[] = [];

    faceUrls.forEach((faceUrl) => {
      const card = board.createItem(board.getNewItemId(), {
        itemType: "Card",
        backsideUrl,
        faceUrl,
        dimensions: cardDimensions,
        transformation: new DefaultTransformationData(),
      } as any);
      cards.push(card as Card);
    });

    const itemsMap: ItemsMap = {};
    cards.forEach((card) => {
      itemsMap[card.getId()] = card.serialize();
    });
    const cameraMbr = board.camera.getMbr();
    const x =
      (cameraMbr.left + cameraMbr.right) / 2 - cards[0].getMbr().getWidth() / 2;
    const y =
      (cameraMbr.top + cameraMbr.bottom) / 2 -
      cards[0].getMbr().getHeight() / 2;
    board.pointer.pointTo(x, y);
    board.paste(itemsMap, false, false);
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCover(file);
      const reader = new FileReader();
      reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      const { width, height } = await getImageDimensions(file);
      const { width: defaultWidth, height: defaultHeight } =
        conf.DEFAULT_GAME_ITEM_DIMENSIONS;
      const normalizedDimensions =
        width > height
          ? { width: (defaultWidth * width) / height, height: defaultHeight }
          : { width: defaultWidth, height: (defaultHeight * height) / width };
      if (normalizedDimensions.width > conf.MAX_CARD_SIZE) {
        normalizedDimensions.width = conf.MAX_CARD_SIZE;
      }
      if (normalizedDimensions.height > conf.MAX_CARD_SIZE) {
        normalizedDimensions.height = conf.MAX_CARD_SIZE;
      }
      setCardDimensions(normalizedDimensions);
    }
  };

  const handleCardsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setCards(files);
    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.readAsDataURL(file);
          }),
      ),
    ).then(setCardsPreview);
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      if (cards.length > 0 && cover) {
        const urls = await uploadImages([cover, ...cards], board.getBoardId());
        createDeck(urls[0], urls.slice(1));
      }
      closeModal();
    } catch (err) {
      console.error(err);
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
        <div className={styles.title}>
          {t("toolsPanel.addGameItem.addCard.title")}
        </div>
        <div className={styles.cardsRow}>
          <div
            className={styles.cardSilhouette}
            onClick={handleCoverClick}
            style={{
              width: cardDimensions.width,
              height: cardDimensions.height,
              maxWidth: "80vw",
            }}
          >
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="cover"
                className={styles.cardPreview}
              />
            ) : (
              <span className={styles.cardLabel}>
                {t("toolsPanel.addGameItem.addCard.cover")}
              </span>
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
            style={{
              width: cardDimensions.width,
              height: cardDimensions.height,
              maxWidth: "80vw",
            }}
          >
            {cardsPreview.length > 0 ? (
              <img
                src={cardsPreview[0]}
                alt="preview"
                className={styles.cardPreview}
              />
            ) : (
              <span className={styles.cardLabel}>
                {t("toolsPanel.addGameItem.addCard.cards")}
              </span>
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
          disabled={loading}
        >
          {t("common.confirm")}
        </UiButton>
      </div>
    </UiModal>
  );
}

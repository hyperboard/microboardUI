import React, { useEffect, useRef, useState } from "react";
import styles from "./Modal.module.css";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";
import { useAccount } from "App/useAccount";
import { Dice } from "microboard-temp";
import { uploadImages } from "shared/api/media/uploadImage";
import { useTranslation } from "react-i18next";

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
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { board } = useAppContext();
  const account = useAccount();
  const { t } = useTranslation();

  useEffect(() => {
    faces.forEach((file, idx) => {
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setPreviews((prev) => {
            const copy = [...prev];
            copy[idx] = ev.target?.result as string;
            return copy;
          });
        };
        reader.readAsDataURL(file);
      } else {
        setPreviews((prev) => {
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
    setFaces((prev) => {
      const copy = [...prev];
      copy[idx] = file;
      return copy;
    });
  };

  const handleAddFace = () => {
    if (faces.length < MAX_SIDES) {
      setFaces((prev) => [...prev, null]);
      setPreviews((prev) => [...prev, null]);
    }
  };

  const handleRemoveLastFace = () => {
    if (faces.length > MIN_SIDES) {
      setFaces((prev) => prev.slice(0, -1));
      setPreviews((prev) => prev.slice(0, -1));
    }
  };

  const createDice = (urls: string[]) => {
    const values: (string | number)[] = [];
    let urlsIndex = 0;
    faces.forEach((face, index) => {
      if (!face) {
        values.push(index + 1);
      } else {
        values.push(urls[urlsIndex] || index + 1);
        urlsIndex++;
      }
    });

    const dice = new Dice(
      board,
      "",
      values.some((value) => typeof value === "string") ? "custom" : "common",
      values,
    );

    const { left, top, bottom, right } = board.camera.getMbr();
    const x = (left + right) / 2 - dice.getWidth() / 2;
    const y = (top + bottom) / 2 - dice.getHeight() / 2;

    dice.transformation.apply({
      class: "Transformation",
      method: "translateTo",
      item: [dice.getId()],
      x,
      y,
    });

    board.add(dice);
  };

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const files = faces.filter((face) => face !== null);
      if (files.length) {
        const urls = await uploadImages(
          files,
          board.getBoardId(),
          account.accessToken,
        );
        createDice(urls);
      } else {
        createDice([]);
      }
      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
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
        <div className={styles.title}>
          {t("toolsPanel.addGameItem.addDice.title")}
        </div>
        <div className={styles.cardsRow} style={{ flexWrap: "wrap", gap: 16 }}>
          {faces.map((face, idx) => (
            <div
              key={idx}
              className={styles.diceFace}
              onClick={() => handleFaceClick(idx)}
            >
              {previews[idx] ? (
                <img
                  src={previews[idx] || undefined}
                  alt={`face-${idx + 1}`}
                  className={styles.dicePreview}
                />
              ) : (
                <span className={styles.diceLabel}>{idx + 1}</span>
              )}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={(el) => (inputRefs.current[idx] = el)}
                onChange={(ev) => handleFileChange(idx, ev)}
              />
            </div>
          ))}
          {faces.length < MAX_SIDES && (
            <div className={styles.addFaceBtn} onClick={handleAddFace}>
              +
            </div>
          )}
        </div>
        {faces.length > MIN_SIDES && (
          <div className={styles.removeFaceBtnWrapper}>
            <UiButton
              variant="secondary"
              onClick={handleRemoveLastFace}
              className={styles.removeFaceBtn}
            >
              {t("toolsPanel.addGameItem.addDice.removeFace")}
            </UiButton>
          </div>
        )}
        <UiButton
          className={styles.acceptBtn}
          variant="primary"
          onClick={handleAccept}
          disabled={isLoading}
        >
          {t("common.confirm")}
        </UiButton>
      </div>
    </UiModal>
  );
}

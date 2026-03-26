import React from "react";
import styles from "../BoardMenu.module.css";
import { tryToPasteAsItemOrReturnText } from "App/Paste/tryToPasteAsItemOrReturnText";
import { useAppContext } from "features/AppContext";
import { useAccount } from "App/useAccount";
import { pasteTextToTheBoard } from "App/Paste/pasteTextToTheBoard";
import { useTranslation } from "react-i18next";
import { Icon } from "shared/ui-lib/Icon/Icon";

export const Items = () => {
  const { board } = useAppContext();
  const account = useAccount();
  const { t } = useTranslation();

  async function getClipboardData(
    clipboardItems: ClipboardItems,
  ): Promise<DataTransfer> {
    const clipboardData = new DataTransfer();

    try {
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          const blob = await clipboardItem.getType(type);

          if (
            type.startsWith("text/") ||
            type.startsWith("application/x-slate-fragment")
          ) {
            const text = await blob.text();
            clipboardData.setData(type, text);
          } else {
            clipboardData.items.add(
              new File([blob], "clipboard-item", { type }),
            );
          }
        }
      }
    } catch (error) {
      console.error("Failed to read clipboard:", error);
    }

    return clipboardData;
  }

  const handlePasteClick = async () => {
    try {
      const permission = await navigator.permissions.query({
        name: "clipboard-read" as any,
      });

      if (permission.state === "denied") {
        throw new Error("Доступ к буферу обмена запрещен");
      }

      const items = await navigator.clipboard.read();
      const clipboardData = await getClipboardData(items);
      const data = await tryToPasteAsItemOrReturnText(
        null,
        clipboardData,
        board,
        account.isLoggedIn,
      );
      if (data) {
        pasteTextToTheBoard(board, data);
      }
    } catch (error) {
      console.error("Ошибка вставки:", error);
      alert("Не удалось получить доступ к буферу обмена");
    }
    board.setIsBoardMenuOpen(false);
  };

  return (
    <>
      <button onClick={handlePasteClick} className={styles.btn}>
        <div className={styles.buttonContainer}>
          <Icon iconName="Paste" width={20} height={20} />
          {t("boardMenu.items.paste")}
        </div>
      </button>
    </>
  );
};

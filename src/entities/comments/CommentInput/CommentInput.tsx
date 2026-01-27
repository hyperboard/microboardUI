import React, { useState } from "react";
import styles from "./CommentInput.module.css";
import { Icon } from "shared/ui-lib/Icon";
import { Input } from "shared/ui-lib/Input/Input";
import { useTranslation } from "react-i18next";
import { UiSeparator } from "shared/ui-lib/UiSeparator";
import { UiButton } from "shared/ui-lib/UiButton";

interface Props {
  value: string;
  setValue: (value: string) => void;
  handleSubmit: () => void;
  handleRemove?: () => void;
  handleReject?: () => void;
  handleKeyDown?: (e: KeyboardEvent) => void;
  mode: "create" | "edit" | "reply";
  onInput?: () => void;
}

export const CommentInput = ({
  value,
  handleSubmit,
  handleRemove,
  setValue,
  mode,
  handleReject,
  onInput,
}: Props): React.JSX.Element => {
  const [showSeparator, setShowSeparator] = useState(true);
  const { t } = useTranslation();

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    event.stopPropagation();
    if (event.key === "Enter" && !value.trim()) {
      return event.preventDefault();
    }
    if (event.key === "Enter" && !!value.trim() && !event.shiftKey) {
      event.preventDefault();
      return handleSubmit();
    }
    if (event.key === "Escape") {
      if (handleReject) {
        return handleReject();
      }
      return setValue("");
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    const target = event.target;
    setValue(target.value);
    if (target.scrollHeight > 20) {
      setShowSeparator(false);
    } else {
      setShowSeparator(true);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Input
        maxLength={560}
        id={`comment-message-input-${mode}`}
        placeholder={t(`comment.${mode}`)}
        value={value}
        onInput={onInput}
        inputContainerClassName={
          mode === "edit" ? styles.inputContainer : undefined
        }
        shouldFocus={true}
        shouldSelect={mode === "edit"}
        multiline={true}
        onKeyDown={onKeyDown}
        onPaste={(event) => event.stopPropagation()}
        onCopy={(event) => event.stopPropagation()}
        onChange={handleChange}
        postfixButton={
          (mode === "create" || mode === "reply") && (
            <div className={styles.submitBtnWrapper}>
              {showSeparator && (
                <UiSeparator
                  vertical={true}
                  className={styles.submitBtnSeparator}
                />
              )}
              <UiButton
                variant="secondary"
                className={styles.submitBtn}
                active={!!value}
                disabled={!value}
                onClick={handleSubmit}
                style={{ backgroundColor: "transparent" }}
              >
                <Icon iconName="Vector" width={20} height={20} />
              </UiButton>
            </div>
          )
        }
      />
      {mode === "edit" && (
        <div className={styles.editModeButtons}>
          <div>
            <button onClick={handleReject}>{t("common.cancel")}</button>
            <button onClick={handleSubmit} className={styles.saveBtn}>
              {t("common.save")}
            </button>
          </div>
          <button onClick={handleRemove} className={styles.deleteBtn}>
            {t("comment.deleteMessage")}
          </button>
        </div>
      )}
    </div>
  );
};

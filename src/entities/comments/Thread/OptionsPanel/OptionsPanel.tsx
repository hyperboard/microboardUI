import React, { CSSProperties, forwardRef } from "react";
import { UiPanel } from "../../../../shared/ui-lib/UiPanel";
import styles from "./OptionsPanel.module.css";
import { useTranslation } from "react-i18next";

interface Props {
  canRemove: boolean;
  handleRemove: () => void;
  setTextUnderEditor: () => void;
  style: CSSProperties;
}

export const OptionsPanel = forwardRef<HTMLDivElement, Props>(
  (
    { canRemove, handleRemove, style, setTextUnderEditor }: Props,
    ref,
  ): React.JSX.Element => {
    const { t } = useTranslation();

    return (
      <UiPanel ref={ref} className={styles.panel} vertical={true} style={style}>
        {canRemove && (
          <button className={styles.btn} onClick={handleRemove}>
            {t("comment.deleteMessage")}
          </button>
        )}
        <button onClick={setTextUnderEditor} className={styles.btn}>
          {t("comment.editMessage")}
        </button>
      </UiPanel>
    );
  },
);

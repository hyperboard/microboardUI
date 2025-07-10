import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { UiButton } from "shared/ui-lib/UiButton";
import { Link } from "shared/ui-lib/Link";
import styles from "./AiUnavailableModal.module.css";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";

export const AI_UNAVAILABLE_MODAL_ID = Symbol("aiUnavailableModal");

export function AiUnavailableModal(): JSX.Element {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { closeModal } = useUiModalContext();

	return (
		<UiModal modalId={AI_UNAVAILABLE_MODAL_ID} renderAsPageOnMobile={false}>
			<div className={styles.wrapper}>
				<h1 className={styles.heading}>{t("ai.unauth.heading")}</h1>
				<div className={styles.msg}>
					<Trans
						t={t}
						i18nKey={"ai.unauth.description"}
						components={{
							p: <p />,
							signinLink: (
								<Link
									to="/auth/sign-in"
									className={styles.link}
									onClick={closeModal}
								/>
							),
							signupLink: (
								<Link
									to="/auth/sign-up"
									className={styles.link}
									onClick={closeModal}
								/>
							),
						}}
					/>
				</div>

				<UiButton
					variant="primary"
					className={styles.btn}
					onClick={() => {
						navigate("/auth/sign-in");
						closeModal();
					}}
					size="lg"
				>
					{t("auth.signIn")}
				</UiButton>
			</div>
		</UiModal>
	);
}

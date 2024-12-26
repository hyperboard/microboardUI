import { UiModal } from "View/Ui/UiModal/UiModal";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "shared/ui-lib/Button";
import { Link } from "shared/ui-lib/Link";
import styles from "./AiUnavailableModal.module.css";

export const AI_UNAVAILABLE_MODAL_ID = Symbol("aiUnavailableModal");

export function AiUnavailableModal(): JSX.Element {
	const { t } = useTranslation();
	const navigate = useNavigate();

	return (
		<UiModal modalId={AI_UNAVAILABLE_MODAL_ID}>
			<div className={styles.wrapper}>
				<h1 className={styles.heading}>AI-чат на доске Microboard</h1>
				<div className={styles.msg}>
					<p>AI-чат доступен только авторизованным пользователям.</p>
					<p>
						<Link to="/auth/sign-in" className={styles.link}>
							{" "}
							{t("sharing.login")}
						</Link>{" "}
						{t("sharing.or")}{" "}
						<Link to="/auth/sign-up" className={styles.link}>
							{t("sharing.register")}
						</Link>
						, чтобы продолжить работу.
					</p>
				</div>

				<Button
					className={styles.btn}
					onClick={() => navigate("/auth/sign-in")}
				>
					{t("auth.signIn")}
				</Button>
			</div>
		</UiModal>
	);
}

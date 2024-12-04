import { useAccount } from "App/useAccount";
import { UiModal } from "View/Ui/UiModal/UiModal";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "shared/ui-lib/Button";
import { Link } from "shared/ui-lib/Link";
import styles from "./AccessDeniedModal.module.css";

export const ACCESS_DENIED_MODAL = Symbol("accessDeniedModal");

export function AccessDeniedModal() {
	const account = useAccount();
	const { t } = useTranslation();
	const navigate = useNavigate();

	return (
		<UiModal modalId={ACCESS_DENIED_MODAL}>
			<div className={styles.wrapper}>
				<h1 className={styles.heading}>Нет доступа</h1>
				<div className={styles.msg}>
					<p>
						Это приватная доска. Владелец доски ограничил доступ
						к просмотру и редактированию.{" "}
						{account.isLoggedIn
							? "Запросите доступ или войдите в аккаунт с правом доступа."
							: ""}
					</p>
					{account.isLoggedIn ? (
						<p>Вы авторизованы в аккаунте {account.info?.email}</p>
					) : (
						<p>
							{t("sharing.notAuthMsg")}{" "}
							<Link to="/auth/sign-in">{t("sharing.login")}</Link>{" "}
							{t("sharing.or")}{" "}
							<Link to="/auth/sign-up">
								{t("sharing.register")}
							</Link>
							.
						</p>
					)}
				</div>
				{account.isLoggedIn ? (
					<Button className={styles.btn}>Запросить доступ</Button>
				) : (
					<Button
						className={styles.btn}
						onClick={() => navigate("/auth/sign-in")}
					>
						Войти
					</Button>
				)}
			</div>
		</UiModal>
	);
}

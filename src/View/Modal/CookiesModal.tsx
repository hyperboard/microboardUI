import React, { useEffect, useState } from "react";
import styles from "./CookiesModal.module.css";
import { useTranslation } from "react-i18next";
import {
	InfoColor,
	Notification,
} from "shared/ui-lib/Notification/Notification";
import { Button } from "shared/ui-lib/Button";
import i18n from "Lang";
import Cookies from "js-cookie";

interface CookiesModalProps {
	className?: string;
}

export const CookiesModal = ({
	className,
}: CookiesModalProps): React.ReactElement => {
	const { t } = useTranslation();
	const [open, setOpen] = useState<boolean>(false);

	const redirectOnPolicy = (): void => {
		const policyUrl =
			i18n.language === "ru"
				? "https://microboard.ru/terms"
				: "https://microboard.io/terms";
		window.location.href = policyUrl;
	};

	const onAccept = (): void => {
		Cookies.set("first_visit", "true");
		setOpen(false);
	};

	useEffect(() => {
		const isOpenModal =
			Cookies.get("first_visit") && !Cookies.get("refreshToken");

		if (!isOpenModal) {
			setOpen(true);
		} else {
			setOpen(false);
		}

		if (!Cookies.get("first_visit")) {
			Cookies.set("first_visit", "true");
		}
	}, []);

	return (
		<Notification
			isOpen={open}
			className={className}
			infoIcon
			infoColor={InfoColor.info}
			setIsOpen={() => setOpen(false)}
			position="bottom"
		>
			<div className={styles.wr}>
				<h4 className={styles.title}>{t("cookiesModal.title")}</h4>
				<p className={styles.text}>{t("cookiesModal.text")}</p>
				<div className={styles.btns}>
					<Button
						pattern="tertiary"
						onClick={redirectOnPolicy}
						className={styles.btn}
					>
						{t("cookiesModal.learnMoreBtn")}
					</Button>
					<Button
						pattern="primary"
						onClick={onAccept}
						className={styles.btn}
					>
						{t("cookiesModal.acceptBtn")}
					</Button>
				</div>
			</div>
		</Notification>
	);
};

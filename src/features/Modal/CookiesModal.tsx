import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	InfoColor,
	Notification,
} from "shared/ui-lib/Notification/Notification";
import { UiButton } from "shared/ui-lib/UiButton";
import styles from "./CookiesModal.module.css";

interface CookiesModalProps {
	className?: string;
}

export const CookiesModal = ({
	className,
}: CookiesModalProps): React.ReactElement => {
	const { t, i18n } = useTranslation();
	const [open, setOpen] = useState<boolean>(false);

	const redirectOnPolicy = (): void => {
		const policyUrl =
			i18n.language === "ru"
				? "https://app.microboard.io/pdf/privacy_policy_ru.pdf"
				: "https://app.microboard.io/pdf/privacy_policy_en.pdf";
		window.location.href = policyUrl;
	};

	const onAccept = (): void => {
		Cookies.set("first_visit", "true", { expires: 182, path: "/" });
		setOpen(false);
	};

	useEffect(() => {
		const isOpenModal = Cookies.get("first_visit");

		if (!isOpenModal) {
			setOpen(true);
		} else {
			setOpen(false);
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
					<UiButton
						variant="tertiary"
						onClick={redirectOnPolicy}
						className={styles.btn}
					>
						{t("cookiesModal.learnMoreBtn")}
					</UiButton>
					<UiButton
						variant="primary"
						onClick={onAccept}
						className={styles.btn}
					>
						{t("cookiesModal.acceptBtn")}
					</UiButton>
				</div>
			</div>
		</Notification>
	);
};

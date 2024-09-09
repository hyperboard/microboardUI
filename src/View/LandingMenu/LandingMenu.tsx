import clsx from "clsx";
import { isMicroboardIframe } from "lib/isMicroboardIframe";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { EyeClosed, EyeOpened } from "../Icon";
import { UiButton } from "View/Ui/UiButton";
import { UiLink } from "View/Ui/UiLink";
import { UiPanel } from "View/Ui/UiPanel";
import { UiSeparator } from "View/Ui/UiSeparator";
import { LANDING_URL, LANDING_URL_EN } from "./const";
import style from "./LandingMenu.module.css";

export function LandingMenu() {
	const [isOpen, setIsOpen] = useState(true);
	const { t, i18n } = useTranslation();
	const isRu = i18n.language === "ru";
	const landingUrl = isRu ? LANDING_URL : LANDING_URL_EN;
	if (!isMicroboardIframe()) {
		return null;
	}

	const handleMenuToggle = () => setIsOpen(prev => !prev);
	return (
		<UiPanel
			padding={0}
			className={clsx(style.menuPanel, isOpen && style.open)}
		>
			<div className={style.linksWrapper}>
				<UiLink
					className={style.link}
					rounded="none"
					variant="secondary"
					target="_parent"
					href={`${landingUrl}#about`}
				>
					{t("landing.menu.about")}
				</UiLink>
				<UiSeparator vertical />
				<UiLink
					className={style.link}
					rounded="none"
					variant="secondary"
					target="_parent"
					href={
						isRu
							? `${landingUrl}/perenos-dannih-iz-miro`
							: `${landingUrl}#features`
					}
				>
					{isRu
						? t("landing.menu.importFromMiro")
						: t("landing.menu.features")}
				</UiLink>
				<UiSeparator vertical />

				<UiLink
					className={style.link}
					rounded="none"
					target="_parent"
					variant="secondary"
					href={`${landingUrl}#pricing`}
				>
					{t("landing.menu.price")}
				</UiLink>
				<UiSeparator vertical />
				<UiLink
					className={style.link}
					rounded="none"
					target="_parent"
					variant="secondary"
					href={`${landingUrl}#forma`}
				>
					{t("landing.menu.buy")}
				</UiLink>
				<UiSeparator vertical />
			</div>
			<UiButton
				onClick={handleMenuToggle}
				variant="secondary"
				rounded="none"
				className={style.openBtn}
			>
				{isOpen ? <EyeClosed /> : <EyeOpened />}
			</UiButton>
		</UiPanel>
	);
}

import clsx from "clsx";
import { isMicroboardIframe } from "shared/lib/isMicroboardIframe";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { EyeClosed, EyeOpened } from "../../shared/ui-lib/Icon";
import { UiLink } from "shared/ui-lib/UiLink";
import { UiPanel } from "shared/ui-lib/UiPanel";
import { LANDING_URL, LANDING_URL_EN } from "./const";
import style from "./LandingMenu.module.css";
import { UiSeparator } from "shared/ui-lib/UiSeparator";
import { UiButton } from "shared/ui-lib/UiButton";

export function LandingMenu(): React.ReactElement | null {
	const [isOpen, setIsOpen] = useState(true);
	const { t, i18n } = useTranslation();
	const isRu = i18n.language === "ru";
	const landingUrl = isRu ? LANDING_URL : LANDING_URL_EN;
	if (!isMicroboardIframe()) {
		return null;
	}

	const handleMenuToggle = (): void => setIsOpen(prev => !prev);
	return (
		<UiPanel
			padding={0}
			className={clsx(style.menuPanel, isOpen && style.open)}
			zIndex={2}
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

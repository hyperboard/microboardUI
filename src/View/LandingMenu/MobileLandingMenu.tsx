import Cookies from "js-cookie";
import { isMicroboardIframe } from "lib/isMicroboardIframe";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Icon, Logo } from "../Icon";
import { UiButton } from "View/Ui/UiButton";
import { UiLink } from "View/Ui/UiLink";
import { UiPanel } from "View/Ui/UiPanel";
import { LANDING_URL, LANDING_URL_EN } from "./const";
import style from "./MobileLandingMenu.module.css";

export function MobileLandingMenu(): React.ReactElement | null {
	const [isOpen, setIsOpen] = useState(false);
	const { t, i18n } = useTranslation();
	const isRu = i18n.language === "ru";
	const landingUrl = isRu ? LANDING_URL : LANDING_URL_EN;

	if (!isMicroboardIframe()) {
		return null;
	}

	const handleOpen = (): void => setIsOpen(true);
	const handleClose = (): void => setIsOpen(false);
	const isAuthorized = Cookies.get("refreshToken");
	return (
		<UiPanel padding={0} className={style.mobileLandingMenuWrapper}>
			<UiButton variant="secondary" onClick={handleOpen}>
				<Icon width={20} height={20} iconName="BurgerMenu" />
			</UiButton>
			{isOpen
				? createPortal(
						<div
							className={style.menuWrapper}
							onClick={handleClose}
						>
							<UiPanel
								padding={0}
								onClick={evt => evt.stopPropagation()}
								className={style.menu}
							>
								<header className={style.header}>
									<div className={style.mobileLogo}>
										<Logo id="mobile-logo" />
										<span translate="no">
											{t("appTitle")}
										</span>
									</div>
									<UiButton
										variant="secondary"
										onClick={handleClose}
									>
										<Icon iconName="Close" />
									</UiButton>
								</header>
								<nav className={style.links}>
									<UiLink
										onClick={handleClose}
										className={style.link}
										rounded="none"
										variant="secondary"
										target="_parent"
										href={`${landingUrl}#about`}
									>
										{t("landing.menu.about")}
									</UiLink>
									<UiLink
										onClick={handleClose}
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

									<UiLink
										onClick={handleClose}
										className={style.link}
										rounded="none"
										target="_parent"
										variant="secondary"
										href={`${landingUrl}#pricing`}
									>
										{t("landing.menu.price")}
									</UiLink>
									<UiLink
										onClick={handleClose}
										className={style.link}
										rounded="none"
										target="_parent"
										variant="secondary"
										href={`${landingUrl}#forma`}
									>
										{t("landing.menu.buy")}
									</UiLink>
								</nav>
								{!isAuthorized ? (
									<div className={style.authBtns}>
										<UiLink
											variant="secondary"
											className={style.authBtn}
											href={`/auth/sign-in`}
											target="_parent"
											size="sm"
										>
											{t("auth.login")}
										</UiLink>
										<UiLink
											className={style.authBtn}
											href={`/auth/sign-up`}
											size="sm"
											target="_parent"
										>
											{t("auth.signUp")}
										</UiLink>
									</div>
								) : null}
							</UiPanel>
						</div>,
						document.getElementById("modal")!,
					)
				: null}
		</UiPanel>
	);
}

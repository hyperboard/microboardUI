import QuickAddButtonsClear from "features/QuickAddButtons/QuickAddButtonsClear";
import { Navbar } from "features/Widgets/Navbar/Navbar";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { OuterLink } from "shared/ui-lib/OuterLink";
import { notify } from "shared/ui-lib/Toast";
import style from "./AuthLayout.module.css";

type Props = { showPolicies?: boolean };

export const AuthLayout = ({ showPolicies }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("authException") === "true") {
      setTimeout(() => {
        notify({
          header: t("auth.unknownError"),
          body: t("auth.googleError"),
          variant: "error",
        });
      }, 0);
      params.delete("authException");
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [location, navigate]);

  return (
    <QuickAddButtonsClear>
      <div className={style.authView}>
        <div className={style.navbar}>
          <Navbar />
        </div>
        <div className={style.content}>
          <Outlet />
        </div>
        {showPolicies && (
          <div className={style.policy}>
            {t("auth.policyWith")}{" "}
            <OuterLink
              href={
                i18n.language === "ru"
                  ? window.location.origin + "/pdf/terms_conditions_ru.pdf"
                  : window.location.origin + "/pdf/terms_conditions_en.pdf"
              }
              className={style.policyLink}
            >
              {t("auth.termsAndConditions")}
            </OuterLink>{" "}
            {t("common.and")}{" "}
            <OuterLink
              href={
                i18n.language === "ru"
                  ? window.location.origin + "/pdf/privacy_policy_ru.pdf"
                  : window.location.origin + "/pdf/privacy_policy_en.pdf"
              }
              className={style.policyLink}
            >
              {t("auth.privacyPolicy")}
            </OuterLink>
          </div>
        )}
      </div>
    </QuickAddButtonsClear>
  );
};

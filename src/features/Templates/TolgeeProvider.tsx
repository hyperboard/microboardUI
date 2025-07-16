import React, { memo, PropsWithChildren, useMemo } from "react";
import { DevTools, FormatSimple, Tolgee, TolgeeProvider } from "@tolgee/react";

export const TolgeeProviderProvider = memo(
  ({ children }: PropsWithChildren<{}>) => {
    const tolgee = useMemo(
      () =>
        Tolgee()
          .use(DevTools())
          .use(FormatSimple())
          .init({
            language: "en",
            availableLanguages: ["en", "ru"],
            observerType: "text",
            // observerOptions: {},

            apiUrl: import.meta.env.TOLGEE_API_URL,
            apiKey: import.meta.env.TOLGEE_API_KEY,
            projectId: import.meta.env.TOLGEE_PROJECT_ID,

            // for production
            staticData: {},
          }),
      [],
    );

    return <TolgeeProvider tolgee={tolgee}>{children}</TolgeeProvider>;
  },
);

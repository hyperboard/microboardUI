// buildDev.ts

import { build } from "bun";
import { copyPlugin } from "../bunUtils/copyPlugin";
import { inlineLinks } from "../bunUtils/inlineLinks";
import { outdir, baseConfig, entrypoints } from "./buildConfig";
import { envFallbackPlugin, injectEnvTag } from "../bunUtils";

// 1. Переименовали и 2. экспортировали функцию
export async function runBuildDev() {
  const plugins = [
    envFallbackPlugin({
      EMBED_URL: "https://dev-app.microboard.io",
    }),
  ];
  const result = await build({
    ...baseConfig,
    plugins: [
      copyPlugin({
        from: "src/public",
        to: outdir,
        bundle: baseConfig,
        plugins,
      }),
      copyPlugin({
        from: "src/shared/ui-lib/Icon/sprite.svg",
        to: outdir,
        plugins,
      }),
      ...plugins,
    ],
  });

  // 3. Заменили process.exit на throw
  if (!result.success) {
    // Выводим ошибки для диагностики
    console.error("Build failed:", result.logs);
    throw new Error("Build failed");
  }

  const htmlEndpoints = entrypoints
    .filter((ep) => ep.endsWith(".html"))
    .map((en) => en.replace(/^[^\/]+\//, "dist/"));

  await Promise.all(
    htmlEndpoints.map(async (ep) => {
      await inlineLinks(ep, outdir);
      await injectEnvTag(ep, "/env.js", "");
    }),
  );
}

// 4. Удалили эту строку: main().catch(console.error);
// export default () => {}; // Эта строка тоже не нужна, можно удалить

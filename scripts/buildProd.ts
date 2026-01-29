import { build } from "bun";
import {
  copyPlugin,
  cdnifyLinksPlugin,
  envFallbackPlugin,
  injectEnvTag,
} from "../bunUtils";
import path from "node:path";
import { outdir, baseConfig, entrypoints } from "./buildConfig";

// Функция для очистки пустых JS чанков (исправленная версия)
async function cleanUpHTML(htmlEntrypoint: string, dir = outdir) {
  const htmlPath = path.join(dir, htmlEntrypoint);
  const htmlFile = Bun.file(htmlPath);

  if (!(await htmlFile.exists())) return;

  let html = await htmlFile.text();
  const chunkRegex =
    /<script\b[^>]*\bsrc=(['"])(?:\.?\/)?(chunk-[^'"]+\.js)\1[^>]*>\s*<\/script>\s*/gi;
  const match = chunkRegex.exec(html);

  if (!match) return;

  const [fullTag, , fileName] = match;
  const filePath = path.join(outdir, fileName);
  const scriptFile = Bun.file(filePath);

  if ((await scriptFile.exists()) && scriptFile.size === 0) {
    html = html.replace(fullTag, "");
    await Bun.write(htmlPath, html);
    await scriptFile.delete();
    console.log(
      `[Cleanup] Removed empty chunk ${fileName} from ${htmlEntrypoint}`,
    );
  }
}

async function main() {
  // 1. ОПРЕДЕЛЯЕМ ПАРАМЕТРЫ БЭКЕНДА (теперь они берутся из переменных окружения при сборке)
  const API_URL =
    process.env.API_URL || "https://microboard.sanocks.workers.dev";
  const EMBED_URL = process.env.EMBED_URL || "https://dev-app.microboard.io";
  const WS_URL =
    process.env.WS_URL ||
    API_URL.replace("https://", "wss://").replace("http://", "ws://") + "/ws";

  console.log(`🚀 Building with API_URL: ${API_URL}`);

  const commonPlugins = [envFallbackPlugin({ EMBED_URL })];

  const standalonePlugins = [
    ...commonPlugins,
    copyPlugin({
      from: "src/public",
      to: outdir,
      bundle: baseConfig,
      plugins: commonPlugins,
    }),
    copyPlugin({
      from: "src/shared/ui-lib/Icon/sprite.svg",
      to: outdir,
      plugins: commonPlugins,
    }),
    cdnifyLinksPlugin("https://unpkg.com/microboard-ui-temp/dist"),
  ];

  // 2. СБОРКА
  const boardStandalone = await build({
    ...baseConfig,
    entrypoints: ["src/board.html"],
    plugins: standalonePlugins,
  });

  const exampleResult = await build({
    ...baseConfig,
    entrypoints: baseConfig.entrypoints.filter((ep) => ep !== "src/board.html"),
    plugins: commonPlugins,
  });

  if (!exampleResult.success || !boardStandalone.success) {
    console.error("Build failed");
    process.exit(1);
  }

  // 3. ГЕНЕРАЦИЯ env.js (это заменяет логику старого бэка)
  const envContent = `
window.MICROBOARD_FRONT_CONFIG = {
  apiURL: "${API_URL}",
  wsURL: "${WS_URL}"
};
console.log("Environment loaded");
  `.trim();

  await Bun.write(path.join(outdir, "env.js"), envContent);
  console.log("✅ env.js generated");

  // 4. ПОСТ-ОБРАБОТКА HTML ФАЙЛОВ
  const htmlFiles = entrypoints
    .filter((ep) => ep.endsWith(".html"))
    .map((en) => en.split("/").pop() as string);

  for (const htmlFile of htmlFiles) {
    if (htmlFile === "board.html") {
      await cleanUpHTML(htmlFile);
    } else {
      // Внедряем <script src="/env.js"> во все остальные HTML
      await injectEnvTag(htmlFile, "/env.js");
    }
  }

  // 5. ПОДГОТОВКА ДЛЯ CLOUDFLARE PAGES (SPA MODE)

  // Копируем example.html в index.html (это точка входа вашего приложения)
  const exampleHtml = path.join(outdir, "example.html");
  if (await Bun.file(exampleHtml).exists()) {
    await Bun.write(
      path.join(outdir, "index.html"),
      await Bun.file(exampleHtml).text(),
    );
    console.log("✅ index.html created from example.html");
  }

  // Создаем файл _redirects для корректного роутинга в CF Pages
  await Bun.write(path.join(outdir, "_redirects"), "/*  /index.html  200");
  console.log("✅ _redirects created");

  console.log("🎉 Build completed successfully!");
}

main().catch(console.error);

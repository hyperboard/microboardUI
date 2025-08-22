import { build, BuildConfig } from "bun";
import { copyPlugin } from "../bunUtils/copyPlugin";
import { inlineLinks } from "../bunUtils/inlineLinks";
import { outdir, baseConfig, entrypoints } from "./buildConfig";
import { envFallbackPlugin, injectEnvTag } from "../bunUtils";

async function main() {
  const plugins = [
    envFallbackPlugin({
      EMBED_URL: "https://app.microboard.io",
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

  if (!result.success) process.exit(1);

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

main().catch(console.error);

export default () => {};

import { build, BuildConfig } from "bun";
import { copyPlugin } from "../bunUtils/copyPlugin";
import { inlineLinks } from "../bunUtils/inlineLinks";
import { outdir, baseConfig, entrypoints } from "./buildConfig";

async function main() {
  const result = await build({
    ...baseConfig,
    plugins: [
      copyPlugin({
        from: "src/public",
        to: outdir,
        bundle: baseConfig,
      }),
      copyPlugin({
        from: "src/shared/ui-lib/Icon/sprite.svg",
        to: outdir,
      }),
    ],
  });

  if (!result.success) process.exit(1);

  const htmlEndpoints = entrypoints
    .filter((ep) => ep.endsWith(".html"))
    .map((en) => en.replace(/^[^\/]+\//, "dist/"));

  await Promise.all(htmlEndpoints.map(async (ep) => inlineLinks(ep, outdir)));
}

main().catch(console.error);

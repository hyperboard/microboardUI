import { build, BuildConfig } from "bun";
import {
  copyPlugin,
  cdnifyLinksPlugin,
  envFallbackPlugin,
  injectEnvTag,
} from "../bunUtils";
import path from "path";
import { outdir, baseConfig, entrypoints } from "./buildConfig";

async function cleanUpHTML(htmlEntrypoint: string, dir = outdir) {
  // resulting html has empty chunk-xxxxxxxx.js file, removes tag and file
  const htmlPath = path.join(dir, htmlEntrypoint);
  const htmlFile = Bun.file(htmlPath);

  let html = await htmlFile.text();

  const chunkRegex =
    /<script\b[^>]*\bsrc=(['"])(?:\.?\/)?(chunk-[^'"]+\.js)\1[^>]*>\s*<\/script>\s*/gi;
  const match = chunkRegex.exec(html);
  if (!match) {
    console.log("didnt find any js chunks");
    return;
  }

  // fullTag — <script>…</script>
  // fileName — e.g. "chunk-vz1894k0.js"
  const [fullTag, , fileName] = match;
  const filePath = path.join(outdir, fileName);

  const scriptFile = Bun.file(filePath);
  if (scriptFile.size === 0) {
    html = html.replace(fullTag, "");
    htmlFile.write(html);
    scriptFile.delete();
    console.log("cleaned empty chunk:", fileName, "in file", htmlPath);
  } else {
    console.log(`chunk ${fileName} is not empty`);
  }
}

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
      cdnifyLinksPlugin("https://unpkg.com/microboard-ui-temp/dist"),
      envFallbackPlugin(),
    ],
  });

  if (!result.success) process.exit(1);

  entrypoints
    .filter((ep) => ep.endsWith(".html"))
    .map((en) => en.split("/")[1])
    .forEach(async (htmlEP) => {
      await cleanUpHTML(htmlEP);
      await injectEnvTag(htmlEP, "/env.js");
    });
}

main().catch(console.error);

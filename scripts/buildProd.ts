import { build, BuildConfig } from "bun";
import { copyPlugin } from "../bunUtils/copyPlugin";
import path from "path";
import { cdnifyLinksPlugin } from "../bunUtils/cdnifyLinksPlugin";
import { outdir, baseConfig, entrypoints } from "./buildConfig";

async function cleanUpHTML(htmlEntrypoint: string) {
  // resulting html has empty chunk-xxxxxxxx.js file, removes tag and file
  const htmlPath = path.join(outdir, htmlEntrypoint);
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
    console.log("cleaned empty chunk:", fileName);
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
    ],
  });

  if (!result.success) process.exit(1);

  entrypoints
    .filter((ep) => ep.endsWith(".html"))
    .map((en) => en.split("/")[1])
    .forEach((ep) => cleanUpHTML(ep));
}

main().catch(console.error);

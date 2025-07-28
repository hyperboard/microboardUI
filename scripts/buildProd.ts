import dts from "bun-plugin-dts";
import { build } from "bun";
import { copyPlugin } from "../bunUtils/copyPlugin";
import path from "path";
import { cdnifyLinksPlugin } from "../bunUtils/cdnifyLinksPlugin";

const outdir = "dist";

async function cleanup() {
  // resulting html has empty chunk-xxxxxxxx.js file, removes tag and file
  const htmlPath = path.join(outdir, "board.html");
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
    entrypoints: ["src/board.html", "src/index.ts"],
    outdir,
    loader: {
      ".css": "css",
      ".svg": "file",
      // ".html": "file",
    },

    publicPath: "/",
    format: "esm",
    splitting: false,
    plugins: [
      copyPlugin({
        from: "src/public",
        to: outdir,
        bundle: true,
      }),
      copyPlugin({
        from: "src/shared/ui-lib/Icon/sprite.svg",
        to: outdir,
      }),
      cdnifyLinksPlugin("https://unpkg.com/microboard-ui-temp/dist"),
      // dts(),
    ],
  });

  if (!result.success) process.exit(1);

  cleanup();
}

main().catch(console.error);

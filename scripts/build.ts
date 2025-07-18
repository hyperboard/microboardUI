import { build } from "bun";
import { copyPlugin } from "../bunPlugins/copyPlugin";
import path from "path";
import fs from "fs";

const outdir = "dist";

function cleanup() {
  // resulting html has empty chunk-xxxxxxxx.js file, removes tag and file
  const htmlPath = path.join(outdir, "board.html");
  let html = fs.readFileSync(htmlPath, "utf-8");

  const chunkRegex =
    /<script\b[^>]*\bsrc=(['"])(?:\.?\/)?(chunk-[^'"]+\.js)\1[^>]*>\s*<\/script>\s*/gi;
  const match = chunkRegex.exec(html);
  if (!match) {
    console.log("didnt find any js chunks");
    return;
  }

  const [fullTag, , fileName] = match;
  // fullTag — <script>…</script>
  // fileName — e.g. "chunk-vz1894k0.js"
  const filePath = path.join(outdir, fileName);
  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    html = html.replace(fullTag, "");
    fs.writeFileSync(htmlPath, html, "utf-8");
    fs.unlinkSync(path.join(outdir, fileName));
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
        from: "src/board.css",
        to: outdir,
        bundle: true,
      }),
      copyPlugin({
        from: "src/shared/ui-lib/Icon/sprite.svg",
        to: outdir,
      }),
    ],
  });

  if (!result.success) process.exit(1);

  cleanup();
}

main().catch(console.error);

#!/usr/bin/env bun

import { readdir } from "fs/promises";
import { readFile, writeFile } from "fs/promises";
import path from "path";

async function main() {
  const cwd = process.cwd();
  const pkgPath = path.join(cwd, "package.json");
  const distDir = path.join(cwd, "dist");

  const pkgRaw = await readFile(pkgPath, "utf8");
  const pkg = JSON.parse(pkgRaw);

  pkg.exports = pkg.exports || {};

  const files = await readdir(distDir);
  for (const file of files) {
    if (!file.endsWith(".svg")) continue;

    // e.g.: "sticker-blue-29z5e7dv.svg" → name="sticker-blue"
    const m = file.match(/^(.*)-[0-9a-z]+\.svg$/i);
    if (!m) continue;

    const base = m[1] + ".svg"; // e.g. "sticker-blue.svg"
    const exportPath = `./${base}`;
    const importPath = `./dist/${file}`;

    pkg.exports[exportPath] = { import: importPath };
  }

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log("✅ svg exports updated in package.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

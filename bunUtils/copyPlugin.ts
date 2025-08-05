import { BuildConfig, type BunPlugin } from "bun";
import {
  rmSync,
  mkdirSync,
  readdirSync,
  copyFileSync,
  statSync,
  existsSync,
} from "node:fs";
import { join, extname, dirname, basename } from "node:path";

const bundleExt = new Set([".ts", ".js", ".html"]);

async function processFile(from: string, to: string, bundle?: BuildConfig) {
  const outDir = dirname(to);
  mkdirSync(outDir, { recursive: true });
  if (bundle && bundleExt.has(extname(from))) {
    await Bun.build({
      ...bundle,
      entrypoints: [from],
      outdir: outDir,
    });
  } else {
    copyFileSync(from, to);
  }
}

async function processDirectory(
  src: string,
  dest: string,
  bundle?: BuildConfig,
) {
  const stats = statSync(src);
  if (stats.isDirectory()) {
    mkdirSync(dest, { recursive: true });
    for (const child of readdirSync(src)) {
      await processDirectory(join(src, child), join(dest, child), bundle);
    }
  } else {
    await processFile(src, dest, bundle);
  }
}

let cleaned: Record<string, boolean> = {};

export function copyPlugin(opts: {
  from: string;
  to: string;
  bundle?: BuildConfig;
  cleanDir?: boolean;
}): BunPlugin {
  const { from, to, bundle, cleanDir = true } = opts;

  return {
    name: "copy-plugin",
    setup(build) {
      build.onStart(async () => {
        if (!cleaned[to] && cleanDir) {
          cleaned[to] = true;
          rmSync(to, { recursive: true, force: true });
          mkdirSync(to, { recursive: true });
        }

        const statsFrom = statSync(from);
        if (statsFrom.isFile()) {
          await processFile(from, join(to, basename(from)), bundle);
          return;
        }
        if (!statsFrom.isDirectory()) {
          throw new Error(`${from} is not a file or a directory`);
        }

        for (const name of readdirSync(from)) {
          const srcPath = join(from, name);
          const destPath = join(to, name);
          const stats = statSync(srcPath);

          if (stats.isDirectory()) {
            await processDirectory(srcPath, destPath, bundle);
          } else {
            await processFile(srcPath, destPath, bundle);
          }
        }
      });
    },
  };
}

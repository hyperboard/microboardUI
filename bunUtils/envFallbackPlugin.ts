import type { BunPlugin } from "bun";
import { outdir } from "../scripts/buildConfig";
import path from "node:path";

/**
 * Rewrites ANY `import.meta.env.FOO` or `import.meta.env["FOO"]`
 * - if FOO in `overrides`: to a string literal (e.g. `"https://..."`)
 * - else: to `(globalThis.__ENV__?.FOO ?? "")`
 */
export function envFallbackPlugin(
  overrides: Record<string, string> = {},
): BunPlugin {
  // dot access: import.meta.env.FOO
  const reDot = /\bimport\.meta\.env\.([A-Za-z_]\w*)\b/g;
  // bracket access: import.meta.env["FOO"] / ['FOO'] / `FOO`
  const reBracket = /import\.meta\.env\[(["'`])([A-Za-z_]\w*)\1\]/g;

  const hasOverride = (key: string) =>
    Object.prototype.hasOwnProperty.call(overrides, key);

  const subst = (key: string) =>
    hasOverride(key)
      ? JSON.stringify(overrides[key]) // safe string literal
      : `(globalThis.__ENV__?.${key} ?? "")`;

  return {
    name: "import-meta-env-fallback-all",
    setup(build) {
      build.onLoad({ filter: /\.[mc]?[jt]sx?$/ }, async (args) => {
        const text = await Bun.file(args.path).text();

        // fast check
        if (!text.includes("import.meta.env")) return;

        const contents = text
          .replace(reDot, (_m, key: string) => subst(key))
          .replace(reBracket, (_m, _q, key: string) => subst(key));

        const loader = args.path.endsWith(".tsx")
          ? "tsx"
          : args.path.endsWith(".ts")
            ? "ts"
            : args.path.endsWith(".jsx")
              ? "jsx"
              : "js";

        return { contents, loader };
      });
    },
  };
}

export async function injectEnvTag(
  htmlEntrypoint: string,
  src = "/env.js",
  dir = outdir,
) {
  const htmlPath = path.join(dir, htmlEntrypoint);
  let html = await Bun.file(htmlPath).text();

  if (html.includes(`src="${src}"`)) return;

  const tag = `<script src="${src}"></script>`;

  if (/<script\b/i.test(html)) {
    html = html.replace(/<script\b/i, `${tag}\n<script`);
  } else if (/<head\b[^>]*>/i.test(html)) {
    html = html.replace(/<head\b[^>]*>/i, (m) => `${m}\n${tag}`);
  } else {
    html = html.replace(/<\/body>/i, `${tag}\n</body>`);
  }

  await Bun.write(htmlPath, html);
}

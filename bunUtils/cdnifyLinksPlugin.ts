import { type BunPlugin } from "bun";

/**
 * Rewrites local asset URLs in HTML to point to a CDN.
 *
 * @param cdnBase - Base URL of the CDN (e.g. "https://cdn.example.com")
 * @param localDir - Local directory prefix to replace (default: "public")
 * @returns A Bun plugin that replaces `<script src="…">` and `<link href="…">`
 */
export function cdnifyLinksPlugin(
  cdnBase: string,
  localDir = "public",
): BunPlugin {
  const dirEscaped = localDir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const scriptRe = new RegExp(
    `\\bsrc=(['"])${dirEscaped}\\/([^'"]+?)\\.(?:ts|tsx|cjs|mjs|js)\\1`,
    "gi",
  );
  const assetRe = new RegExp(
    `\\bhref=(['"])${dirEscaped}\\/([^'"]+?)\\.(css|png|svg|ico|webmanifest)\\1`,
    "gi",
  );

  return {
    name: "cdnify-plugin",
    setup(build) {
      build.onLoad({ filter: /\.html$/ }, async (args) => {
        let html = await Bun.file(args.path).text();
        html = html
          .replace(
            scriptRe,
            (_match, quote, name) =>
              `src=${quote}${cdnBase}/${name}.js${quote}`,
          )
          .replace(
            assetRe,
            (_match, quote, name, ext) =>
              `href=${quote}${cdnBase}/${name}.${ext}${quote}`,
          );
        return {
          loader: "html",
          contents: html,
        };
      });
    },
  };
}

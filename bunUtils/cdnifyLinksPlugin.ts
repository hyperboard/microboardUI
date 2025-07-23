import { type BunPlugin } from "bun";

/**
 * Replace local “public/…” script and stylesheet URLs with CDN URLs.
 */
export function cdnifyLinksPlugin(cdnBase: string): BunPlugin {
  return {
    name: "cdnify-plugin",
    setup(build) {
      build.onLoad({ filter: /\.html$/ }, async (args) => {
        const file = Bun.file(args.path);
        let html = await file.text();

        html = html
          .replace(
            /\bsrc=(['"])public\/([^'"]+?)\.(?:ts|tsx|cjs|mjs|js)\1/gi,
            (_match, quote, name) =>
              `src=${quote}${cdnBase}/${name}.js${quote}`,
          )
          .replace(
            /\bhref=(['"])public\/([^'"]+?)\.css\1/gi,
            (_match, quote, name) =>
              `href=${quote}${cdnBase}/${name}.css${quote}`,
          );

        return {
          loader: "html",
          contents: html,
        };
      });
    },
  };
}

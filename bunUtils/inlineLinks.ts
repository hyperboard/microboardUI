import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Options, parse, type HTMLElement } from "node-html-parser";

const PARSE_OPTS: Options = {
  lowerCaseTagName: false,
  comment: true,
  fixNestedATags: true,
  parseNoneClosedTags: false,
  blockTextElements: {
    script: true,
    style: true,
    pre: true,
    textarea: true,
  },
  voidTag: {
    closingSlash: false,
  },
};

/**
 * Inline all relative <script src="..."></script> and
 * <link rel="stylesheet" href="..."> tags in the given HTML file.
 * @param htmlPath Path to the HTML file to process.
 * @param outdir Directory containing the generated files.
 */
export async function inlineLinks(
  htmlPath: string,
  outdir: string,
): Promise<void> {
  const isExternal = (u: string) => /^(?:[a-z]+:)?\/\//i.test(u);
  const stripQueryHash = (u: string) => u.split("#")[0].split("?")[0];
  const normalizeRel = (u: string) => stripQueryHash(u).replace(/^[\\/]+/, "");
  const readIfExists = (p: string) =>
    existsSync(p) ? readFileSync(p, "utf8").trim() : null;
  const escapeScript = (s: string) => s.replace(/<\/script/gi, "<\\/script>");
  const escapeStyle = (s: string) => s.replace(/<\/style/gi, "<\\/style>");

  const file = Bun.file(htmlPath);
  const html = await file.text();
  const root = parse(html, PARSE_OPTS);

  // <script src="...">
  root.querySelectorAll("script[src]").forEach((el) => {
    const src = (el.getAttribute("src") || "").trim();
    if (!src || isExternal(src)) return;

    const filePath = join(outdir, normalizeRel(src));
    const code = readIfExists(filePath);
    if (code == null) return;

    const attrs = Object.entries(el.attributes)
      .filter(([k]) => k.toLowerCase() !== "src")
      .map(([k, v]) =>
        v === "" ? ` ${k}` : ` ${k}="${v.replace(/"/g, "&quot;")}"`,
      )
      .join("");

    const scriptNode = parse(
      `<script${attrs}>\n${escapeScript(code)}\n</script>`,
      PARSE_OPTS,
    ).querySelector("script") as HTMLElement;

    el.parentNode?.exchangeChild(el, scriptNode);
  });

  // <link rel="stylesheet" href="...">
  root.querySelectorAll('link[rel="stylesheet"][href]').forEach((el) => {
    const href = (el.getAttribute("href") || "").trim();
    if (!href || isExternal(href)) return;

    const filePath = join(outdir, normalizeRel(href));
    const css = readIfExists(filePath);
    if (css == null) return;

    const media = el.getAttribute("media");
    const disabled = el.hasAttribute("disabled");

    const styleOpen =
      `<style` +
      (media ? ` media="${media.replace(/"/g, "&quot;")}"` : "") +
      (disabled ? ` disabled` : "") +
      `>`;
    const styleNode = parse(
      `${styleOpen}\n${escapeStyle(css)}\n</style>`,
      PARSE_OPTS,
    ).querySelector("style") as HTMLElement;

    el.parentNode?.exchangeChild(el, styleNode);
  });

  await Bun.write(htmlPath, root.toString());
}

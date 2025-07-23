import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

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
  const file = await Bun.file(htmlPath);
  let html = await file.text();

  // inline scripts
  html = html.replace(
    /<script\b[^>]*\bsrc\s*=\s*(['"])(?!https?:\/\/|\/\/)([^'"]+)\1[^>]*>[\s\S]*?<\/script>/gi,
    (_match, _q, src) => {
      const filePath = join(outdir, src);
      if (!existsSync(filePath)) return _match;
      const code = readFileSync(filePath, "utf-8");
      return `<script>\n${code.trim()}\n</script>`;
    },
  );

  // inline styles
  html = html.replace(
    /<link\b[^>]*\brel\s*=\s*(['"])stylesheet\1[^>]*\bhref\s*=\s*(['"])(?!https?:\/\/|\/\/)([^'"]+)\2[^>]*>/gi,
    (_match, _r, _q, href) => {
      const filePath = join(outdir, href);
      if (!existsSync(filePath)) return _match;
      const css = readFileSync(filePath, "utf-8");
      return `<style>\n${css.trim()}\n</style>`;
    },
  );

  await file.write(html);
}

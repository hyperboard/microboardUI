import { build } from "esbuild";

interface BundleCssOptions {
  entryPoints: string[];
  outfile: string;
  bundle: boolean;
}

export async function bundleCSS({
  entryPoints,
  outfile,
  bundle,
}: BundleCssOptions) {
  return build({
    entryPoints,
    outfile,
    bundle,
  });
}

import { $ } from "bun";
import { runBuildDev } from "./scripts/buildDev";
import { outdir } from "./scripts/buildConfig";

async function main() {
  const target = process.env.FRONTEND_TARGET_DIR || "./dist_final";
  try {
    await runBuildDev();
    await $`mkdir -p ${target}`;
    await $`cp -rf ${outdir}/. ${target}`;

    if (await Bun.file(`${target}/board.html`).exists()) {
      await $`cp ${target}/board.html ${target}/index.html`;
    }
    console.log("✅ Assets prepared");
  } catch (err) {
    process.exit(1);
  }
}
main();

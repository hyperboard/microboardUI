// buildDevAndCopy.ts (с логами для отладки)

import { $ } from "bun";
import { outdir } from "./buildConfig";
import chokidar from "chokidar";
import { runBuildDev } from "./buildDev";

async function main() {
  const target = process.env.FRONTEND_TARGET_DIR;
  if (!target) {
    throw new Error(`No target dir env value FRONTEND_TARGET_DIR`);
  }

  const run = async () => {
    try {
      await runBuildDev();
      await $`mkdir -p ${target}`;
      await $`cp -LR ${outdir}/* ${target}`;
    } catch (error) {
      console.error("Build process error.");
    }
  };

  let timer: Timer | undefined;
  const kick = () => {
    clearTimeout(timer);
    timer = setTimeout(run, 150);
  };

  await run();

  chokidar.watch("src", { ignoreInitial: true }).on("all", (event, path) => {
    kick();
  });
  await new Promise(() => {});
}

main().catch((err) => {
  console.error("Error main:", err);
  process.exit(1);
});

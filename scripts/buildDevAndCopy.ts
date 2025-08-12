import { $ } from "bun";
import { outdir } from "./buildConfig";
import chokidar from "chokidar";

const target = process.env.FRONTEND_TARGET_DIR;
if (!target) {
  throw new Error(`No target dir env value FRONTEND_TARGET_DIR`);
}

const run = async () => {
  const b = await $`bun run build:dev`;
  if (b.exitCode !== 0) return;
  await $`mkdir -p ${target}`;
  await $`cp -LR ${outdir}/* ${target}`;
  console.log("Build+copy done", new Date().toLocaleTimeString());
};

let timer: Timer | undefined;
const kick = () => {
  clearTimeout(timer);
  timer = setTimeout(run, 150);
};

await run();
chokidar.watch("src", { ignoreInitial: true }).on("all", kick);

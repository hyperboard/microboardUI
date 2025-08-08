import { $ } from "bun";
import { outdir } from "./buildConfig";
import chokidar from "chokidar";

const target = process.env.FRONTEND_TARGET_DIR;
if (!target) {
  throw new Error(`No target dir env value FRONTEND_TARGET_DIR`);
}
// const devBuilt = await $`bun run build:dev`;
// if (devBuilt.exitCode !== 0) {
//   throw new Error(`failed to build dev, exited with code ${devBuilt.exitCode}`);
// }
// console.log(`Copying ${outdir} → ${target}`);
// await $`mkdir -p ${target}`;
// await $`cp -LR ${outdir}/* ${target}`;
// console.log("Copy done!");
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
  // подожди 100–200мс, чтобы схлопнуть серию изменений
  timer = setTimeout(run, 150);
};

await run(); // начальный билд
chokidar.watch("src", { ignoreInitial: true }).on("all", kick);

// import { $ } from "bun";
// import { join } from "node:path";
// import { outdir, entrypoints } from "./buildConfig";

// const target = process.env.FRONTEND_TARGET_DIR;
// if (!target) throw new Error("No FRONTEND_TARGET_DIR env set");

// const args = [
//   "build",
//   ...entrypoints, // например: ["src/main.tsx"]
//   "--outdir",
//   outdir,
//   "--target=browser",
//   "--splitting",
//   "--sourcemap=inline",
//   // "--minify",            // как нужно
// ];

// async function copyOutdir() {
//   console.log(`Copying ${outdir} → ${target}`);
//   await $`mkdir -p ${target}`;
//   // Чистим цель, чтобы не висели старые файлы (rsync нет — делаем rm + cp)
//   await $`sh -lc 'rm -rf "${target?.replace(/\/+$/, "")}/*"'`;
//   await $`cp -LR ${outdir} ${target}`;
//   console.log("Copy done");
// }

// async function initialBuild() {
//   console.log("Initial build…");
//   const res = await $`bun ${args}`.quiet();
//   if (res.exitCode !== 0) {
//     console.error(res.stdout.toString(), res.stderr.toString());
//     throw new Error(`Initial build failed with code ${res.exitCode}`);
//   }
//   await copyOutdir();
// }

// async function watchBuild() {
//   console.log("Starting bun build --watch…");
//   const proc = Bun.spawn(["bun", ...args, "--watch"], {
//     stdout: "pipe",
//     stderr: "pipe",
//   });

//   const decoder = new TextDecoder();
//   let buffer = "";
//   const trigger = debounce(async () => {
//     try {
//       await copyOutdir();
//     } catch (e) {
//       console.error("Copy failed:", e);
//     }
//   }, 150);

//   // читаем stdout построчно и ловим маркеры успешного ребилда
//   (async () => {
//     for await (const chunk of proc.stdout) {
//       buffer += decoder.decode(chunk);
//       const lines = buffer.split(/\r?\n/);
//       buffer = lines.pop() || "";
//       for (const line of lines) {
//         // Bun обычно пишет что-то вроде "Built in 123ms" / "built X modules"
//         if (/^Built\b|built\b|success|✓/i.test(line)) trigger();
//         // На всякий — просто активируем по любому изменению вывода
//       }
//     }
//   })();

//   // дублируем ошибки
//   (async () => {
//     for await (const chunk of proc.stderr) {
//       const s = decoder.decode(chunk);
//       process.stderr.write(s);
//     }
//   })();

//   // корректное завершение
//   const stop = () => {
//     try {
//       proc.kill();
//     } catch {}
//     process.exit(0);
//   };
//   process.on("SIGINT", stop);
//   process.on("SIGTERM", stop);

//   console.log("Watching for changes…");
//   await proc.exited; // держим процесс живым
// }

// // простой дебаунсер
// function debounce(fn: () => void | Promise<void>, ms: number) {
//   let t: any;
//   return () => {
//     clearTimeout(t);
//     t = setTimeout(fn, ms);
//   };
// }

// await initialBuild();
// await watchBuild();

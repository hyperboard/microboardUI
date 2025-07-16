import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const gitHooksSourceDir = path.resolve(__dirname, "git-hooks");
const gitHooksDestinationDir = path.resolve(__dirname, "..", ".git/hooks");

const validHookNames = [
  "applypatch-msg",
  "commit-msg",
  "fsmonitor-watchman",
  "pre-applypatch",
  "pre-commit",
  "pre-merge-commit",
  "prepare-commit-msg",
  "pre-push",
  "pre-rebase",
  "pre-receive",
  "update",
  "post-applypatch",
  "post-checkout",
  "post-commit",
  "post-merge",
  "post-receive",
  "post-rewrite",
  "post-update",
  "push-to-checkout",
  "sendemail-validate",
];

// Copy the .js scripts to `.git/hooks/` with the appropriate hook name and make them executable
fs.readdirSync(gitHooksSourceDir).forEach((file) => {
  const sourcePath = path.join(gitHooksSourceDir, file);
  const hookName = path.basename(file, ".js");

  if (validHookNames.includes(hookName)) {
    const destinationPath = path.join(gitHooksDestinationDir, hookName);

    try {
      fs.copyFileSync(sourcePath, destinationPath);
      fs.chmodSync(destinationPath, "0755");
      console.log(`The ${hookName} hook has been installed.`);
    } catch (error) {
      console.error(`Failed to install the ${hookName} hook:`, error);
    }
  }
});

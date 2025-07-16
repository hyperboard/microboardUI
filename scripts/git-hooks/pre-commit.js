#!/usr/bin/env bun

import { execSync } from "child_process";

// ANSI escape code colors
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const NC = "\x1b[0m"; // No Color

function runCommand(command) {
  return execSync(command, { stdio: "pipe" }).toString().trim();
}

function getStagedFiles() {
  try {
    const output = runCommand(
      "git diff --cached --name-only --diff-filter=ACMR",
    );
    return output ? output.split("\n") : [];
  } catch (error) {
    process.stderr.write(`${RED}Failed to get staged files: ${error}${NC}\n`);
    process.exit(1);
  }
}

function prettifyFiles(files) {
  files.forEach((file) => {
    runCommand(`bunx prettier --ignore-unknown --write "${file}"`);
  });
}

function lintFiles() {
  runCommand("bun run fix:css");
  runCommand("bun run lint");
  // runCommand("npx eslint --ext .ts,.tsx --quiet --fix ./src");
}

function addToGit(files) {
  files.forEach((file) => {
    runCommand(`git add "${file}"`);
  });
}

function runPreCommitHook() {
  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    console.log(`${GREEN}✔ There are no files to prettify or lint${NC}`);
    process.exit(0);
  }

  try {
    prettifyFiles(stagedFiles);
    console.log(`${GREEN}✔ All modified files are prettified${NC}`);
    addToGit(stagedFiles);
  } catch (error) {
    console.error(`${RED}✖ Failed to prettify files:${NC}\n${error}`);
    process.exit(1);
  }

  try {
    lintFiles();
    console.log(`${GREEN}✔ Linting and auto-fixes applied${NC}`);
  } catch (error) {
    console.error(`${RED}✖ Linting errors have occurred:${NC}\n${error}`);
    process.exit(0);
  }
}

runPreCommitHook();

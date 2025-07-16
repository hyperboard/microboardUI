#!/usr/bin/env bun

import fs from "fs";
import path from "path";

/**
 * Recursively collects all files that satisfy the `filter` condition
 * @param {string} dir directory to traverse
 * @param {(filename: string) => boolean} filter predicate function
 * @param {string[]} out accumulator for found paths
 */
function walk(
  dir: string,
  filter: (filename: string) => boolean,
  out: string[] = [],
) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      walk(full, filter, out);
    } else if (filter(full)) {
      out.push(full);
    }
  }
  return out;
}

// Find all .module.css files
const cssFiles = walk(process.cwd(), (f) => f.endsWith(".module.css"));

if (!cssFiles.length) {
  console.log("No .module.css files found.");
  process.exit(0);
}

// Regex for kebab-case classes (e.g., .tip-container)
const kebabClassRegex = /\.([a-z][a-z0-9]*(?:-[a-z0-9]+)+)/g;
// Regex for PascalCase classes (e.g., .InputContainer)
const pascalClassRegex = /\.([A-Z][a-zA-Z0-9]+)/g;

for (const file of cssFiles) {
  let content = fs.readFileSync(file, "utf8");
  let updated = content
    // Convert kebab-case to camelCase
    .replace(kebabClassRegex, (_, cls) => {
      const camel = cls.replace(/-([a-z0-9])/g, (_, ch) => ch.toUpperCase());
      return `.${camel}`;
    })
    // Convert PascalCase to camelCase
    .replace(pascalClassRegex, (_, cls) => {
      const camel = cls[0].toLowerCase() + cls.slice(1);
      return `.${camel}`;
    });

  if (updated !== content) {
    fs.writeFileSync(file, updated, "utf8");
    console.log(`Updated: ${path.relative(process.cwd(), file)}`);
  }
}

console.log(`Done — processed ${cssFiles.length} files.`);

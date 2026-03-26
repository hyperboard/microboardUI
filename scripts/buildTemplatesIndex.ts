import fs from "fs/promises";
import path from "path";

const TEMPLATES_DIR = path.join(process.cwd(), "src", "public", "templates");
const OUTPUT_FILE = path.join(TEMPLATES_DIR, "index.json");

async function buildTemplatesIndex() {
  try {
    const entries = await fs.readdir(TEMPLATES_DIR, { withFileTypes: true });
    const templates = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const metadataPath = path.join(
          TEMPLATES_DIR,
          entry.name,
          "metadata.json",
        );
        try {
          const content = await fs.readFile(metadataPath, "utf-8");
          const metadata = JSON.parse(content);
          // Ensure ID matches folder name
          if (metadata.id !== entry.name) {
            console.warn(
              `Template ID mismatch for folder ${entry.name}. Using folder name as ID.`,
            );
            metadata.id = entry.name;
          }
          templates.push(metadata);
        } catch (e) {
          console.error(
            `Skipping ${entry.name}: missing or invalid metadata.json`,
          );
        }
      }
    }

    // Sort by created date descending (newest first)
    templates.sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
    );

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(templates, null, 2));
    console.log(
      `✅ Built templates index.json with ${templates.length} templates.`,
    );
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log(
        "No src/public/templates directory found, skipping template index build.",
      );
      return;
    }
    console.error("Error building templates index:", error);
    process.exit(1);
  }
}

buildTemplatesIndex();

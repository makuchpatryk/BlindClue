import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { join } from "path";

function walkDir(dir) {
  const files = readdirSync(dir, { withFileTypes: true });
  files.forEach((file) => {
    const filePath = join(dir, file.name);

    if (file.isDirectory()) {
      walkDir(filePath);
    } else if (file.name.endsWith(".js")) {
      fixImports(filePath);
    }
  });
}

function fixImports(filePath) {
  let content = readFileSync(filePath, "utf-8");
  const original = content;

  // Add .js to relative imports that don't have extensions
  content = content.replace(
    /from ["'](\.[^"']+?)(?<!\.js)["']/g,
    'from "$1.js"',
  );

  if (content !== original) {
    writeFileSync(filePath, content, "utf-8");
  }
}

walkDir("./dist");
console.log("Fixed imports in dist files");

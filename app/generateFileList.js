import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join, extname, relative } from "path";
import { imageSize } from "image-size";

const staticDir = "./static/wallpapers";
const outputFile = "./static/files.json";

function getFiles(dir, baseDir = dir) {
  let allFiles = [];

  const items = readdirSync(dir).filter((item) => !item.startsWith("."));

  for (const item of items) {
    const itemPath = join(dir, item);
    const stats = statSync(itemPath);

    if (stats.isDirectory()) {
      // Recursively process subdirectories
      allFiles = allFiles.concat(getFiles(itemPath, baseDir));
    } else {
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      const relativePath = relative(baseDir, itemPath);

      let dimensions = { width: 0, height: 0 };
      if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(extname(item).toLowerCase())) {
        try {
          const buffer = readFileSync(itemPath);
          dimensions = imageSize(buffer);
        } catch (error) {
          console.warn(`Could not read dimensions for ${relativePath}:`, error.message);
        }
      }

      allFiles.push({
        filename: item,
        path: relativePath.replace(/\\/g, "/"), // Normalize path separators
        size: sizeInMB,
        width: dimensions.width || 0,
        height: dimensions.height || 0,
      });
    }
  }

  return allFiles;
}

const files = getFiles(staticDir);
writeFileSync(outputFile, JSON.stringify(files, null, 2));

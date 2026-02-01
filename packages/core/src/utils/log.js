import zlib from "zlib";
import fs from "fs";
import path from "path";
import chalk from "chalk";

export function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

export function logRootDir(rootDir) {
  const results = [];

  walk(rootDir, (file) => {
    const buffer = fs.readFileSync(file);
    const size = buffer.length;
    const gzipSize = getGzipSize(buffer);
    results.push({
      file: path.relative(process.cwd(), file),
      size,
      gzipSize,
    });
  });

  const maxLen = Math.max(...results.map((r) => r.file.length));
  for (const r of results) {
    const name = r.file.padEnd(maxLen);
    const size = formatSize(r.size).padStart(8);
    const gzip = formatSize(r.gzipSize).padStart(8);

    const dir = path.dirname(name);
    const base = path.basename(name);

    console.log(
      `${dir}${[path.sep]}${chalk.green(base)} ${size} │ gzip: ${gzip}`,
    );
  }
}

function getGzipSize(buffer) {
  return zlib.gzipSync(buffer).length;
}
function formatSize(bytes) {
  return (bytes / 1024).toFixed(2) + " kB";
}

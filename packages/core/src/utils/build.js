import fs from "fs";
import path from "path";

export function makeDirectory(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function mkdirHtml(root, distDir, outHtml) {
  const baseHtmlPath = path.resolve(root, outHtml);

  let html = fs.readFileSync(baseHtmlPath, "utf-8");
  const distHtmlPath = path.resolve(distDir, 'index.html')
  fs.writeFileSync(distHtmlPath, html, "utf-8");

}

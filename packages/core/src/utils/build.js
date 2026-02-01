import fs from "fs";
import path from "path";
import { parseHTML } from "linkedom";
import { walk } from "./log.js";


export function mkdirHtml(root, distDir, outHtml) {
  const baseHtmlPath = path.resolve(root, outHtml);

  let newHtml = fs.readFileSync(baseHtmlPath, "utf-8");

  newHtml = rewriteHtml(newHtml);

  const distHtmlPath = path.resolve(distDir, "index.html");
  fs.writeFileSync(distHtmlPath, newHtml, "utf-8");
}

export function mkdirPublic(root, distDir) {
  const basePublicPath = path.resolve(root, "public");
  const distPublicPath = path.resolve(distDir, "public");
  fs.mkdirSync(distPublicPath, { recursive: true });

  walk(basePublicPath, (filePath) => {
    const relativePath = path.relative(basePublicPath, filePath);
    const targetPath = path.resolve(distPublicPath, relativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(filePath, targetPath);
  });
}

function rewriteHtml(html) {
  const { document } = parseHTML(html);

  const scripts = [...document.querySelectorAll("script[src]")];
  const srcList = scripts.map((s) => s.getAttribute("src"));
  scripts.forEach((s) => s.remove());

  // const newScript = document.createElement('script');
  // newScript.type = 'module';
  // newScript.src = '/bundle/index.js';
  // document.head.appendChild(newScript);

  return "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
}

function mkScriptJS() {}

import fs from "fs";

export function isImport(url) {
  return url.includes("?import");
}

export function importBase(filePath, ext) {
  return {
    type: ext.split(".")[1],
    content: fs.readFileSync(filePath),
  };
}

export function importCss(filePath) {
  const css = fs.readFileSync(filePath, "utf-8");
  return {
    type: "js",
    content: `
      const style = document.createElement('style');
      style.textContent = ${JSON.stringify(css)};
      document.head.appendChild(style);
      export default style;
    `.trim(),
  };
}

export function importAsset(pathname) {
  return {
    type: "js",
    content: `export default "${pathname}";`,
  };
}

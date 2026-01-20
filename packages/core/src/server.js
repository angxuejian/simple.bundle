import http from "http";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import {
  importBase,
  importCss,
  isImport,
  importAsset,
} from "./utils/import.js";
import { transformJs } from "./utils/transform-js.js";

export function createServer(options) {
  const root = options.root;
  const onReady = options.onReady;

  const server = http.createServer((req, res) => {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    const filePath =
      pathname === "/"
        ? path.join(root, "index.html")
        : path.join(root, pathname);

    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.end("Not Found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const file = loadFileAsModule(filePath, ext, req.url, pathname);

    // if (ext === ".js") {
    //   console.log(file.content.toString().split("\n"));
    // }

    res.setHeader("Content-Type", mime.contentType(file.type));
    res.end(file.content);
  });

  server.listen(2580, () => {
    onReady?.("http://localhost:2580/");
  });
}

function loadFileAsModule(filePath, ext, url, pathname) {
  if (/\.(js)/i.test(filePath)) {
    const code = fs.readFileSync(filePath);
    return transformJs(code);
  }

  if (isImport(url)) {
    if (ext === ".css") return importCss(filePath);
    else {
      return importAsset(pathname);
    }
  }

  return importBase(filePath, ext);
}

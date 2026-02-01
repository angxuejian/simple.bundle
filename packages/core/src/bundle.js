import { mkdirHtml, mkdirPublic } from "./utils/build.js";
import { logRootDir } from "./utils/log.js";
import path from "path";
import fs from "fs";

export function createBundle(options) {
  const root = options.root;
  const onStart = options.onStart;
  const onDone = options.onDone;
  onStart?.();

  const distDir = path.resolve(root, "dist");
  fs.mkdirSync(distDir, { recursive: true });

  mkdirHtml(root, distDir, "index.html");
  mkdirPublic(root, distDir);

  logRootDir(distDir);
  onDone?.();
}

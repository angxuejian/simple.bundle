import { build } from "./utils/build.js";
import { logRootDir } from "./utils/log.js";
import path from "path";
import fs from "fs";

const baseurl = './'

export function createBundle(options) {
  const root = options.root;
  const onStart = options.onStart;
  const onDone = options.onDone;
  onStart?.();

  const distDir = path.resolve(root, "dist");
  fs.mkdirSync(distDir, { recursive: true });

  build({
    root,
    baseurl,
    distDir,
    entryHtml: "index.html",
    entryPublic: 'public',
  })

  logRootDir(distDir);
  onDone?.();
}

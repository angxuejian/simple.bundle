import { mkdirHtml, makeDirectory } from "./utils/build.js";
import { logRootDir } from './utils/log.js';
import path from 'path'

export function createBundle(options) {
  const root = options.root;
  const onStart = options.onStart;
  const onDone = options.onDone;
  onStart?.();

  const distDir = path.resolve(root, 'dist');
  makeDirectory(distDir)
  mkdirHtml(root, distDir, "index.html");

  logRootDir(distDir)
  onDone?.();
}

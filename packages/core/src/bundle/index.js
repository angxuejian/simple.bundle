import { build } from "./build.js";
import { logRootDir } from "./log.js";
import path from "path";
import fs from "fs";
import { pathToFileURL } from 'url';

export async function loadConfig(file) {
  const filePath = path.resolve(file);
  const config = await import(pathToFileURL(filePath).href);
  return config.default || config;
}

export async function createBundle(options) {
  const root = options.root;
  const onStart = options.onStart;
  const onDone = options.onDone;
  onStart?.();

  const distDir = path.resolve(root, "dist");
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });

  const configPath = path.resolve(root, "simple.bundle.config.js");
  const sbundleConfig = await loadConfig(configPath);
  const baseurl = sbundleConfig.base || "./";

  build({
    root,
    baseurl,
    distDir,
    entryHtml: "index.html",
    entryPublic: "public",
  });

  logRootDir(distDir);
  onDone?.();
}

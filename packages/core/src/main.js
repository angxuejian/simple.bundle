#!/usr/bin/env node
import { performance } from "node:perf_hooks";
import { createServer } from "./server.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import chalk from "chalk";

function run() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const pkg = JSON.parse(
    readFileSync(path.join(__dirname, "../package.json"), "utf-8"),
  );
  const start = performance.now();
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "dev") {
    createServer({
      root: process.cwd(),
      onReady(url) {
        const end = performance.now();
        console.log(
          `${chalk.green(`Simple.bundle v${pkg.version}`)} ${chalk.gray("ready in")} ${Math.round(end - start)}ms`,
        );
        console.log("");
        console.log(`${chalk.green("➜")}  Local: ${chalk.blueBright(url)}`);
        console.log("\n");
      },
    });
  }
}

run();

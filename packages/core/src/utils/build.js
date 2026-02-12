import fs from "fs";
import path from "path";
import { parseHTML } from "linkedom";
import { walk } from "./log.js";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import * as babel from "@babel/core";
import * as t from "@babel/types";
import esbuild from "esbuild";

let __ROOT__ = null;
let __DIST__ = null;
let __ASSETS__ = null;
let __BASEURL__ = null;
let __ENTRY_HTML__ = null;
let __ENTRY_PUBLIC__ = null;

let moduleId = 0;
const visited = new Set();
const moduleGraph = [];
const assetsList = new Set();
const traverse = traverseModule.default;

export function build(options) {
  __ROOT__ = options.root;
  __DIST__ = options.distDir;
  __BASEURL__ = options.baseurl;
  __ENTRY_HTML__ = options.entryHtml;
  __ENTRY_PUBLIC__ = options.entryPublic;

  copyPublic();
  mkdirHtml();
}

function copyPublic() {
  const basePublicPath = path.resolve(__ROOT__, __ENTRY_PUBLIC__);

  walk(basePublicPath, (filePath) => {
    const relativePath = path.relative(basePublicPath, filePath);
    const targetPath = path.resolve(__DIST__, relativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(filePath, targetPath);
  });
}

function mkdirHtml() {
  const baseHtmlPath = path.resolve(__ROOT__, __ENTRY_HTML__);

  const html = fs.readFileSync(baseHtmlPath, "utf-8");
  const newHtml = rewriteHtml(html);

  const distHtmlPath = path.resolve(__DIST__, "index.html");
  fs.writeFileSync(distHtmlPath, newHtml, "utf-8");
}

function rewriteHtml(html) {
  const { document } = parseHTML(html);

  // 重写 baseurl
  const linkIcons = [...document.querySelectorAll("link[rel='icon']")];
  linkIcons.forEach((link) => {
    const href = link.getAttribute("href");
    link.setAttribute(
      "href",
      href.replace(`/${__ENTRY_PUBLIC__}/`, __BASEURL__),
    );
  });

  const scripts = [...document.querySelectorAll("script[src]")];
  const srcList = scripts.map((s) => s.getAttribute("src"));
  scripts.forEach((s) => s.remove());

  if (srcList.length) {
    const baseMainPath = path.join(__ROOT__, srcList[0]);
    __ASSETS__ = path.resolve(__DIST__, "assets");
    fs.mkdirSync(__ASSETS__, { recursive: true });

    parseMainJS(baseMainPath);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }

  if (assetsList.size) {
    let indexCssCode = "";
    assetsList.forEach((assetPath) => {
      if (assetPath.endsWith(".css")) {
        const cssContent = fs.readFileSync(assetPath, "utf-8");
        indexCssCode += cssContent;
      }
    });
    const cssOutput = esbuild.transformSync(indexCssCode, {
      minify: true,
      loader: "css",
    }).code;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = __BASEURL__ + "assets/index.css";
    document.head.appendChild(link);

    fs.writeFileSync(path.resolve(__ASSETS__, "index.css"), cssOutput);
  }

  const output = bundleJS(moduleGraph);
  if (output) {
    const entryJS = document.createElement("script");
    // entryJS.type = "module";
    entryJS.src = __BASEURL__ + "assets/index.js";
    document.head.appendChild(entryJS);

    fs.writeFileSync(path.resolve(__ASSETS__, "index.js"), output);
  }

  return "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
}

function parseMainJS(filePath) {
  if (visited.has(filePath)) return;
  visited.add(filePath);

  const code = fs.readFileSync(filePath, "utf-8");
  const ast = parse(code, { sourceType: "module" });
  const deps = {};

  traverse(ast, {
    ImportDeclaration(path) {
      const importPath = path.node.source.value;
      const depPath = resolveImportPath(importPath, filePath);

      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`transforming(${moduleId}) ${importPath}`);

      if (depPath.endsWith(".js") || depPath.endsWith(".mjs")) {
        deps[importPath] = depPath;
      } else {
        assetsList.add(depPath);

        if (path.node.specifiers.length === 0) {
          path.remove();
          return;
        }

        const newAssetPath = copyAssets(depPath);
        path.replaceWith(
          t.variableDeclaration("const", [
            t.variableDeclarator(
              path.node.specifiers[0].local,
              t.stringLiteral(newAssetPath),
            ),
          ]),
        );
      }
    },
  });

  const { code: transformedCode } = babel.transformFromAstSync(ast, code, {
    presets: ["@babel/preset-env"],
  });

  const moduleInfo = {
    id: moduleId++,
    file: filePath,
    deps,
    code: transformedCode,
  };
  moduleGraph.push(moduleInfo);

  Object.values(deps).forEach(parseMainJS);
}

function resolveImportPath(importPath, parentPath) {
  if (importPath.startsWith(".") || importPath.startsWith("/")) {
    if (importPath.startsWith("/")) {
      importPath = importPath.slice(1);
    }

    if (
      importPath.startsWith(`./${__ENTRY_PUBLIC__}/`) ||
      importPath.startsWith(`${__ENTRY_PUBLIC__}/`)
    ) {
      return path.resolve(__ROOT__, importPath);
    } else {
      return path.resolve(path.dirname(parentPath), importPath);
    }
  }

  // node_modules
  const pkgPath = path.resolve(
    __ROOT__,
    "node_modules",
    importPath,
    "package.json",
  );
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  const main = pkg.module;

  return path.resolve(__ROOT__, "node_modules", importPath, main);
}

function copyAssets(assetPath) {
  const basename = path.basename(assetPath);
  const relativePath = path.relative(__ROOT__, assetPath);
  if (relativePath.startsWith(__ENTRY_PUBLIC__)) {
    const normalized = relativePath.replace(/\\/g, "/"); // 统一分隔符
    return __BASEURL__ + path.posix.relative("public", normalized);
  }

  const targetPath = path.resolve(__ASSETS__, basename);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(assetPath, targetPath);

  return __BASEURL__ + "assets/" + basename;
}

function bundleJS(mGraph) {
  const fileToId = {};
  mGraph.forEach((m) => {
    fileToId[m.file] = m.id;
  });

  const wrapCode = (code) => {
    const result = esbuild.transformSync(code, {
      loader: "js",
      minify: true,
    });

    return `
      function (require, module, exports) {
        ${result.code}
      }
    `;
  };

  const createMapping = (deps) => {
    const mapping = {};
    for (const key in deps) {
      mapping[key] = fileToId[deps[key]];
    }
    return mapping;
  };

  const createModules = (graph) => {
    let modules = "";

    graph.forEach((mod) => {
      modules += `
      ${mod.id}: [
        ${wrapCode(mod.code)},
        ${JSON.stringify(createMapping(mod.deps))}
      ],
    `;
    });

    return `{${modules}}`;
  };

  const modules = createModules(moduleGraph);

  return `
    (function(__simple_modules__) {

      const __simple_catch__ = {};

      function __simple_require__(id) {
        if (__simple_catch__[id]) {
          return __simple_catch__[id].exports;
        }

        const [fn, mapping] = __simple_modules__[id];

        function __simple_mapping__(name) {
          return __simple_require__(mapping[name]);
        }

        const module = { exports: {} };
        __simple_catch__[id] = module;

        fn(__simple_mapping__, module, module.exports);
        return module.exports;
      }

      __simple_require__(0);
    })(${modules});
  `;
}

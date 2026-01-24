import path from "path";
import fs from "fs";
import { $ASSET } from './type.js'


export function transformJs(code, root) {
  return {
    type: "js",
    content: rewriteImport(code, root),
  };
}

//
// import './style.css' => import './style.css?import'
// import 'canvas-confetti' => /node_modules/canvas-confetti/dist/confetti.module.mjs
// => 转为 js
export function rewriteImport(code, root) {
  const lines = code.toString().split("\n");
  const pathReg = getImportPath();

  const newCode = lines
    .map((line) => {
      const path = [...line.matchAll(pathReg)].map((_) => _[1])[0];

      if (path) {
        if (getImportPathModules(path)) {
          const newPath = transformModulesPath(root, path);
          line = line.replace(path, newPath);
        } else if ($ASSET.test(path)) {
          const newPath = path + "?import";
          line = line.replace(path, newPath);
        }
      }
      return line;
    })
    .join("\n");
  return `${newCode}`;
}

function transformModulesPath(root, packageName) {
  const pkgRoot = path.join(root, "node_modules", packageName);
  const pkg = JSON.parse(
    fs.readFileSync(path.join(pkgRoot, "package.json"), "utf-8"),
  );

  if (!pkg) {
    throw Error(`${packageName} not support`);
  }

  const main = pkg.module;
  if (!main) {
    throw Error(`${packageName} not support`);
  }
  const entryPath = `/node_modules/${packageName}/${main}`;
  return entryPath;
}


function getImportPathModules(path) {
  return (
    !path.startsWith(".") && !path.startsWith("/") && !path.startsWith("http")
  );
}
function getImportPath() {
  /**
   * import         -> 匹配 import 关键字
   * \s+            -> 至少一个空白（空格 / 换行 / tab）
   * (?: ... )?     -> 可选的「from 前半段」
   *   - (?: )      -> 分组但不捕获
   *   - ?:         -> 这一整段 可以没有
   *
   * [\w{}\s,*]+    -> import 的“变量部分”
   *   - \w  -> 字母、数字、下划线
   *   - {}  -> 解构 import { a, b }
   *   - \s  -> 空格
   *   - ,*  -> 逗号、星号
   *   - +   -> 至少一个
   *
   * \s+from\s+
   *   - form ->  匹配 form 关键字
   *   - \s   -> 前后空格
   *
   * ["']([^"']+)["']  -> 核心：路径
   *    - ["']     -> 开头：单引号、双引号
   *    - ([^"']+) -> 不是 单引号 或 双引号 的任意字符、至少一个
   *    - ["']     -> 结尾：单引号、双引号
   */
  return /import\s+(?:[\w{}\s,*]+\s+from\s+)?["']([^"']+)["']/g;
}

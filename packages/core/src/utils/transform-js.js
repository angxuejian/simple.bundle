export function transformJs(code) {
  return {
    type: "js",
    content: rewriteImport(code),
  };
}

//
// import './style.css' => import './style.css?import'
// => 转为 js
export function rewriteImport(code) {
  return `${code}`;
}

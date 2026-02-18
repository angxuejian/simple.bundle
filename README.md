# Simple.bundle

simple.bundle is a learning-focused JavaScript bundler.

## Feature Progress

| 功能点            | 状态 | 说明                                    |
| ----------------- | ---- | --------------------------------------- |
| dev               | done | `local server`                          |
| HTTP Server       | done | `未扩展文件缓存`                        |
| Static HTML       | done |                                         |
| ESM JS            | done | 只支持：`.js`、`.mjs`                   |
| ESN CSS           | done |                                         |
| ESM png/jpg       | done |                                         |
| ESM modules       | done | 只支持：`esm（pkg.module）`             |
| Transform JS      | done | 只支持：`.css`、`.ico`                  |
|                   |      | -                                       |
| build             | done | `JS`                                    |
| rewriteHtml       | done |                                         |
| parser            | done | `JS` → `AST`                            |
| traverse          | done | 找 `import` / `export`                  |
| resolver          | done | 路径 → 真实文件 (`JS` / `node_modules`) |
| moduleGraph       | done |                                         |
| runtime / bundler | done |                                         |
| asset / public    | done | copy 静态资源                           |
| chunk             | todo |                                         |

## Command

| command | 说明           |
| ------- | -------------- |
| dev     | `local server` |
| build   | `bundle js`     |

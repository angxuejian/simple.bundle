# Dev

```text
simple-bundle dev

    ↓

http.createServer

    ↓

const { content, contentType } = loadFileAsModule (.html / .mjs / asset)

    │                                                          │ 
    │                                                          │ 
    │                                                          │ 
    │                                                          │ 
    │                                                          │ 
    │                                                          │ 
    │                                                          │ 
    │                                                          └─────────────┐      
    │                                                                        ├─ → .html -> 直接返回使用
    │                                                                        │
    │                                                                        ├─ → .css/.png -> 需转换为 js 导入使用
    │                                                                        │
    │                                                                        ├─ → node_modules -> 需引入正确路径地址/转换使用 -> import "vue"; -> import "/node_modules/vue/xx.mjs"
    │                                                                        │
    │                                                                        └─ → .js/.mjs -> 直接返回使用
    ↓

res.setHeader(contentType) / res.end(content)

    ↓

浏览器执行

    ↓

请求 index.html ->  http.createServer (Node 返回 HTML) -> (再次从步骤二执行)；

or

请求 index.mjs -> http.createServer (Node 返回 JS) -> (再次从步骤二执行)；
```
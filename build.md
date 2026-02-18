# Dev

```text
simple-bundle build

    ↓

read root project path / setup "dist", "public", "baseurl"

    ↓

copy public asset

    ↓

find entry js of the .html file / rewrite .html

    ↓

parse entry js / 组成 modulesGraph

    │  │ 
    │  │ 
    │  │ 
    │  │ 
    │  │ 
    │  │ 
    │  │ 
    │  └─────────────────────────────────────────────────────────────────────┐      
    │                                                                        ├─ → .css -> 存入 assets list 中 -> bundleCss
    │                                                                        │
    │                                                                        ├─ → .png -> replaceWith(import logo from './xx/logo.png') -> const logo = './xx/logo.png'
    │                                                                        │
    │                                                                        ├─ → node_modules -> 需引入正确路径地址/转换使用 -> import "vue"; -> import "/node_modules/vue/xx.mjs" -> 查询是否有依赖地址 -> 循环 -> fn(require, module, exports)
    │                                                                        │
    │                                                                        └─ → .js/.mjs -> 查询是否有依赖地址 -> 循环 -> fn(require, module, exports)                  
    ↓  

js (bundleJS / runtimeJS) 、css(bundleCss)、png(copy png)

    ↓

rewrite index.html
```
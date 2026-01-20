import "./style.css?import";
import logo from "/public/favicon.ico?import";
import { helloFn } from "./hello.js";

document.querySelector("#app").innerHTML = `
  <div>
    <a href="https://github.com/angxuejian/simple.bundle" target="_blank">
     <img src="${logo}" class="logo" alt="Vite logo" />
    </a>
    <h1>Hello Simple Bundle Playground!</h1>
</div>
`;

helloFn()
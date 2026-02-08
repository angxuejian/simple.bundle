import "./style.css";
import logo from "/public/favicon.ico";
import { setupConfetti } from "./confetti.js";
import { setupCounter } from "./counter.js";

window.onload = function () {
  document.querySelector("#app").innerHTML = `
  <div>
    <a href="https://github.com/angxuejian/simple.bundle" target="_blank">
      <img src="${logo}" class="logo" alt="Simple Bundle logo" />
    </a>
    <h1 id="confetti">Hello Simple Bundle Playground!</h1>

    <div class="card">
      <button id="counter" type="button"></button>
    </div>
</div>
`;

  setupCounter(document.querySelector("#counter"));
  setupConfetti(document.querySelector("#confetti"));
};

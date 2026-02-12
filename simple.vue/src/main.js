import { createApp } from "./core/create-app.js";
import { appComponent } from "./app.js";
import { createRouter } from "./router/index.js";
import { homeComponent } from "./views/home.js";
import { aboutComponent } from "./views/about.js";
import { testComponent } from "./views/test.js";

window.onload = () => {
  const app = createApp({ component: () => appComponent() });

  const router = createRouter([
    { path: "/", component: () => homeComponent() },
    { path: "/about", component: () => aboutComponent() },
    { path: "/test", component: () => testComponent() },
  ]);

  app.$use(router).$mount("#app");
};

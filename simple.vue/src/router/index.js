import { baseVar } from "../core/global.js";

export function createRouter(router) {
  let $routerView;
  let $replaceFn;

  const render = (e) => {
    const path = location.hash.slice(1) || "/";

    const loadRoute = matchRoute(path);
    if (!loadRoute) {
      throw new Error("Router: path not find");
    }

    const { $key } = $replaceFn({
      container: $routerView,
      component: loadRoute,
      oldInstanceKey: baseVar.oldRouterKey,
    });

    baseVar.oldRouterKey = $key;
  };

  const matchRoute = (path) => {
    const loadRoute = router.filter((item) => {
      const r = item.path;
      const p = path;
      return r === p;
    });
    return loadRoute[0];
  };

  return {
    $init(routerView, rpHandler) {
      $routerView = routerView;
      $replaceFn = rpHandler;
      window.addEventListener("hashchange", render);
      render();
    },
  };
}

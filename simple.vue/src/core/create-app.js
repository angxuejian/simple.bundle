import { renderComponent } from "./component-instance.js";
import { baseVar } from "./global.js";

export function createApp(component) {
  let $routerInstance;

  return {
    $mount(key) {
      const container = document.querySelector(key);
      const { vnode: appVNode, $key } = renderComponent({
        container,
        component,
        oldInstanceKey: baseVar.oldComponentKey,
      });

      baseVar.oldComponentKey = $key;

      if ($routerInstance) {
        const routerView = appVNode.el.querySelector(".router-view");
        $routerInstance.$init(routerView, renderComponent);
      }
      return this;
    },
    $use(routerInstance) {
      $routerInstance = routerInstance;
      return this;
    },
  };
}

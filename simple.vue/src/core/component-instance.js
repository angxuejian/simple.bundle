import { global, baseVar } from "./global.js";
import { compilerSFC } from "./sfc.js";
import { defineReaction, defineReactionSet } from "./reaction.js";
import { replaceHandler } from "./virtual-dom.js";
import { Watcher } from "./watcher.js";

function genUid() {
  return baseVar.uid++;
}

function createComponentInstance(component) {
  let instance = {
    data: null,
    render: null,
    hooks: {},
  };

  const hookNames = [
    "beforeCreate",
    "created",
    "beforeMount",
    "mounted",
    "beforeUpdate",
    "updated",
    "beforeUnmount",
    "unmounted",
  ];

  hookNames.forEach((name) => {
    if (typeof component[name] == "function") {
      instance.hooks[name] = component[name];
    }
  });

  callHook(instance, "beforeCreate");

  const $key = `$instance${genUid()}`;

  if (component.data) {
    instance.data = defineReaction(component.data(), $key);
    instance.data["$set"] = (target, key, value) =>
      defineReactionSet(target, key, value, $key);
  }

  if (!instance.data) {
    instance.data = {};
  }
  instance.data[`$key`] = $key;

  if (component.methods) {
    Object.keys(component.methods).forEach((key) => {
      instance.data[key] = component.methods[key].bind(instance.data);
    });
  }

  if (component.computed) {
    for (const key in component.computed) {
      const fn = component.computed[key].bind(instance.data);

      const watch = new Watcher(fn, null, { lazy: true });

      Object.defineProperty(instance.data, key, {
        get() {
          if (watch.dirty) {
            watch.evaluate();
          }

          return watch.value;
        },
      });
    }
  }

  if (component.watch) {
    for (const key in component.watch) {
      const item = component.watch[key];
      let fn = item;
      let options = {};
      if (item.handler) {
        fn = item.handler;
        const { handler, ...rest } = item;
        options = rest;
      }

      new Watcher(() => instance.data[key], fn, options);
    }
  }

  callHook(instance, "created");

  instance.render = component.render.bind(instance.data);
  // console.log(instance.data)
  return instance;
}

export function callHook(instance, name) {
  if (instance.hooks[name]) {
    instance.hooks[name].call(instance.data);
  }
}

export function renderComponent({ component, container, oldInstanceKey }) {
  if (global[oldInstanceKey])

  callHook(global[oldInstanceKey].$instance, "beforeUnmount");
  const c = compilerSFC(component.component());

  const componentInstance = createComponentInstance(c);
  callHook(componentInstance, "beforeMount");

  const oldItemVNode = global[oldInstanceKey]?.$oldVNode || null;
  const newItemVNode = componentInstance.render();
  replaceHandler(oldItemVNode, newItemVNode, container);

  if (global[oldInstanceKey]) {
    callHook(global[oldInstanceKey].$instance, "unmounted");
    global[oldInstanceKey] = null;
    delete global[oldInstanceKey];
  }

  callHook(componentInstance, "mounted");

  global[componentInstance.data.$key] = {
    $instance: componentInstance,
    $container: container,
    $oldVNode: newItemVNode,
  };

  return { vnode: newItemVNode, $key: componentInstance.data.$key };
}

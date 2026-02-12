import { Dep } from "./dep.js";
import { updateHandler } from "./update.js";

// __KEY = $key = global[instanceKey] => 通知要更新的实例
export function defineReaction(obj, $key) {
  if (typeof obj !== "object" || obj === null) return obj;

  const __KEY = $key;

  if (Array.isArray(obj)) {
    definePropertyArr(obj, __KEY);

    obj.forEach((item) => defineReaction(item, __KEY));
  } else {
    Object.keys(obj).forEach((key) => {
      defineReaction(obj[key], __KEY);
      definePropertyObj(obj, key, __KEY);
    });
  }
  return obj;
}
function definePropertyObj(obj, key, __KEY) {
  const _key = `_${key}`;
  const dep = new Dep();

  Object.defineProperty(obj, `_${key}`, {
    value: obj[key],
    writable: true,
    enumerable: false,
    configurable: true,
  });

  Object.defineProperty(obj, key, {
    get() {
      // console.log(`读取: ${_key}`);

      if (Dep.target) {
        // console.log(key, '绑定watch')
        dep.depend();
      }

      return this[_key];
    },
    set(newVal) {
      if (newVal === this[_key]) return;

      // console.log(`赋值: ${_key}`);

      this[_key] = newVal;

      defineReaction(newVal, __KEY);
      // console.log(key, 'watch 通知')
      dep.notify();
      defineUpdate(__KEY);
    },
  });
}
function definePropertyArr(arr, __KEY) {
  const arrayPrototype = Array.prototype;
  const newArrayPrototype = Object.create(arrayPrototype);
  const resetMethods = [
    "push",
    "pop",
    "shift",
    "unshift",
    "splice",
    "sort",
    "reverse",
  ];

  resetMethods.forEach((method) => {
    newArrayPrototype[method] = function (...args) {
      const result = arrayPrototype[method].apply(this, args);

      let inserted = null;

      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
          break;
        case "splice":
          // splice(start, deleteCount, ...items)
          inserted = args.slice(2);
          break;
      }

      // 如果有新增数据，就再次循环绑定响应式
      if (inserted) {
        inserted.forEach((item) => defineReaction(item, __KEY));
      }
      defineUpdate(__KEY);
      return result;
    };
  });

  arr.__proto__ = newArrayPrototype;
}
export function defineReactionSet(target, key, value, $key) {
  // 数组
  if (Array.isArray(target) && typeof key === "number") {
    target.splice(key, 1, value);
    return;
  }

  // 已有属性 → 直接走 setter
  if (key in target) {
    target[key] = value;
    return;
  }

  const __KEY = $key;

  // 新增属性
  definePropertyObj(target, key, __KEY);
  defineUpdate(__KEY);
}
function defineUpdate(key) {
  if (typeof updateHandler === "function") {
    updateHandler(key);
  }
}

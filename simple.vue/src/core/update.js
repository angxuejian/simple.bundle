
import { global } from "./global.js";
import { callHook } from "./component-instance.js";
import { replaceHandler, addVNodeProps, mountHandler, unmountHandler, removeVNodeProps  } from "./virtual-dom.js";

export function updateHandler($key) {
  if (!global[$key]) return;
  const { $instance, $oldVNode, $container } = global[$key];

  callHook($instance, "beforeUpdate");

  const component = $instance.render();
  patch($oldVNode, component, $container);

  global[$key].$oldVNode = component;
  callHook($instance, "updated");
}

function patchElement(oldVNode, newVNode) {
  newVNode.el = oldVNode.el;
  patchProps(oldVNode, newVNode);
  patchChildren(oldVNode, newVNode);
}

function patch(oldVNode, newVNode, container) {
  if (!oldVNode) mountHandler(newVNode, container);
  else if (!newVNode) unmountHandler(oldVNode);
  else if (oldVNode.type !== newVNode.type)
    replaceHandler(oldVNode, newVNode, container);
  else {
    patchElement(oldVNode, newVNode);
  }
}

function patchProps(oldVNode, newVNode) {
  const el = oldVNode.el;
  const oldProps = oldVNode.props || {};
  const newProps = newVNode.props || {};

  // 1. 删除旧的
  for (const key in oldProps) {
    if (!(key in newProps)) {
      removeVNodeProps(el, key);
    }
  }

  // 2. 新增 / 更新
  for (const key in newProps) {
    const prev = oldProps[key];
    const next = newProps[key];
    if (prev !== next) {
      addVNodeProps(el, key, next);
    }
  }
}

function patchChildren(oldVNode, newVNode) {
  const el = oldVNode.el;
  const oldChildren = oldVNode.children;
  const newChildren = newVNode.children;

  // 新旧完全一致
  if (oldChildren === newChildren) return;

  // 新的是文本
  if (typeof newChildren === "string") {
    if (Array.isArray(oldChildren)) {
      oldChildren.forEach((child) => unmountHandler(child));
    }
    el.textContent = newChildren;
    return;
  }

  // 新的是数组
  if (Array.isArray(newChildren)) {
    // 旧的是文本
    if (typeof oldChildren === "string") {
      el.textContent = "";
      newChildren.forEach((child) => mountHandler(child, el));
      return;
    }

    // 新旧都是数组（核心 diff）
    patchKeylessChildren(oldChildren, newChildren, el);
    return;
  }

  // newChildren 为 null / undefined
  if (Array.isArray(oldChildren)) {
    oldChildren.forEach((child) => unmountHandler(child));
  }
  el.textContent = "";
}

function patchKeylessChildren(oldChildren, newChildren, container) {
  const commonLength = Math.min(oldChildren.length, newChildren.length);

  // 1. patch 公共部分
  for (let i = 0; i < commonLength; i++) {
    patch(oldChildren[i], newChildren[i], container);
  }

  // 2. 新的多，挂载
  if (newChildren.length > oldChildren.length) {
    for (let i = commonLength; i < newChildren.length; i++) {
      mountHandler(newChildren[i], container);
    }
  }

  // 3. 旧的多，卸载
  if (oldChildren.length > newChildren.length) {
    for (let i = commonLength; i < oldChildren.length; i++) {
      unmountHandler(oldChildren[i]);
    }
  }
}

// // 增删改
// function patch(oldVNode, newVNode, container) {
//   newVNode.el = oldVNode.el
//   if (oldVNode.type !== newVNode.type) {
//     mount(newVNode, container, { replace: true });
//   } else {

//     // 都是数组
//     if (Array.isArray(oldVNode.children) && Array.isArray(newVNode.children)) {

//       // old 比 new 多，删除多余的dom; (遍历dom 要从后往前删除)
//       if (oldVNode.children.length > newVNode.children.length) {
//         const startIndex = oldVNode.children.length - newVNode.children.length
//         for (let i = startIndex; i < newVNode.el.children.length; i++) {
//           oldVNode.el.removeChild(oldVNode.el.children[i])
//         }
//       }
//       newVNode.children.forEach((_, index) => {
//         if (oldVNode.children[index]) {
//           patch(oldVNode.children[index], newVNode.children[index], oldVNode.el)
//         } else {
//           // new 比 old 多，新增dom
//           mount(newVNode.children[index], oldVNode.el)
//         }
//       })

//     } else {
//       // 只有这里更新 props
//       patchProps(oldVNode, newVNode)

//       // 更新children(array -> string, string -> array, string -> string)
//       patchChildren(oldVNode, newVNode)
//    }
//   }
// }

// function patchProps(oldVNode, newVNode) {
//   if (oldVNode.props === null && newVNode.props === null) return;

//   if (oldVNode.props && newVNode.props === null) {
//     for (const key in oldVNode.props) {
//       removeVNodeProps(oldVNode.el, key)
//     }
//   }
//   else if (oldVNode.props === null && newVNode.props) {
//     for (const key in newVNode.props) {
//       const value = newVNode.props[key];
//       addVNodeProps(oldVNode.el, key, value)
//     }
//   }
//   else {

//     for (const key in oldVNode.props) {
//       if (!newVNode.props[key]) removeVNodeProps(oldVNode.el, key, null)
//     }

//     for (const key in newVNode.props) {
//       const el = oldVNode.el;
//       const value = newVNode.props[key]
//       if (!oldVNode[key] || oldVNode.props[key] !== newVNode.props[key]) addVNodeProps(el, key, value);
//     }
//   }

// }

// function patchChildren(oldVNode, newVNode) {
//   if (oldVNode.children === newVNode.children) return;

//   // old为数组，new不为
//   if (Array.isArray(oldVNode.children)) {
//     for (let i = 0; i < oldVNode.el.children.length; i++) {
//       oldVNode.el.removeChild(oldVNode.el.children[i])
//     }
//     oldVNode.el.textContent = `${newVNode.children}`
//   }

//   // new为数组，old不为
//   else if (Array.isArray(newVNode.children)) {
//     if (oldVNode.el.textContent) {
//       oldVNode.el.textContent = ''
//     }
//     for (let i = 0; i < newVNode.children.length; i++) {
//       mount(newVNode.children[i], oldVNode.el)
//     }
//   }

//   // 都是文本，直接替换
//   else {
//     oldVNode.el.textContent = `${newVNode.children}`
//   }

// }

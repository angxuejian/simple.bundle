export function h(type, props, children) {
  return { type, props, children };
}

function mount(vnode, container, anchor = null) {
  if (!vnode) return;

  const el = document.createElement(vnode.type);

  if (vnode.props) {
    for (const key in vnode.props) {
      const value = vnode.props[key];
      addVNodeProps(el, key, value);
    }
  }

  const types = ["string", "boolean", "number"];
  if (types.includes(typeof vnode.children)) {
    el.textContent = `${vnode.children}`;
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach((child) => mount(child, el));
  }

  vnode.el = el;
  container.insertBefore(el, anchor);
}

function mountEvent(el, key, callbackFn) {
  const invokers = el.__$svei || (el.__$svei = {});
  const eventName = key.slice(2).toLowerCase();

  let invoker = invokers[key];

  if (callbackFn) {
    if (invoker) {
      invoker.callback = callbackFn;
    } else {
      invoker = el.__$svei[key] = (e) => {
        invoker.callback(e);
      };
      invoker.callback = callbackFn;
      el.addEventListener(eventName, invoker);
    }
  } else if (invoker) {
    el.removeEventListener(eventName, invoker);
    invokers[key] = undefined;
  }
}

export function addVNodeProps(el, key, value) {
  if (key === "value") {
    if (el.value !== value) {
      el.value = value;
    }
  } else if (key === "checked") {
    el.checked = !!value;
  } else if (key.startsWith("on") && typeof value === "function") {
    mountEventHandler(el, key, value);
  } else {
    el.setAttribute(key, value);
  }
}

export function removeVNodeProps(el, key) {
  if (key === "value") {
    el.value = "";
  } else if (key === "checked") {
    el.checked = false;
  } else if (key.startsWith("on")) {
    mountEventHandler(el, key, null);
  } else {
    el.removeAttribute(key);
  }
}

export function mountHandler(vnode, container, anchor) {
  mount(vnode, container, anchor);
}

export function unmountHandler(vnode) {
  const el = vnode.el;
  if (!el) return;
  const parent = el.parentNode;
  if (parent) parent.removeChild(el);
}

export function replaceHandler(oldVNode, newVNode, container) {
  let anchor = null;
  if (oldVNode) {
    anchor = oldVNode.el.nextSibling;
    unmountHandler(oldVNode);
  }
  mountHandler(newVNode, container, anchor);
}

function mountEventHandler(el, key, callbackFn) {
  mountEvent(el, key, callbackFn);
}

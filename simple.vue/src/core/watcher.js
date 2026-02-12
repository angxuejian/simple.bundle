import { Dep } from "./dep.js";

export class Watcher {
  constructor(getter, callback, options = {}) {
    this.getter = getter;
    this.callback = callback;
    this.lazy = options.lazy;
    this.dirty = this.lazy;
    this.value = this.lazy ? undefined : this.get();

    if (!this.lazy && options.immediate) {
      this.update();
    }
  }

  get() {
    Dep.target = this;
    const value = this.getter();
    Dep.target = null;

    return value;
  }

  addDep(dep) {
    if (!dep.subs.has(this)) {
      dep.subs.add(this);
    }
  }

  cleanupDeps() {}

  update() {
    if (this.lazy) {
        this.dirty = true
    } else {
      const oldVal = this.value;
      this.value = this.get();

      this?.callback(this.value, oldVal);
    }
  }

  evaluate() {
    this.value = this.get();
    this.dirty = false;
  }
}

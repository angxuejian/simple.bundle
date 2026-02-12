function baseHandler() {
  return {
    get(target, key, receiver) {
      console.log(target, key, receiver, "get");
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      console.log(target, key, receiver, "set");
      return Reflect.set(target, key, value, receiver);
    },
    deleteProperty(target, key) {
      console.log(target, key, "deleteProperty");
      return Reflect.deleteProperty(target, key);
    },
    has(target, key) {
      console.log(target, key, "has");
      return Reflect.has(target, key);
    },
    ownKeys(target) {
      console.log(target, "ownKeys");
      return Reflect.ownKeys(target);
    },
  };
}

function proxyReactive(obj) {
  return new Proxy(obj, baseHandler());
}

function proxyRef(value) {
  const obj = {
    __isRef: true,
    value,
  };
  return new Proxy(obj, baseHandler());
}

const arr111 = proxyReactive([0]);
const age111 = proxyRef(0);
const obj111 = proxyReactive({ name: 123 });

console.log('Proxy')
console.log('==========================')
"name" in obj111;
arr111[0];
age111.value = 20;
for (const key in obj111) {
  // console.log(obj[key])
}
console.log('==========================')
console.log('end')

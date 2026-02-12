import { h } from "./core/virtual-dom.js";

export function appComponent() {
  // 理论上会触发 unmounted、beforeUnmount 生命周期；
  return {
    data() {
      return {
        links: [
          { path: "#/", label: "home" },
          { path: "#/about", label: "about" },
          { path: "#/test", label: "test" },
        ],
      };
    },
    methods: {},
    render() {
      return h("main", null, [
        h("div", null, [
          h(
            "div",
            null,
            this.links.reduce((arr, item, index) => {
              arr.push(h("a", { href: item.path }, item.label));
              if (index !== this.links.length - 1) {
                arr.push(h("span", { style: "margin: 0 5px" }));
              }
              return arr;
            }, [])
          ),
        ]),
        h("div", { class: "router-view" }),
      ]);
    },
  };
}

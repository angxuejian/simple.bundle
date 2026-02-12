import { h } from "../core/virtual-dom.js";


export function homeComponent() {
  return {
    data() {
      return {
        isShow: false,
        inputVal: "v-model: value",
        list: [1, 2, 3],
      };
    },
    render() {
      return h("div", null, [
        h("div", null, [
          h(
            "button",
            {
              onclick: () => {
                this.isShow = !this.isShow;
              },
            },
            this.isShow ? "hide" : "show"
          ),
          h(
            "button",
            {
              onclick: () => {
                this.list.push(this.list.length + 1);
              },
            },
            "push"
          ),
          h(
            "button",
            {
              onclick: () => {
                this.list.pop();
              },
            },
            "pop"
          ),
          h(
            "button",
            {
              onclick: () => {
                this.inputVal += 1;
              },
            },
            "inputVal += 1"
          ),
        ]),
        h("div", null, [this.isShow ? h("p", null, "v-if: show") : ""]),
        h("ul", null, [
          ...this.list.map((_, index) => h("li", null, `v-for: ${_}`)),
        ]),
        h("p", null, `${this.inputVal}`),
        h("input", {
          value: this.inputVal,
          oninput: (event) => {
            this.inputVal = event.target.value;
          },
        }),
      ]);
    },
  };
}

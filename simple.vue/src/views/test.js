import { h } from "../core/virtual-dom.js";

export function testComponent() {
  return {
    data() {
      return {
        isSwitch: false,
        list: [{ name: "yuhua" }],
        isShow: true,
        isDiv: false,
        count: 0,
      };
    },
    computed: {
      showname() {
        return this.isShow ? 'yuhua' : 'xuejyang'
      }
    },
    watch: {
      count(newV) {
        console.log("watch: count ->", newV);
      },
    },
    methods: {
      countHandler() {
        this.count++;
      },
    },
    beforeCreate() {
      console.log("beforeCreate");
    },
    created() {
      console.log("created", this);
    },
    beforeMount() {
      console.log("beforeMount");
    },
    mounted() {
      console.log("mounted");
    },
    beforeUpdate() {
      console.log("beforeUpdate");
    },
    updated() {
      console.log("updated");
    },
    beforeUnmount() {
      console.log("beforeUnmount");
    },
    unmounted() {
      console.log("unmounted");
    },
    render() {
      return h("div", null, [
        h("div", null, [
          h(
            "button",
            {
              onclick: () => {
                this.isSwitch = !this.isSwitch;
              },
            },
            "switch string/array"
          ),
          h(
            "button",
            {
              onclick: () => {
                this.list.push({ name: `yuhua${this.list.length}` });
              },
            },
            "push list"
          ),
          h(
            "button",
            {
              onclick: () => {
                this.list.splice(this.list.length - 1, 1);
              },
            },
            "pop list"
          ),
          h(
            "button",
            {
              onclick: () => {
                this.list[0].name = "xuej";
              },
            },
            "update list[0].name"
          ),
          h(
            "button",
            {
              onclick: () => {
                this.isShow = !this.isShow;
              },
            },
            "switch show"
          ),
          h(
            "button",
            {
              onclick: () => {
                console.log("click once");
                this.isDiv = !this.isDiv;
              },
            },
            "switch isDiv"
          ),
          h("button", { onclick: this.countHandler }, "count add"),
        ]),
        h(
          "p",
          null,
          this.isSwitch
            ? [h("a", { href: "https://www.baidu.com" }, "link: baidu")]
            : "str: baidu"
        ),
        h("ul", null, [
          ...this.list.map((_, index) => h("li", null, `v-for: ${_.name}`)),
        ]),
        h(
          "p",
          {
            "data-test": this.isShow ? "1" : "2",
            ...(this.isShow ? { class: "p" } : {}),
          },
          "show: " + this.isShow
        ),
        this.isDiv ? h("div", null, "div") : h("p", null, "p"),

        h("p", null, `watch: count -> ${this.count}`),
        h('p', null, [
          h('span', null, `computed: name -> ${this.showname}`),
          h('span', { style: "margin: 0 20px;" }, '/'),
          h('span', { style: 'color: #999' }, "click【switch show】button to see the changes")
        ]),
        h("p", null, "Tips: Diff Test Checklist"),
      ]);
    },
  };
}

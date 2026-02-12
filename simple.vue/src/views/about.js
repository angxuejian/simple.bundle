
import { h } from "../core/virtual-dom.js";

export function aboutComponent() {
  return {
    render() {
      return h('p', null, "about simple vue")
    },
  };
}

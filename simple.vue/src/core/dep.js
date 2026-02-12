

export class Dep {
    constructor() {
        this.subs = new Set()
    }

    depend() {
        if (Dep.target) {
            Dep.target.addDep(this)
        }
    }
    notify() {
        this.subs.forEach(w => w?.update())
    }
}
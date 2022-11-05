const fs = require('fs');

module.exports = class dbClass {
    constructor(filename, options = {}) {
        this.filename = filename ? filename : `database.json`

        this.manual = options.manual ? options.manual : false //Manual Saving and Loading
        this.data = null
        this.saved = null

        this.load()
    }

    //Commands:
    //set, get, has, push

    //const fs = require('fs')
    //var data = {}
    //var fileName = "database.json"

    async save() {
        fs.writeFileSync(this.filename, JSON.stringify(this.data))
        this.saved = true
    }

    async load() {
        //this.data = JSON.parse(fs.readFileSync(this.filename, "utf8"))
        var exist = fs.existsSync(this.filename)
        if (exist) { 
            this.data = JSON.parse(fs.readFileSync(this.filename, "utf8"))
        } else {
            fs.writeFileSync(this.filename, JSON.stringify({}))
            this.data = {}
        }
    }

    async set(path, value) {
        this.saved = false
        if (!this.manual) await this.load()
        var path = path.split(".")
        var current = this.data
        //Save the value to the correct path
        for (var i = 0; i < path.length; i++) {
            if (i == path.length - 1) {
                current[path[i]] = value
            } else {
                if (!current[path[i]]) {
                    current[path[i]] = {}
                }
                current = current[path[i]]
            }
        }
        //Save current to data
        //data = current
        if (!this.manual) await this.save()
    }

    async get(path) {
        if (!this.manual) await this.load()
        var path = path.split(".")
        var current = this.data
        //Get the value from the correct path
        for (var i = 0; i < path.length; i++) {
            if (i == path.length - 1) {
                return current[path[i]]
            } else {
                if (!current[path[i]]) {
                    return null
                }
                current = current[path[i]]
            }
        }
    }

    async has(path) {
        return (await this.get(path)) != null
    }

    async add(path, value){
        var currentNum = (await this.get(path)) ?? 0
        await this.set(path, currentNum+value)
    }

    async #getArray(path) {
        const currentArr = (await this.get(path)) ?? [];
        if (!Array.isArray(currentArr)) throw new Error(`Current value with key: (${path}) is not an array`);
        return currentArr;
    }

    async push(path, value) {
        let currentArr = await this.#getArray(path);
        if (Array.isArray(value)) {
            currentArr = currentArr.concat(value);
        } else {
            currentArr.push(value)
        };
        return this.set(path, currentArr);
    }

    async toggleBoolean(path) {
        let currentBool = (await this.get(path)) ?? false
        return this.set(path, !currentBool);
    }

}
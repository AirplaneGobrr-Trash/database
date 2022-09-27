const fs = require('fs');

class database {
    constructor(filename, manual) {
        this.filename = filename ? filename : `database.json`
        this.manual = manual ? manual : false //Manual Saving and Loading
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

    async has(path) {
        if (!this.manual) await this.load()
        var path = path.split(".")
        var current = this.data
        //Check if the value is in the correct path
        for (var i = 0; i < path.length; i++) {
            if (i == path.length - 1) {
                return current[path[i]] != undefined
            } else {
                if (!current[path[i]]) {
                    return false
                }
                current = current[path[i]]
            }
        }
    }

    async push(path, value) {
        this.saved = false
        if (!this.manual) await this.load()
        var path = path.split(".")
        var current = this.data
        //Push the value to the correct path
        for (var i = 0; i < path.length; i++) {
            if (i == path.length - 1) {
                current[path[i]].push(value)
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

    async add(path, value){
        this.saved = false
        if (!this.manual) await this.load()
        var path = path.split(".")
        var current = this.data
        //Push the value to the correct path
        for (var i = 0; i < path.length; i++) {
            if (i == path.length - 1) {
                current[path[i]] += value
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
                    return undefined
                }
                current = current[path[i]]
            }
        }
    }

}

module.exports = database
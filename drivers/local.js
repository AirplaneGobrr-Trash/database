const fs = require('fs');

module.exports = class dbClass {
    /**
    * @param {Object} options Extra options
    * @param {String} [options.filename] The filename (Or path)
    * @param {String} [options.manual] Should we use manual saving and loading?
    * @param {Boolean} [options.warnings] Enable warnnings?
    * @description Database constructor
    */
    constructor(options = {}) {
        options.filename ??= `database.json`
        this.filename = options.filename

        this.manual = options.manual ?? false //Manual Saving and Loading
        this.warn = options.warnings ?? false
        this.data = null
        this.saved = null
        this.database = this

        this.load()
    }

    //Commands:
    //set, get, has, push

    //const fs = require('fs')
    //var data = {}
    //var fileName = "database.json"

    /**
     * @description Save data
     */
    async save() {
        fs.writeFileSync(this.filename, JSON.stringify(this.data))
        this.saved = true
    }

    /**
     * @description Load data
     */
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

    /**
     * 
     * @param {String} path 
     * @param {*} value 
     */
    async set(path, value) {
        this.saved = false
        if (!this.manual) await this.load()
        var path = path.split(".")
        var current = this.data

        if (typeof value == "string" && value.includes(".")) {
            if (this.warn) console.warn("[DATABASE][WARN] The set value contains a '.' this is know to cause problems and will be auto converted to 'U+002E'")
            value.replaceAll(".", "U+002E")
        }

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

    /**
     * 
     * @param {String} path
     */
    async delete(path) {
        this.saved = false
        if (!this.manual) await this.load()
        var path = path.split(".")
        var current = this.data

        //Save the value to the correct path
        for (var i = 0; i < path.length; i++) {
            if (i == path.length - 1) {
                delete current[path[i]]
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

    /**
     * 
     * @param {String} path 
     * @returns 
     */
    async get(path) {
        if (!this.manual) await this.load()
        var path = path.split(".")
        var current = this.data
        //Get the value from the correct path
        for (var i = 0; i < path.length; i++) {
            if (i == path.length - 1) {
                let e = current[path[i]]
                if (typeof e == "string" && e.includes("U+002E")) {
                    return e.replaceAll("U+002E", ".")
                }
                return e
            } else {
                if (!current[path[i]]) {
                    return null
                }
                current = current[path[i]]
            }
        }
    }
}
const fs = require('fs');
const EventEmitter = require('events');

module.exports = class dbClass extends EventEmitter {
    /**
    * @param {String} filename The bot
    * @param {Object} options Extra options
    * @param {String} [options.manual] Should we use manual saving and loading?
    * @param {Boolean} [options.warnings] Enable warnnings?
    * @description Database constructor
    */
    constructor(filename, options = {}) {
        super()
        this.filename = filename ?? `database.json`

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
        this.emit("save")
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
        this.emit("load", this.data)
    }

    /**
     * 
     * @param {Function} database This should be the getDatabase() from the online function
     * @deprecated Don't use, this is not readdy yet wait for 1.0.6
     */
    attachDatabase(database){
        database
    }

    /**
     * 
     * @description This is for the online addon, feed this to it
     */
    getDatabase(){
        return this
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
        this.emit("set", path, value)
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
        this.emit("get", path)
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

    /**
     * 
     * @param {String} path 
     * @returns 
     */
    async has(path) {
        return (await this.get(path)) != null
    }

    /**
     * 
     * @param {String} path 
     * @param {Number} value 
     */
    async add(path, value){
        var currentNum = (await this.get(path)) ?? 0
        await this.set(path, currentNum+value)
    }

    /**
     * 
     * @param {String} path 
     * @returns 
     */
    async #getArray(path) {
        const currentArr = (await this.get(path)) ?? [];
        if (!Array.isArray(currentArr)) throw new Error(`Current value with key: (${path}) is not an array`);
        return currentArr;
    }

    /**
     * 
     * @param {String} path 
     * @param {*} value 
     * @returns 
     */
    async push(path, value) {
        let currentArr = await this.#getArray(path);
        if (Array.isArray(value)) {
            currentArr = currentArr.concat(value);
        } else {
            currentArr.push(value)
        };
        return this.set(path, currentArr);
    }

    /**
     * 
     * @param {String} path Toggle bool at path
     * @returns {Boolean} New set Bool
     */
    async toggleBoolean(path) {
        let currentBool = (await this.get(path)) ?? false
        return this.set(path, !currentBool);
    }

}
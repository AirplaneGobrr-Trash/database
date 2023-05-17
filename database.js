const fs = require('fs');
const EventEmitter = require('events');

let localD = require("./drivers/local")
let onlineD = require("./drivers/online")

class dbClass extends EventEmitter {
    /**
    * @param {Object} options Extra options
    * @param {String} [options.manual] Should we use manual saving and loading?
    * @param {Boolean} [options.warnings] Enable warnnings?
    * @param {Boolean} [options.filename] Filename to use
    * @param {localD | onlineD} [options.driver] Driver to use
    * @description Database constructor
    */
    constructor(options = {}) {
        super()
        options.filename ??= `database.json`
        
        options.driver ??= new localD(options)
        
        this.manual = options.manual ?? false //Manual Saving and Loading
        this.warn = options.warnings ?? false
        this.data = null
        this.saved = null
        this.database = this

        this.driver = options.driver;

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
        await this.driver.save()
        this.emit("save")
        // fs.writeFileSync(this.filename, JSON.stringify(this.data))
        this.saved = true
    }

    /**
     * @description Load data
     */
    async load() {
        await this.driver.load()
    }

    /**
     * 
     * @param {String} path 
     * @param {*} value 
     */
    async set(path, value) {
        await this.driver.set(path,value).catch(e=>new Error(e))
    }

    /**
     * 
     * @param {String} path 
     * @returns 
     */
    async get(path) {
        return this.driver.get(path).catch(e=>new Error(e))
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

    async delete(path) {
        return this.driver.delete(path)
    }
}

dbClass.drivers = {
    online: onlineD,
    local: localD
}

dbClass.server = require("./server")

module.exports = dbClass
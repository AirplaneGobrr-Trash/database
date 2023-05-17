const pathMod = require("path")
const fs = require("fs")

class dbServer {
    constructor(auth = {}) {
        auth.database ??= "json"
        this.database = auth.database
        this.oldDatabase = null
        this.pathToData = pathMod.join(__dirname, "data", auth.database)
        if (!fs.existsSync(this.pathToData)) fs.mkdirSync(this.pathToData, { recursive: true })
    }

    async check() {
        // Need to check the path to data and database (they might have been updated?)
    }

    async changeDatabase(database) {
        try {
            this.oldDatabasePath = this.pathToData
            this.pathToData = pathMod.join(__dirname, "data", database)
            if (!fs.existsSync(this.pathToData)) fs.mkdirSync(this.pathToData, { recursive: true })
            return true
        } catch (e) {
            this.pathToData = this.oldDatabasePath
            throw e
        }
    }

    async save(tableName, tableData) {
        const tablePath = pathMod.join(this.pathToData, `${tableName}.json`)
        fs.writeFileSync(tablePath, JSON.stringify(tableData))
    }

    async load(tableName) {
        const tablePath = pathMod.join(this.pathToData, `${tableName}.json`)
        const exist = fs.existsSync(tablePath)
        if (exist) {
            return JSON.parse(fs.readFileSync(tablePath, "utf8"))
        } else {
            fs.writeFileSync(tablePath, JSON.stringify({}))
            return {}
        }
    }

    async set(path, value) {
        path = path.split(".")
        const tableName = path.shift()
        var data = await this.load(tableName)

        var current = data
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
        if (path.length == 0) data = value
        await this.save(tableName, data)
    }

    async get(path) {
        path = path.split(".")
        const tableName = path.shift()
        const data = await this.load(tableName)

        if (path.length == 0) return data

        var current = data
        //Get the value from the correct path
        for (var i = 0; i < path.length; i++) {
            if (i == path.length - 1) {
                return current[path[i]]
            } else {
                if (!current[path[i]]) {
                    console.log("!!")
                    return null
                }
                current = current[path[i]]
            }
        }
    }

    async getAll() {
        // Work on later
    }

    async #getArray(path) {
        const currentArr = (await this.get(path)) ?? [];
        if (!Array.isArray(currentArr)) throw new Error(`Current value with key: (${path}) is not an array`);
        return currentArr;
    }

    // All below use the functions below

    async has(path) {
        return (await this.get(path)) != null
    }

    async add(path, value) {
        var currentNum = (await this.get(path)) ?? 0
        await this.set(path, currentNum + value)
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

module.exports = dbServer
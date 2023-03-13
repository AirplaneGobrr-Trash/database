const { io } = require("socket.io-client")
class dbClient {
    /**
* @param {Object} [options] Auth options
* @param {String} [options.url] Auth url
* @param {String} [options.database] Auth db
* @param {String} [options.auth] Auth token
 */
    constructor(options) {
        BigInt.prototype.toJSON = function () { return this.toString() }
        this.socket = io(options.url, {
            auth: {
                database: options.database,
                auth: options.auth
            },
        });
        this.cache = {}
        this.defaultTable = null
    }

    async load(){
        return this.socket.connected
    }

    async save(){
        //Does nothing, filler function
    }

    async changeDatabase(database) {
        return new Promise((resolve, reject) => {
            this.socket.emit("changeDatabase", database, (a) => {
                if (a && a?.error) reject(a)
                return resolve(a)
            })
        })
    }

    async get(path) {
        return new Promise((resolve, reject) => {
            if (!path) path = this.defaultTable; else if (this.defaultTable) path = `${this.defaultTable}.${path}`;
            this.socket.emit("get", path, (a) => {
                if (a && a?.error) reject(a)
                return resolve(a)
            })
        })

    }

    async set(path, value) {
        return new Promise((resolve, reject) => {
            if (this.defaultTable) path = `${this.defaultTable}.${path}`
            this.socket.emit("set", path, value, (a) => {
                if (a && a?.error) reject(a)
                resolve(a)
            })
        })
    }

    async delete(path) {
        return new Promise((resolve, reject) => {
            if (this.defaultTable) path = `${this.defaultTable}.${path}`
            this.socket.emit("delete", path, (a) => {
                if (a && a?.error) reject(a)
                resolve(a)
            })
        })
    }

    async has(path) {
        return new Promise((resolve, reject) => {
            if (this.defaultTable) path = `${this.defaultTable}.${path}`
            this.socket.emit("has", path, (a) => {
                if (a && a?.error) reject(a)
                resolve(a)
            })
        })
    }

    async push(path, value) {
        return new Promise((resolve, reject) => {
            if (this.defaultTable) path = `${this.defaultTable}.${path}`
            this.socket.emit("push", path, value, (a) => {
                if (a && a?.error) reject(a)
                resolve(a)
            })
        })
    }
}

module.exports = dbClient
class dbClient {
    /**
    * @param {Object} [options] Auth options
    * @param {String} [options.url] Auth url
    * @param {String} [options.database] Auth db
    * @param {Object} [options.auth] Auth Data
    * @param {String} [options.auth.user] Auth user
    * @param {String} [options.auth.password] Auth password
 */
    constructor(options) {
        BigInt.prototype.toJSON = function () { return this.toString() }
        const { io } = require("socket.io-client")
        var url = options.url
        if (!url.startsWith("ws://") || !url.startsWith("wss://")) {
            url = `ws://${url}`
            console.log(`[DATABASE] [ONLINE DRIVER] PLEASE GET USED TO PUTTING WS:// / WSS:// IN THE URL LIKE SO: ${url}`)
        }
        this.socket = io(url, {
            auth: {
                database: options.database,
                auth: options.auth
            },
        });
        this.cache = {}
        this.defaultTable = null
    }

    async load(){
        return new Promise((g,b)=>{
            var int = setInterval(()=>{
                if (this.socket.connected) g()
            }, 100)
            setTimeout(()=>{
                clearInterval(int)
                b("Timed out after 10 seconds!")
            }, 10* 1000)
        })
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

    async get(pathIn) {
        return new Promise((resolve, reject) => {
            let path = null;
            if (!pathIn) path = this.defaultTable; else if (this.defaultTable) path = `${this.defaultTable}.${pathIn}`;
            this.socket.emit("get", path, (a) => {
                if (a && a?.error) reject(a)
                return resolve(a)
            })
        })

    }

    async set(pathIn, value) {
        return new Promise((resolve, reject) => {
            let path = null;
            if (this.defaultTable) path = `${this.defaultTable}.${pathIn}`
            this.socket.emit("set", path, value, (a) => {
                if (a && a?.error) reject(a)
                resolve(a)
            })
        })
    }

    async delete(pathIn) {
        return new Promise((resolve, reject) => {
            let path = null;
            if (this.defaultTable) path = `${this.defaultTable}.${pathIn}`
            this.socket.emit("delete", path, (a) => {
                if (a && a?.error) reject(a)
                resolve(a)
            })
        })
    }

    async has(pathIn) {
        return new Promise((resolve, reject) => {
            let path = null;
            if (this.defaultTable) path = `${this.defaultTable}.${pathIn}`
            this.socket.emit("has", path, (a) => {
                if (a && a?.error) reject(a)
                resolve(a)
            })
        })
    }

    async push(pathIn, value) {
        return new Promise((resolve, reject) => {
            let path = null;
            if (this.defaultTable) path = `${this.defaultTable}.${pathIn}`
            this.socket.emit("push", path, value, (a) => {
                if (a && a?.error) reject(a)
                resolve(a)
            })
        })
    }
}

module.exports = dbClient
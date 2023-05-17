const EventEmitter = require("events")

class Server extends EventEmitter {
    /**
     * 
     * @param {Server} server HTTP server
     * @param {Object} authData Auth data, Logins
     */
    constructor(server = null, authData) {
        super()
        this.server = server

        var debug = false

        authData ??= { loginRequired: false }

        if (!this.server) {
            this.express = require('express');
            this.app = this.express();
            this.http = require('http');
            this.server = this.http.createServer(this.app);
        }

        const { Server } = require("socket.io");
        const io = new Server(this.server);

        const dbMod = require("./database")
        var bitmask = require('json-bitmask')
        var bitPermissions = bitmask.from({
            ADMIN: 1,
            READ: 2,
            WRITE: 4,
            DELETE: 8,
            CREATEDATABASE: 16
        })

        async function getAuthdata(socket, auth){
            var out = { permissions: null }
            if (authData.loginRequired) {
                var userAuth = auth // { user: "XYZ", password: "XYZ" }
                if (!userAuth) return socket.emit("authError", {
                    error: "No auth data provided!",
                    code: 511
                })
                var userInfo = authData.users.find(u => u.user === userAuth.user)
                if (!userInfo || userInfo.password != userAuth.password) return socket.emit("authError", {
                    error: "User name or password is invaild!",
                    code: 401
                })
                var userPermissions = bitPermissions(userInfo.authLevel)
                out.permissions = userPermissions
            }
            return out
        }

        async function checkAuth(type, permissions) {
            if (!authData.loginRequired) return true // Auth is not needed
            if (authData.loginRequired && !permissions) return false
            if (permissions?.ADMIN) return true // Is admin
            switch(type) {
                case "has":
                case "get": {
                    return !!(permissions.READ);
                }
                case "set":
                case "push": {
                    return !!(permissions.WRITE);
                }
                case "delete": {
                    return !!(permissions.DELETE);
                }
                default: {
                    console.log(type)
                    break
                }
            }
        }

        io.on('connection', async (socket) => {
            if (debug) console.log('a user connected');
            var data = socket.handshake.auth;
            var auth = data.auth

            var userAuthData = await getAuthdata(socket, auth)

            if (authData && authData.databases) {
                var databaseWant = authData.databases.find(d => d.name === data.database)
                var allowed = databaseWant.allowedUsers.includes(auth.user)
                if (!allowed) return socket.emit("authError", {
                    error: "You are not allowed to access this database!",
                    code: 403
                })
            }
            

            const db = new dbMod(data)
            // await db.set("foo.bar","abc")
            // if (debug) console.log(await db.get("foo"))

            socket.on("get", async (path, cb) => {
                if (debug) console.log("Get", path)
                var allowed = await checkAuth("get", userAuthData.permissions)
                if (!allowed) return cb({ error: true })
                try {
                    var back = await db.get(path)
                    cb(back)
                } catch (e) {
                    cb({
                        error: true, errorInfo: {
                            name: e.name,
                            message: e.message,
                            cause: e.cause
                        }
                    })
                }
            })

            socket.on("changeDatabase", async (newDatabase, cb) => {
                if (debug) console.log("ChangeDatabase", newDatabase)
                try {
                    var good = await db.changeDatabase(newDatabase)
                    cb(good)
                } catch (e) {
                    cb({
                        error: true,
                        errorInfo: {
                            name: e.name,
                            message: e.message,
                            cause: e.cause
                        }
                    })
                }
            })

            socket.on("set", async (path, value, cb) => {
                if (debug) console.log("Set", path, value)

                var allowed = await checkAuth("set", userAuthData.permissions)
                if (!allowed) return cb({ error: true, message: "No Auth!", code: 401 })

                try {
                    cb(await db.set(path, value))
                } catch (e) {
                    cb({
                        error: true, errorInfo: {
                            name: e.name,
                            message: e.message,
                            cause: e.cause
                        }
                    })
                }
            })

            socket.on("has", async (path, cb) => {
                if (debug) console.log("Has", path)
                
                var allowed = await checkAuth("has", userAuthData.permissions)
                if (!allowed) return cb({ error: true, message: "No Auth!", code: 401 })

                try {
                    var back = await db.has(path)
                    cb(back)
                } catch (e) {
                    cb({
                        error: true, errorInfo: {
                            name: e.name,
                            message: e.message,
                            cause: e.cause
                        }
                    })
                }
            })

            socket.on("push", async (path, value, cb) => {
                if (debug) console.log("Push", path, value)

                var allowed = await checkAuth("push", userAuthData.permissions)
                if (!allowed) return cb({ error: true, message: "No Auth!", code: 401 })

                try {
                    cb(await db.push(path, value))
                } catch (e) {
                    cb({
                        error: true, errorInfo: {
                            name: e.name,
                            message: e.message,
                            cause: e.cause
                        }
                    })
                }
            })
        });
    }
    start(port = 3000, hostname = "0.0.0.0"){
        return new Promise(good=>{
            this.server.listen(port, hostname, ()=>{
                good()
            })
        })
    }
}

module.exports = Server
const EventEmitter = require("events")

class Server extends EventEmitter {
    /**
     * 
     * @param {Server} server HTTP server
     * @param {Object} authData Auth data, Logins
     */
    constructor(server = null, authData = {}) {
        super()
        this.server = server

        if (!this.server) {
            this.express = require('express');
            this.app = this.express();
            this.http = require('http');
            this.server = this.http.createServer(this.app);
        }

        const { Server } = require("socket.io");
        const io = new Server(this.server);

        const dbMod = require("./database")
        this.bitmask = require('json-bitmask')
        this.bitmask.permissions = this.bitmask.from({
            ADMIN: 1,
            READ: 2,
            WRITE: 4,
            DELETE: 8,
            CREATEDATABASE: 16
        })

        var authDataE = {
            databases: [
                { name: "exampleDatabase", allowedUsers: ["user1", "user2"] }
            ],
            users: [
                { user: "user1", password: "pass", authLevel: 1 },
                { user: "user2", password: "pass", authLevel: 2 }
            ],
            allowCreationOfDatabases: true, // allows clients to make databases
            loginRequired: true
        }

        io.on('connection', async (socket) => {
            console.log('a user connected');
            var auth = socket.handshake.auth;
            if (authDataE.loginRequired) {
                var userAuth = auth.auth // { user: "XYZ", password: "XYZ" }

                if (!userAuth) return socket.emit("authError", {
                    error: "No auth data provided!",
                    code: 511
                })
                var userInfo = authDataE.users.find(u => u.user === userAuth.user)

                if (!userInfo || userInfo.password != userAuth.password) return socket.emit("authError", {
                    error: "User name or password is invaild!",
                    code: 401
                })

                var userPermissions = this.bitmask.permissions(userInfo.authLevel)
                console.log(userInfo, auth)
                socket.permissions = userPermissions

                var databaseWant = authDataE.databases.find(d => d.name === auth.database)
                var allowed = databaseWant.allowedUsers.includes(userInfo.user)

                if (!allowed) return socket.emit("authError", {
                    error: "You are not allowed to access this database!",
                    code: 403
                })
            }

            const db = new dbMod(auth)
            // await db.set("foo.bar","abc")
            // console.log(await db.get("foo"))

            async function checkAuth(socket, callback) {
                if (!authDataE.loginRequired) return true // Auth needed
                if (authDataE.loginRequired && !socket.permissions) return false
                if (socket?.permissions?.ADMIN) return true // Is admin
                switch(eventName) {
                    case "has":
                    case "get": {
                        if (socket.permissions.READ) return true; else return false
                        break
                    }

                    case "set":
                    case "push": {
                        if (socket.permissions.WRITE) return true; else return false
                        break
                    }
                    case "delete": {
                        if (socket.permissions.DELETE) return true; else return false
                        break
                    }
                    default: {
                        console.log(eventName)
                        break
                    }
                }
            }

            socket.on("get", async (path, cb) => {
                console.log("Get", path)
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
                console.log("ChangeDatabase", newDatabase)
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
                console.log("Set", path, value)
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
                console.log("Has", path)
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
                console.log("Push", path, value)
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
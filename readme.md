# Database

# Warning 2.0.0 + may have some breaking changes from 1.0.X

**Alot** of backend code was changed so please check!

This is my custom built database module for nodejs!

Tests:

`npm test` (this is not a good test.)

# How to use

## Normal way

```js
const Database = require('@airplanegobrr/database')  
const db1 = new Database()
await db1.set("name", true)
await db1.set("age", 20)

await db1.add("age", 20)
await db1.toggleBoolean("name")
```

## With custom file names

```js
const Database = require('@airplanegobrr/database')  
const db2 = new Database({filename: "data2.json"})
await db2.set("name", true)
await db2.set("age", 20)

await db2.add("age", 20)
await db2.toggleBoolean("name")
```

## Manual Saving (No need for awaits)

```js
const Database = require('@airplanegobrr/database')
const db3 = new Database({ manual: true, filename: "noAwaits.json" })
db3.set("name", true)
db3.set("age", 20)

db3.add("age", 20)
db3.toggleBoolean("name")
if (!db3.saved) await db3.save()
```

# Server
Notes:
- the `null` can be replaced by a http server input (you can get the builtin http server via `server.express` `server.app` `server.http` and lastly `this.server`) (MAKE SURE TO INSTALL express, socket.io, socket.io-client, json-bitmask)
```js
const Database = require('./database')

const server = new Database.server(null, {
    databases: [
        { name: "exampleDatabase", allowedUsers: ["user1", "user2"] }
    ],
    users: [
        { user: "user1", password: "pass", authLevel: 1 },
        { user: "user2", password: "pass", authLevel: 2 }
        // ADMIN: 1, READ: 2, WRITE: 4, DELETE: 8, CREATEDATABASE: 16
        // READ and WRITE example: 6, + CREATEDATABASE: 22
    ],
    allowCreationOfDatabases: true, // allows clients to make databases (DOES NOTHING CURRENTLY)
    loginRequired: true // set to false to disable all this, will be false by default
})
await server.start()
console.log("Server started")
const client = new Database({
    driver: new Database.drivers.online({
        url: "WS://127.0.0.1:3000",
        auth: { user: "user2", password: "pass" },
        database: "exampleDatabase"
    })
})
await client.load()
console.log("Client loaded!")
await client.set("abc", {hello:"eeee"}).catch(e=>{console.log("ERROR", e)})
await client.set("abc.test", {no: false}).catch(e=>{console.log("ERROR", e)})
```



Have fun!
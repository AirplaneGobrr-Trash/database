# Database

# Warning 2.0.0 may have some breaking changes from 1.0.X

**Alot** of backend code was changed so please check!

This is my custom built database module for nodejs!

Tests:

`npm test`

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
const db2 = new Database("data2.json")
await db2.set("name", true)
await db2.set("age", 20)

await db2.add("age", 20)
await db2.toggleBoolean("name")
```

## Manual Saving (No need for awaits)

```js
const Database = require('@airplanegobrr/database')  
const db3 = new Database("noAwaits.json", true)
db3.set("name", true)
db3.set("age", 20)

db3.add("age", 20)
db3.toggleBoolean("name")
if (!db3.saved) await db3.save()
```

## Raw access to data

```js
const Database = require('@airplanegobrr/database')  
const db3 = new Database("noAwaits.json", true)
db3.data.name = "Bob"
```
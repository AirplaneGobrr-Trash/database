const fs = require('fs');
const Database = require('./database')

async function del(file){
    return new Promise(ya=>{
        fs.unlink(file, (err)=>{
            ya()
        })
    })
}

async function test(){
    console.log(Database.drivers.online)
    await del("database.json")
    await del("data2.json")
    await del("noAwaits.json")

    
    //No args
    const db1 = new Database({
        driver: new Database.drivers.online({
            auth: "abc",
            database: "test",
            url: "http://test"
        })
    })
    
    await db1.set("name", true)
    await db1.set("age", 20)

    await db1.add("age", 20)
    await db1.toggleBoolean("name")

    //Using a dif file
    const db2 = new Database({filename: "data2.json"})
    await db2.set("name", true)
    await db2.set("age", 20)

    await db2.add("age", 20)
    await db2.toggleBoolean("name")

    //Using no awaits
    const db3 = new Database({ manual: true, filename: "noAwaits.json" })
    db3.set("name", true)
    db3.set("age", 20)

    db3.add("age", 20)
    db3.toggleBoolean("name")
    if (!db3.saved) await db3.save()

    //you can also get the raw data
    db3.driver.data.name = "Bob"
}
test()
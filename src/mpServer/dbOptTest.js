const mongodbCore = require('./mongodb.js')

// curd 测试
const init = (router) => {
    router.get("/mp/db/get", async (ctx) => {
        const db = mongodbCore.getDb()
        // 查询所有数据
        const data = await db.collection('sales').find({}).toArray();
        // const data = await db.collection('sales').find( {sales: {$lt: 20}}).toArray();
        ctx.body = { code: 0, data, msg: '成功' }
    })

    router.post("/mp/db/add", async (ctx) => {
        const db = mongodbCore.getDb()
        // 插入数据时 _id 会自动增加
        const insertResult = await db.collection('sales').insertMany([
            { region:"华中", city:"武汉", sales: 1000},
            { region:"华中", city:"湖南", sales: 500}
        ]);
        ctx.body = { code: 0, data: insertResult, msg: '成功' }
    })

    router.post("/mp/db/update", async (ctx) => {
        const db = mongodbCore.getDb()
        const updateResult = await db.collection('sales').updateOne({
            city:"武汉"
        }, {
            $set: {'sales': 2000 }
        })
        ctx.body = { code: 0, data: updateResult, msg: '成功' }
    })

    router.post("/mp/db/del", async (ctx) => {
        const db = mongodbCore.getDb()
        const deleteResult = await db.collection('sales').deleteMany({
            // city: "武汉234234"
            city: "上海"
        })
        //   "deletedCount": 0
        ctx.body = { code: 0, data: deleteResult, msg: '成功' }
    })
}

module.exports = {
    init
}
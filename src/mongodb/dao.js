const mongodbCore = require('../mongodb/mongodb.js')
const { ObjectId} = require('mongodb')

const shortLinkDb = {
    async getList() {
        const db = mongodbCore.getDb()
        // 查询所有数据
        const data = await db.collection('short-link').find({}).toArray();
        return data
    },

    async add(payload) {
        const db = mongodbCore.getDb()
         // 插入数据时 _id 会自动增加
         const insertResult = await db.collection('short-link').insertMany([
            payload
        ]);
        return insertResult
    },

    async edit(payload) {
        const db = mongodbCore.getDb()
        const { shortLink, redirect, _id } = payload
        const updateResult = await db.collection('short-link').updateOne({
            _id: ObjectId(_id)
        }, {
            $set: { shortLink, redirect }
        })
        return updateResult
    },
    
    async del(id) {
        const db = mongodbCore.getDb()
        const deleteResult = await db.collection('short-link').deleteMany({
            _id: ObjectId(id)
        })
        return deleteResult
    }
}


module.exports = {
    shortLinkDb
}
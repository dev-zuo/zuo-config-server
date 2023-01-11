const mongodbCore = require("../mongodb/mongodb.js");
const { ObjectId } = require("mongodb");

const shortLinkDb = {
  async getList(queryStr, { pageIndex, pageSize }) {
    const db = mongodbCore.getDb();
    // 查询列表数据
    let queryRule = {};
    if (queryStr) {
      queryRule = {
        $or: [
          { shortLink: { $regex: queryStr } },
          { redirect: { $regex: queryStr } },
        ],
      };
    }
    // 页码 - skip数据量 - 公式
    // 1 0  (pageIndex - 1) * pageSize
    // 2 pageSize
    // 3
    const list = await db
      .collection("short-link")
      .find(queryRule)
      .limit(pageSize)
      .skip((pageIndex - 1) * pageSize)
      .toArray();

    const total = await db.collection("short-link").find(queryRule).count();
    return {list, total};
  },

  async add(payload) {
    const db = mongodbCore.getDb();
    // 插入数据时 _id 会自动增加
    const insertResult = await db
      .collection("short-link")
      .insertMany([payload]);
    return insertResult;
  },

  async edit(payload) {
    const db = mongodbCore.getDb();
    const { shortLink, redirect, _id } = payload;
    const updateResult = await db.collection("short-link").updateOne(
      {
        _id: ObjectId(_id),
      },
      {
        $set: { shortLink, redirect },
      }
    );
    return updateResult;
  },

  async del(id) {
    const db = mongodbCore.getDb();
    const deleteResult = await db.collection("short-link").deleteMany({
      _id: ObjectId(id),
    });
    return deleteResult;
  },
};

module.exports = {
  shortLinkDb,
};

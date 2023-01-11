// server/index.js
const Koa = require("koa");
const KoaRouter = require("koa-router");
const bodyParser = require("koa-bodyparser");
const path = require("path");
const app = new Koa();
const router = new KoaRouter();
const mongodbCore = require("./mongodb/mongodb.js");
const { shortLinkDb } = require("./mongodb/dao.js");

app.use(bodyParser()); // 处理 post 请求参数

/**
 * 允许跨域
 * 作者：一只正在成长的程序猿
 * 链接：https://juejin.cn/post/6844904042196533255
 */
app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Access-Control-Allow-Headers", "*");
  ctx.set("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  if (ctx.method == "OPTIONS") {
    ctx.body = 200;
  } else {
    await next();
  }
});

// 小程序接口
// const mpServer = require("./mpServer/index.js");
// mpServer.init(router);
// app.use(mpServer.verifyToken()); // token 校验中间件

// 连接 mongodb，初始化 db
mongodbCore.init({ dbName: "zuo-config" });

router.get("/shortLink/list", async (ctx) => {
  console.log("ctx.query", ctx.query);
  let { queryText, currentPage, pageSize } = ctx.query;
  try {
    let {list, total} = await shortLinkDb.getList(queryText, {
      pageSize: parseInt(pageSize),
      pageIndex: parseInt(currentPage),
    });
    ctx.body = {
      code: 0,
      data: {
        queryText: ctx.query.queryText,
        list,
        total
      },
      msg: "成功",
    };
  } catch (e) {
    ctx.body = { code: -10001, msg: "获取短链接列表失败", plainMsg: e.message };
  }
});

router.post("/shortLink/add", async (ctx) => {
  console.log(ctx.request.body);
  try {
    let insertResult = await shortLinkDb.add(ctx.request.body);
    ctx.body = {
      code: 0,
      data: {
        insertResult,
      },
      msg: "成功",
    };
  } catch (e) {
    ctx.body = { code: -10001, msg: "新增短链接配置失败", plainMsg: e.message };
  }
});

router.post("/shortLink/edit", async (ctx) => {
  console.log(ctx.request.body);
  try {
    let updateResult = await shortLinkDb.edit(ctx.request.body);
    ctx.body = {
      code: 0,
      data: {
        updateResult,
      },
      msg: "成功",
    };
  } catch (e) {
    ctx.body = { code: -10001, msg: "修改短链接配置失败", plainMsg: e.message };
  }
});

router.post("/shortLink/del", async (ctx) => {
  let { id } = ctx.request.body;
  try {
    let deleteResult = await shortLinkDb.del(id);
    ctx.body = {
      code: 0,
      data: {
        deleteResult,
      },
      msg: "成功",
    };
  } catch (e) {
    ctx.body = { code: -10001, msg: "删除短链接配置失败", plainMsg: e.message };
  }
});

// router.get("/goods/get", async (ctx) => {
//   ctx.body = {
//     code: 0,
//     data: {
//       info: '商品信息'
//     },
//     msg: '成功',
//   };
// });

router.post("/user/edit", async (ctx) => {
  ctx.body = {
    code: 0,
    msg: "修改成功",
  };
});

app.use(router.routes()).use(router.allowedMethods());
app.listen(5000, () => console.log(`服务监听 ${5000} 端口`));

// 作者：做前端的左小白
// 链接：https://juejin.cn/post/7070921715492061214
// 来源：稀土掘金
// 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

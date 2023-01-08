// server/index.js
const Koa = require("koa");
const KoaRouter = require("koa-router");
const bodyParser = require("koa-bodyparser");
const path = require("path");
const app = new Koa();
const router = new KoaRouter();
const mongodbCore = require("./mpServer/mongodb.js");

app.use(bodyParser()); // 处理 post 请求参数

// 小程序接口
const mpServer = require("./mpServer/index.js");
mpServer.init(router);
app.use(mpServer.verifyToken()); // token 校验中间件

// 连接 mongodb，初始化 db
mongodbCore.init({dbName: 'mp-cloud-db'})

router.get("/user/get", async (ctx) => {
    ctx.body = {
      code: 0,
      data: {
        name: 'zuoxiaobai',
        desc: '测试接口'
      },
      msg: '成功',
    };
});

router.get("/goods/get", async (ctx) => {
  ctx.body = {
    code: 0,
    data: {
      info: '商品信息'
    },
    msg: '成功',
  };
});

router.post("/user/edit", async (ctx) => {
    ctx.body = {
      code: 0,
      msg: '修改成功',
    };
});

app.use(router.routes()).use(router.allowedMethods());
app.listen(9000, () => console.log(`服务监听 ${9000} 端口`));

// 作者：做前端的左小白
// 链接：https://juejin.cn/post/7070921715492061214
// 来源：稀土掘金
// 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
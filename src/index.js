// server/index.js
const Koa = require('koa');
const KoaRouter = require('koa-router');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const router = new KoaRouter();
const mongodbCore = require('./mongodb/mongodb.js');
const { shortLinkDb } = require('./mongodb/dao.js');
const { userBb } = require('./mongodb/dao.js');
const jwt = require('jsonwebtoken');

const privateKey = 'xxxx_privateKey';
app.use(bodyParser()); // 处理 post 请求参数

/**
 * 允许跨域
 * 作者：一只正在成长的程序猿
 * 链接：https://juejin.cn/post/6844904042196533255
 */
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', '*');
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (ctx.method == 'OPTIONS') {
    ctx.body = 200;
  } else {
    await next();
  }
});

// 鉴权，判断是否有登录权限
app.use(async (ctx, next) => {
  console.log(ctx.path); // /shortLink/list、/shortLink/add
  let whiteList = ['/user/login'];
  if (whiteList.includes(ctx.path) || ctx.path.startsWith('/share/') || ctx.userInfo) {
    await next();
    return;
  }

  let { token } = ctx.request.header;
  try {
    let decoded = jwt.verify(token, privateKey);
    // console.log('decode', decoded.data, typeof decoded.data); // { name: 'admin', _id: '63c3babac401a248bd88988a' } Object
    ctx.userInfo = { ...decoded.data, token }; // JSON.parse 会异常，导致中断，所以加 catch
    console.log('解析成功', ctx.userInfo);
    await next();
  } catch (err) {
    ctx.body = {
      code: -1,
      msg: '未登录，请先登录',
      plainMsg: err.name + ': ' + err.message
    };
  }
});

// 小程序接口
// const mpServer = require("./mpServer/index.js");
// mpServer.init(router);
// app.use(mpServer.verifyToken()); // token 校验中间件

// 连接 mongodb，初始化 db
mongodbCore.init({ dbName: 'zuo-config' });

router.get('/share/test-deploy', async (ctx) => {
  ctx.body = {
    code: 0,
    data: {
      test: 'v1.0.0新接口自动化部署成功'
    },
    msg: '成功'
  }
})
// 配置中心对外接口，暂时不需要鉴权（前端直接可以调用，不用登录）
router.get('/share/shortLink/list', async (ctx) => {
  console.log('ctx.query', ctx.query);
  let { queryText = '', currentPage = 1, pageSize = 20, _id = '' } = ctx.query;
  try {
    let { list, total } = await shortLinkDb.getList(
      queryText,
      {
        pageSize: parseInt(pageSize),
        pageIndex: parseInt(currentPage)
      },
      _id
    );
    ctx.body = {
      code: 0,
      data: {
        queryText: ctx.query.queryText,
        list,
        total
      },
      msg: '成功'
    };
  } catch (e) {
    ctx.body = { code: -10001, msg: '获取短链接列表失败', plainMsg: e.message };
  }
});

router.get('/shortLink/list', async (ctx) => {
  console.log('ctx.query', ctx.query);
  let { queryText, currentPage, pageSize } = ctx.query;
  try {
    let { list, total } = await shortLinkDb.getList(
      queryText,
      {
        pageSize: parseInt(pageSize),
        pageIndex: parseInt(currentPage)
      },
      ctx.userInfo?._id
    );
    ctx.body = {
      code: 0,
      data: {
        queryText: ctx.query.queryText,
        list,
        total
      },
      msg: '成功'
    };
  } catch (e) {
    ctx.body = { code: -10001, msg: '获取短链接列表失败', plainMsg: e.message };
  }
});

router.post('/shortLink/add', async (ctx) => {
  console.log(ctx.request.body);
  try {
    let insertResult = await shortLinkDb.add(ctx.request.body, ctx.userInfo?._id);
    ctx.body = {
      code: 0,
      data: {
        insertResult
      },
      msg: '成功'
    };
  } catch (e) {
    ctx.body = { code: -10001, msg: '新增短链接配置失败', plainMsg: e.message };
  }
});

router.post('/shortLink/edit', async (ctx) => {
  console.log(ctx.request.body);
  try {
    let updateResult = await shortLinkDb.edit(ctx.request.body);
    ctx.body = {
      code: 0,
      data: {
        updateResult
      },
      msg: '成功'
    };
  } catch (e) {
    ctx.body = { code: -10001, msg: '修改短链接配置失败', plainMsg: e.message };
  }
});

router.post('/shortLink/del', async (ctx) => {
  let { _id } = ctx.request.body;
  try {
    let deleteResult = await shortLinkDb.del(_id);
    ctx.body = {
      code: 0,
      data: {
        deleteResult
      },
      msg: '成功'
    };
  } catch (e) {
    ctx.body = { code: -10001, msg: '删除短链接配置失败', plainMsg: e.message };
  }
});

// 获取用户信息
router.get('/user/info', async (ctx) => {
  ctx.body = { code: 0, data: ctx.userInfo };
});

router.post('/user/login', async (ctx) => {
  let { name, password } = ctx.request.body;
  console.log(name, password);
  try {
    let { isValidUser, userInfo } = await userBb.login({ name, password });
    if (isValidUser) {
      delete userInfo.password; // Reflect.deleteProperty(userInfo, 'password');
      let token = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 60 * 60, // 有效期，单位 s
          data: { name, _id: userInfo._id } // 存放到 token 里面的信息，一般用户通过 token 获取用户 id
        },
        privateKey
      );
      ctx.body = {
        code: 0,
        data: { ...userInfo, token }, // 将 token 返回给前端，前端下次所有请求，都需需要将 token 放到请求头里面
        msg: '成功'
      };
    } else {
      ctx.body = { code: -10001, msg: '用户名或密码错误' };
    }
  } catch (e) {
    console.log(e);
    ctx.body = { code: -10001, msg: '登录失败', plainMsg: e.message };
  }
});

app.use(router.routes()).use(router.allowedMethods());
app.listen(5000, () => console.log(`服务监听 ${5000} 端口`));

// 作者：做前端的左小白
// 链接：https://juejin.cn/post/7070921715492061214
// 来源：稀土掘金
// 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

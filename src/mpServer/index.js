const http = require('http')
const https = require('https')
const jwt = require('jsonwebtoken');
const dbOptTest = require('./dbOptTest.js')

const privateKey = 'privateKey_xxxxx'
const init = (router) => {
    router.post("/mp/login", async (ctx) => {
        console.log(ctx.request.body)
        let { code } = ctx.request.body;
        let data = {}
        try {
          data  = await auth(code) // {"session_key":"2Ay\/7lyh1\/lhv\/YiHb5SEg==","openid":"omCpi476-ogw8vu2yn0YUf9jRobg"}
        } catch (err) {
            ctx.body = {
                code: -3,
                msg: err.message
            }
            return
        }
        let token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 24h * 7
            data
        }, privateKey);
        ctx.body = {
          code: 0,
          data: {token}, // {"session_key":"o3FDGWGI2oHY6RFdEo5YMQ==","openid":"omCpi476-ogw8vu2yn0YUf9jRobg"}
          msg: '成功',
        };
    });
    router.post("/mp/testTokenVerify", async (ctx) => {
        console.log(ctx.request)
        console.log(ctx.userInfo)
        // let { code } = ctx.request.body
        ctx.body = {
            code: 0,
            data: {a: 1},
            msg: '成功'
        }
       
    })
    dbOptTest.init(router)
}

const appid = 'wxddd0151231a29656';
const secret = 'b1d90f0e6e6a711bde5989c5df408f24'
const auth = (code) => {
    return new Promise((resolve, reject) => {
        let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`
        const logPreInfo = `${url}`
        const req = https.get(url, (res) => {
          res.setEncoding('utf8')
          let rawData = ''
          res.on('data', (chunk) => {
            rawData += chunk
          })
          res.on('end', () => {
            console.log(rawData)
            resolve(rawData)
          })
        })
        req.on('error', (e) => {
          const errMsg = `api.weixin.qq.com/sns/jscode2session 访问异常, ${e.message}`
          reject(new Error(errMsg))
        })
      })
}


const verifyToken = () => {
  return async (ctx, next) => {
    // 无需校验 token 的接口（不需要鉴权）
    console.log('ctx.url', ctx.url)
    let whiteList = ['/mp/login']
    // 如果在白名单里面，或者非 /mp 开头接口，不校验 token
    if (whiteList.includes(ctx.url) || !ctx.url.startsWith('/mp')) {
      await next()
      return
    }
    let { token } = ctx.request.header
    try {
        let decoded = jwt.verify(token, privateKey);
        // console.log(decoded.data)  // 字符串 "{"session_key":"2Ay\/7lyh1\/lhv\/YiHb5SEg==","openid":"omCpi476-ogw8vu2yn0YUf9jRobg"}
        ctx.userInfo = JSON.parse(decoded.data)
        await next()
    } catch (err) {
        ctx.body = {
            code: -5,
            msg: err.name + ': ' + err.message
        }
    }
  }
}

module.exports = {
   init,
   verifyToken
}
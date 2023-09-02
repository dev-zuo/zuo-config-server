# zuo-config-server

Config center server part, by Koa.js + MongoDB

> Node version: v14.19.1，比较新的版本，比如 18.17.1 可能会导致接口服务崩溃

注意：运行服务需要开启 MongoDB 服务，如果没有开机启动服务，需要在手动启动服务后，重新运行 node src/index.js 重启接口服务 

## 对外接口鉴权

TODO

类似小程序 appId + appSecret？如果解析一致，判定当前调用方具有该 appid(用户)的权限。

这里传 userName +  秘钥（这个逻辑只能在后端做，防止 秘钥暴露）

秘钥生成方式：userName + _id + 服务端私有秘钥，通过 jwt.sign 生成永久有效的秘钥(token)

暂未做鉴权对外接口

<http://127.0.0.1:5000/share/shortLink/list?_id=63c3babac401a248bd88988a>  

## Mongodb 数据库/集合

db: "zuo-config"

```bash
# 连接/创建数据库, use 数据库名称
use zuo-config
```

### collection

#### short-link 短链接模块

```bash
# 创建集合
db.createCollection('short-link')
```

#### user 用户模块

```bash
# 创建集合
db.createCollection('user')

# 插入用户数据，公共测试账号 { name: 'admin', password: 'admin' }
db.user.insertMany([ { name: 'admin', password: 'admin' },{ name: 'dev-zuo', password: '123456' }] )

# 修改 个人账号 私有账号密码
db.user.update({'name':'dev-zuo'},{$set:{'password':'新密码'}})
```

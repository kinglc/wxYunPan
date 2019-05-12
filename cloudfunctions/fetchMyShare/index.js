// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => new Promise((resolve, reject) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database();
  const _ = db.command;
  const sharedb = db.collection('share');
  sharedb.where({
    _openid: wxContext.OPENID,
    createTime: _.lt(event.createTime),
  }).orderBy('createTime', 'desc').get({
    success: resolve,
  })
})
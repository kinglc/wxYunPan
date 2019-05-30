// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => new Promise((resolve,reject)=>{
  const wxContext = cloud.getWXContext()
  const db = cloud.database();
  const _ = db.command;
  const sharedb = db.collection('share');
 
  // const db = cloud.database();
  // const _ = db.command;
  const commentdb = db.collection('comment');
  // const sharedb = db.collection('share');
  // var commentId = null;

  commentdb.add({
    data: {
      shareId: event.shareId,
      score:event.score,
      comment:event.comment,
      createTime: db.serverDate(),
      avatar: event.avatarUrl,
      nickname: event.nickName
    }
  })
.then(res => {
  commentId = res._id;

  return sharedb.doc(event.shareId).update({
    data: {
      comment: _.inc(1),
      score: _.inc(event.score)
    }
  })
}).then((res)=>{
  resolve(commentId);
}).catch(reject)
})
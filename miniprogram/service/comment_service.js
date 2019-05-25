/**
 * @typedef CommentInfo
 * @property {string} _id - 文件ID 
 * @property {date} createTime - 文件创建时间
 * @property {string} shareId - 所评论的分享的ID
 * @property {number} score - 评分[0-5]
 * @property {string} comment - 评价
 * @property {string} nickname - 评论用户名
 * @property {string} avatar - 用户头像
 */

/**
 * @typedef ErrorMsg
 * @property {string} errMsg - 错误信息
 * @property ...
 */

// function getUserInfo({ success, fail }) {
//   wx.getUserInfo({
//     success(res) {
//       success({
//         avatar: res.userInfo.avatarUrl,
//         nickname: res.userInfo.nickName
//       });
//     },
//     fail
//   })
// }

function formatDate(t) {
  var date = new Date(t);
  var fmt = 'yyyy-MM-dd hh:mm:ss';
  var o = {
    "M+": date.getMonth() + 1,                 //月份   
    "d+": date.getDate(),                    //日   
    "h+": date.getHours(),                   //小时   
    "m+": date.getMinutes(),                 //分   
    "s+": date.getSeconds(),                 //秒   
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度   
    "S": date.getMilliseconds()             //毫秒   
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

function getUserInfo() {
  return new Promise((success, fail) => {
    wx.getUserInfo({
      success,
      fail
    })
  })
}

/**
 * 评论服务，在查看某分享的情况下使用
 * 可以拉取评论，发布评论
 * comment:发布评论
 * fetch：拉取评论数据
 * save: 保存一个文件至我的分享
 */
export default class CommentService {

  /**
   * @constructor
   * @param {Object} option
   * @param {string} option.shareId - 分享的Id
   * @param {function(Array<CommentInfo>)} option.onCommentListChange - 函数调用成功修改数据后的监听器
   * @param {function(ErrorMsg)} option.onFail - 函数调用失败的监听器
   */
  constructor({
    shareId,
    onCommentListChange = () => { },
    onFail = () => { }
  }) {
    this._shareId = shareId;
    this._setup(onCommentListChange, onFail);
    wx.cloud.init();
    const db = wx.cloud.database();
    const sharedb = db.collection('share');
    sharedb.doc(shareId)
    .get().then(res=>{  
      const history = db.collection('history'); 
      history.add({
        data:{
          createTime:db.serverDate(),
          files:res.data.files,
          shareId:res.data._id,
          avatar:res.data.avatar,
          nickname:res.data.nickname,
          name:res.data.name,
          remark:res.data.remark
        }
      })
    }).catch(console.log);
   
    this._fetching = false;
  }

  _dataChanged() {
    this.onCommentListChange(this._getData())
  }

  _setup(onCommentListChange, onFail) {
    this.onCommentListChange = onCommentListChange;
    this.onFail = onFail
    return this;
  }

  _getData() {
    if (this._data == undefined || this._data == null) {
      this._data = [];
    }
    return this._data;
  }

  /**
   * 保存单个目标文件至我的目录，多个请使用多次
   * @param {Object} options
   * @param {string} options.fileId - 待保存的文件ID
   * @param {function} options.success - 成功回调
   * @param {function} options.fail - 失败回调
   */
  save({
    fileId,
    success,
    fail
  }){
    const db = wx.cloud.database();
    const filedb = db.collection('file');
    filedb.doc(fileId)
    .get().then(res=>{
      console.log(res);
      return filedb.add({
        data:{
        filename:res.data.filename,
        cloudpath:res.data.cloudpath,
        isImage:res.data.isImage,
        createTime:db.serverDate(),
        size:res.data.size
        }
      })
    }).then((res)=>{
      success(res);
    }).catch(res=>{
      fail(res);
    })
  }

  /**
   * 对该分享作出评论
   * @param {Object} options
   * @param {string} options.comment - 评论
   * @param {number} options.score - 给出对该分享的评分（0-5
   */
  comment({
    comment,
    score
  }) {
    if (score < 0 || score > 5) {
      this.onFail({
        errMsg: '无效的评分'
      })
      return
    }

    const db = wx.cloud.database();
    const _ = db.command;
    const commentdb = db.collection('comment');

    getUserInfo().then(res=>{
      return commentdb.add({
        data: {
          shareId: this._shareId,
          score,
          comment,
          createTime: db.serverDate(),
          avatar: res.userInfo.avatarUrl,
          nickname: res.userInfo.nickName
        }
      })   
    }).then(res=>{
      const sharedb = db.collection('share');
      return sharedb.doc(this._shareId).update({
        data: {
          comment: _.inc(1),
          score: _.inc(score)
        }
      })
    }).then(res=>{
      return commentdb.doc(res._id).get() 
    }).then(res=>{
      let data = this._getData();
      data.unshift(res.data);
      this._dataChanged();
    })
    .catch(this.onFail);
  }


  /**
   * 拉取20条评论数据并入当前数组
   */
  fetch(){
    if (this._fetching == true) {
      this.onFail({
        errMsg: '请等待上次的查询'
      })
      return;
    }
    this._fetching = true;
    let data = this._getData();
    let lastTimestamp = null;
    if (data.length != 0) {
      lastTimestamp = data[data.length - 1].createTime;
    } else {
      lastTimestamp = new Date()
    }
    const db = wx.cloud.database();
    const _ = db.command;
    const commentdb = db.collection('comment');
    commentdb.where({
      createTime: _.lt(lastTimestamp),
      shareId:this._shareId,
    }).orderBy('createTime', 'desc')
    .get().then(res=>{
      for(var i of res.data){
        i.time = formatDate(i.createTime);
      }
      this._data = this._getData().concat(res.data);
      this._fetching = false;
      this._dataChanged();
    }).catch(res=>{
      this._fetching = false;
      this.onFail(res);
    })
  }
}
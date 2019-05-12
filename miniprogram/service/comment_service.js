
function getUserInfo({ success, fail }) {
  wx.getUserInfo({
    success(res) {
      success({
        avatar: res.userInfo.avatarUrl,
        nickname: res.userInfo.nickName
      });
    },
    fail
  })
}

/**
 * 评论服务，在查看某分享的情况下使用
 * 可以拉取评论，发布评论
 * comment:发布评论
 * fetch：拉取评论数据
 */
export default class CommentService {
  /**
   * 构造函数
   * @param {string} shareId - 分享的Id
   */
  constructor(shareId) {
    this.fetching = false;
    this.shareId = shareId;
    wx.cloud.init();
  }

  getData() {
    if (this.data == undefined || this.data == null) {
      this.data = [];
    }
    return this.data;
  }


  /**
   * 对该分享作出评论，会刷新data，请通过success进行回调
   * @param {Object} options
   * @param {string} options.comment - 评论
   * @param {number} options.score - 给出对该分享的评分（0-5）
   * @param {function} options.success - 响应成功的回调函数，参数为更新后的文件列表
   * @param {function} options.fail - 调用失败的回调函数
   */
  comment({
    comment,
    score,
    success = () => { },
    fail = () => { }
  }) {
    if (score < 0 || score > 5) {
      fail({
        errMsg: '无效的评分'
      })
      return
    }
    var that = this;
    const db = wx.cloud.database();
    const _ = db.command;
    const commentdb = db.collection('comment');
    getUserInfo({
      success(res){
        commentdb.add({
          data: {
            shareId: that.shareId,
            score,
            comment,
            createTime: db.serverDate(),
            avatar:res.avatar,
            nickname:res.nickname
          },
          success(res) {
            const sharedb = db.collection('share');
            sharedb.doc(that.shareId).update({
              data:{
                comment:_.inc(1),
                score:_.inc(score)
              },
              success(res2){
                commentdb.doc(res._id).get({
                  success(res){
                    let data = that.getData();
                    data.unshift(res.data);
                    success(data)
                  },
                  fail
                })
              },
              fail
            })
          },
          fail
        })
      },
      fail
    })
   


  }


  /**
   * 拉取20条评论数据并入当前数组
   * @param {Object} option
   * @param {function(Array)} option.success 响应成功的回调函数，参数为更新后的文件列表
   * @param {function(Object)} option.fail
   */
  fetch({
    success = (res) => { },
    fail = (res) => { }
  }) {
    if (this.fetching == true) {
      fail({
        errMsg: '请等待上次的查询'
      })
      return;
    }
    this.fetching = true;
    var that = this;
    let data = this.getData();
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
      shareId:this.shareId,
    }).orderBy('createTime', 'desc').get({
      success(res) {
        that.data = data.concat(res.data);
        success(that.data);
        that.fetching = false;
      },
      fail(res) {
        fail(res);
        that.fetching = false;
      }
    })

  }




}
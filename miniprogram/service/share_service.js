function getUserInfo({success,fail}){
  wx.getUserInfo({
    success(res){
      console.log(res)
      success({
        avatar:res.userInfo.avatarUrl,
        nickname:res.userInfo.nickName
      });
    },
    fail
  })
}

/**
 * 提供分享服务
 * getShareInfo 获取分享详情
 * fetch 拉取分享数据
 * remove 删除一次分享
 * share 一次分享
 */
export default class ShareService {
  constructor() {
    this.fetching = false;
    wx.cloud.init();
  }
  setFilter(filter) {
    this.filter = filter;
  }

  getData() {
    if (this.data == undefined || this.data == null) {
      this.data = [];
    }
    return this.data;
  }

  /**
   * 用ID获取某分享的详细数据，适用于分享给好友的情况
   * @param {Object} options
   * @param {string} options.shareId - 目标分享的ID
   * @param {function} options.success - 调用成功的回调函数
   * @param {function} options.fail - 调用失败的回调函数
   */
  getShareInfo({
    shareId,
    success,
    fail
  }){
    const db = wx.cloud.database();
    const sharedb = db.collection('sharedb');
    sharedb.doc(shareId).get({
      success,
      fail
    })
  }


  /**
   * 分享一批自己的文件，最大数量不超过20
   * @param {Object} options
   * @param {Array <string>} options.fileIds - 要分享的[文件ID]
   * @param {string} options.name - 这批分享的名称
   * @param {string} options.remark - 这批分享的说明
   * @param {boolean} options.pub - 是否公开分享
   * @param {function} options.success - 调用成功的回调函数
   * @param {function} options.fail - 调用失败的回调函数
   */
  share({
    fileIds,
    name,
    remark,
    pub = false,
    success = ()=>{},
    fail = ()=>{}
  }){
    if(fileIds.length > 20){
      fail({
        errMsg:'分享的文件数量不能大于20'
      })
      return
    }
    const db = wx.cloud.database();
    const _ = db.command;
    const filedb = db.collection('file');
    filedb.where({
      _id:_.in(fileIds)
    }).get({
      success(res){
        getUserInfo({
          success: function(res2) {
            const sharedb = db.collection('share');

            sharedb.add({
              data: {
                files: res.data.map((item)=>({
                  _id:item._id,
                  filename:item.filename
                })),
                createTime: db.serverDate(),
                pub,
                name,
                remark,
                nickname:res2.nickname,
                avatar:res2.avatar,
                comment:0,
                score:0
              },
              success,
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
   * 拉取20条分享数据并入当前数组
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
    wx.cloud.callFunction({
      name:'fetchMyShare',
      data:{
        createTime:lastTimestamp
      },
      success(res){
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

  /**
   * 用户删除自己的某项分享
   * @param {Object} option
   * @param {string} option.shareId 待删除的分享ID
   * @param {function(Array)} option.success 响应成功的回调函数，参数为更新后的文件列表
   * @param {function(Object)} option.fail
   */
  remove({
    shareId,
    success = (res) => { },
    fail = (res) => { }
  }) {
    const db = wx.cloud.database();
    const sharedb = db.collection('share');
    var that = this;
    sharedb.doc(shareId).remove({
      success(res) {
        let data = that.getData();
        for (var i = 0; i < data.length; i++) {
          if (data[i]._id == shareId) {
            data.splice(i, 1);
            break;
          }
        }
        success(data);
      },
      fail
    })
  }

 

}
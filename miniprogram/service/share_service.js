/**
 * @typedef ShareInfo
 * @property {string} _id - 分享的ID
 * @property {Array<{_id:string,filename:string,isImage:boolean,size:number,cloudpath:string}>} files - 一批文件的ID 
 * @property {date} createTime - 文件创建时间
 * @property {string} name - 分享名称
 * @property {string} remark - 分享说明
 * @property {string} nickname - 分享人
 * @property {boolean} pub - 是否公开的分享
 * @property {string} avatar - 分享人头像链接
 * @property {number} comment - 评论数量
 * @property {number} score - 评论分数和
 */

/**
 * @typedef ErrorMsg
 * @property {string} errMsg - 错误信息
 * @property ...
 */

function getUserInfo(){
  return new Promise((success,fail)=>{
    wx.getUserInfo({
      success,
      fail
    })
  })
}

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

/**
 * 提供分享服务
 * getShareInfo 获取分享详情
 * fetch 拉取分享数据
 * remove 删除一次分享
 * share 一次分享
 */
export default class ShareService {
  /**
   * @constructor
   * @param {Object} option
   * @param {function(Array<ShareInfo>)} option.onShareListChange - 函数调用成功修改数据后的监听器
   * @param {function(ErrorMsg)} option.onFail - 函数调用失败的监听器
   */
  constructor({
    onShareListChange = () => { },
    onFail = () => { }
  }) {
    this._setup(onShareListChange, onFail);
    wx.cloud.init();
    this._fetching = false;
  }

  _dataChanged() {
    this.onShareListChange(this._getData())
  }

  _setup(onShareListChange, onFail) {
    this.onShareListChange = onShareListChange;
    this.onFail = onFail
    return this;
  }

  setFilter(filter) {
    this.filter = filter;
  }

  _getData() {
    if (this._data == undefined || this._data == null) {
      this._data = [];
    }
    return this._data;
  }

  /**
   * 用ID获取某分享的详细数据，适用于分享给好友的情况，静态函数
   * @example ShareService.getShareInfo({shareId:...,success:...,fail:...})
   * @param {Object} options
   * @param {string} options.shareId - 目标分享的ID
   * @param {function} options.success - 调用成功的回调函数
   * @param {function} options.fail - 调用失败的回调函数
   */
  static getShareInfo({
    shareId,
    success,
    fail
  }){
    wx.cloud.init();
    const db = wx.cloud.database();
    const sharedb = db.collection('share');
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
      this.onFail({
        errMsg:'分享的文件数量不能大于20'
      })
      return
    }
    const db = wx.cloud.database();
    const _ = db.command;
    const filedb = db.collection('file');

    let files = null; 

    filedb.where({
      _id:_.in(fileIds)
    }).get()
    .then(res=>{
      files = res.data.map(item=>({
        _id:item._id,
        isImage:item.isImage,
        filename:item.filename,
        cloudpath:item.cloudpath,
        size:item.size        
      }));
      return getUserInfo();
    }).then(res=>{
      const sharedb = db.collection('share');
      return sharedb.add({
        data: {
          files: files,
          createTime: db.serverDate(),
          pub,
          name,
          remark,
          nickname: res.userInfo.nickName,
          avatar: res.userInfo.avatarUrl,
          comment: 0,
          score: 0
        }
      })
    }).then(success)
    .catch(fail);
  }


  /**
   * 拉取20条分享数据并入当前数组
   */
  fetch() {
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
      lastTimestamp = new Date(data[data.length - 1].createTime);
    } else {
      lastTimestamp = new Date()
    }
    wx.cloud.callFunction({
      name:'fetchMyShare',
      data:{
        createTime:+lastTimestamp
      }
    }).then(res=>{
      for(var i of res.result.data){
        i.time = formatDate(i.createTime);
      }
      this._data = this._getData().concat(res.result.data);
      this._fetching = false;
      this._dataChanged();
    }).catch(res=>{
      this._fetching = false;
      this.onFail(res);
    })
  
  }

  /**
   * 用户删除自己的某项分享
   * @param {string} shareId 待删除的分享ID
   */
  remove(shareId) {
    const db = wx.cloud.database();
    const sharedb = db.collection('share');

    sharedb.doc(shareId).remove()
    .then(res=>{
      let data = this._getData();
      for (var i = 0; i < data.length; i++) {
        if (data[i]._id == shareId) {
          data.splice(i, 1);
          break;
        }
      }
      this._dataChanged();
    }).catch(this.onFail)

  }

}
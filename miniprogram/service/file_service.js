/**
 * @typedef ShareInfo
 * @property {string} _id - 分享的ID
 * @property {Array<{_id:string,filename:string}>} files - 一批文件的ID 
 * @property {date} createTime - 文件创建时间
 * @property {string} name - 分享名称
 * @property {string} remark - 分享说明
 * @property {string} nickname - 分享人
 * @property {string} avatar - 分享人头像链接
 */

/**
 * @typedef ErrorMsg
 * @property {string} errMsg - 错误信息
 * @property ...
 */

/**
 * 获取文件名的后缀
 * @param {string} filename 文件名
 * @return {string} 返回文件名后缀
 */
function getSuffix(filename) {
  let dotIndex = filename.lastIndexOf('.');
  if (dotIndex == -1) {
    return '';
  }
  return filename.substr(dotIndex)
}



/**
 * @param suffix {string}
 */
function is_image(suffix){
  let regex = /^.(jpg|jpeg|png|bmp|gif)$/
  return regex.test(suffix.toLowerCase());
}

function is_doc(suffix){
  let regex = /^.(doc|docx|xls|ppt|pdf|xlsx|pptx)$/
  return regex.test(suffix.toLowerCase());
}

function is_video(suffix){
  let regex = /^.(mp4|mov|m4v|3gp|avi|m3u8|webm)$/
  return regex.test(suffix.toLowerCase());
}

/**
 * 提供文件预览及历史浏览查询服务
 * downloadFile - 下载云数据库文件
 * getFileType - 根据文件名判断文件类型
 * fetch - 拉取浏览历史
 * remove - 删除浏览历史
 */
export default class FileService {

/**
 * @constructor
 * @param {Object} option
 * @param {function(Array<ShareInfo>)} option.onHistoryListChange - 函数调用成功修改数据后的监听器
 * @param {function(ErrorMsg)} option.onFail - 函数调用失败的监听器
 */
  constructor({
    onHistoryListChange = () => { },
    onFail = () => { }
  }) {
    this._setup(onHistoryListChange, onFail);
    wx.cloud.init();
    this._fetching = false;
  }

  /**
   * 使用云路径下载云端文件，并返回文件临时链接，
   * 可用于 wx.previewImage,wx.openDocument
   * 对于 video 应直接使用video标签，cloudpath对其有效。
   * @param {Object} options
   * @param {string} options.cloudpath - 云端路径
   * @param {function(string)} options.success - 成功回调
   * @param {function(ErrMsg)} options.success - 失败回调 
   */
  downloadFile({cloudpath,success,fail}){
    console.log('hhh')
    wx.cloud.init();
    wx.cloud.downloadFile({
      fileID:cloudpath,
      success:(res)=>{
        success(res.tempFilePath);
      },
      fail:console.log
    })  
  }

  getFileType(filename){
    let suffix = getSuffix(filename);
    if(is_image(suffix)){
      return 'image';
    }else if(is_doc(suffix)){
      return 'doc';
    }else if(is_video(suffix)){
      return 'video';
    }else{
      return '';
    }
  }

  /**
   * 支持doc,image的预览，不支持video
   */
  preview({
    path,
    success = ()=>{},
    fail = ()=>{}
  }){
    let suffix = getSuffix(path);
    console.log(suffix);
    if(is_image(suffix)){
      wx.cloud.downloadFile({
        fileID:path
      }).then(res=>{
        wx.previewImage({
          urls: [res.tempFilePath],
          fail(res){
            console.log(res);
          }
        })
      })
    }else if(is_doc(suffix)){
      wx.cloud.downloadFile({
        fileID:path
      }).then(res=>{
        wx.openDocument({
          filePath: res.tempFilePath,
          fail(res){
            console.log(res)
          }
        })
      })
    }else{
      fail({
        errMsg:'不支持预览的文件类型'
      })
    }
  }



  _dataChanged() {
    this.onHistoryListChange(this._getData())
  }

  _setup(onHistoryListChange, onFail) {
    this.onHistoryListChange = onHistoryListChange;
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
   * 拉取20条历史浏览数据并入当前数组
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
      lastTimestamp = data[data.length - 1].createTime;
    } else {
      lastTimestamp = new Date()
    }
    const db = wx.cloud.database();
    const _ = db.command;
    const historydb = db.collection('history');
    historydb.where({
      createTime: _.lt(lastTimestamp)
    }).orderBy('createTime', 'desc')
      .get().then(res => {
        this._data = this._getData().concat(res.data);
        this._fetching = false;
        this._dataChanged();
      }).catch(res => {
        this._fetching = false;
        onFail(res);
      })
  

  }

  /**
   * 用户删除自己的某项历史浏览记录
   * @param {string} histroy 待删除的历史记录ID
   */
  remove(historyId) {
    const db = wx.cloud.database();
    const historydb = db.collection('history');

    historydb.doc(historyId)
    .remove().then(res => {
      let data = this._getData();
      for (var i = 0; i < data.length; i++) {
        if (data[i]._id == historyId) {
          data.splice(i, 1);
          break;
        }
      }
      this._dataChanged();
    }).catch(this.onFail)
  }


}
/**
 * @typedef File
 * @property {string} _id - 文件ID 
 * @property {date} createTime - 文件创建时间
 * @property {boolean} isImage - 是否为图片
 * @property {string} filename - 文件名
 * @property {string} cloudpath - 文件云文件ID
 * @property {number} size - 文件大小，单位字节
 */

/**
 * @typedef ErrorMsg
 * @property {string} errMsg - 错误信息
 * @property ...
 */

function is_image(suffix) {
  let regex = /^.(jpg|jpeg|png|bmp|BMP|JPG|PNG|JPEG)$/
  return regex.test(suffix.toLowerCase());
}



/**
 * 生成UUID
 * @return {string} 生成的UUID
 */
function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

/**
 * 获取格式化的当前时间
 * @return {string}
 */
function getNowFormatDate() { //author: meizz
  var date = new Date();
  var fmt='yyyy-MM-dd hhmmss';   
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
 * 获取文件名的后缀
 * @param {string} filename 文件名
 * @return {string} 返回文件名后缀
 */
function getSuffix(filename){
  let dotIndex = filename.lastIndexOf('.');
  if(dotIndex==-1){
    return '';
  }
  return filename.substr(dotIndex)
}

/**
 * 封装promise
 */
function getFileInfo(filePath){
  return new Promise((resolve,reject)=>{
    wx.getFileInfo({
      filePath: filePath,
      success:resolve,
      fail:reject
    })
  });
}
/**
 * 提供用户私有目录相关服务
 * {@link DirectoryService~fetch} 拉取更多目录数据
 * {@link DirectoryService~upload} 上传文件
 * {@link DirectoryService~rename} 重命名文件
 * {@link DirectoryService~remove} 移除文件
 */
export default class DirectoryService{
  /**
   * @constructor
   * @param {Object} option
   * @param {function(Array<File>)} option.onFileListChange - 函数调用成功修改数据后的监听器
   * @param {function(ErrorMsg)} option.onFail - 函数调用失败的监听器
   */
  constructor({
    onFileListChange,
    onFail
  }){
    // console.log(1);
    this._setup(onFileListChange,onFail);
    wx.cloud.init();
    this._fetching = false;
  }

  _fileChanged() {
    this.onFileListChange(this._getData())
  }

  _setup(onFileListChange,onFail){
    this.onFileListChange = onFileListChange;
    this.onFail = onFail
    return this;
  }

  setFilter(filter){
    this.filter = filter;
  }

  _getData() {
    if (this._data == undefined || this._data == null) {
      this._data = [];
    }
    return this._data;
  }
 
  /**
   * 用户重命名自己的某项文件
   * @param {Object} option
   * @param {string} option.fileId - 待命名的文件ID
   * @param {string} option.filename - 新文件名
   */
  rename( { fileId,filename } ){
    const db = wx.cloud.database();
    const filedb = db.collection('file');
    let isImage = is_image(getSuffix(filename));
    filedb.doc(fileId).update({
      data:{
        filename,
        isImage
      }
    }).then(res=>{
      let data = this._getData();
      for (var i = 0; i < data.length; i++) {
        if (data[i]._id == fileId) {
          data[i].filename = filename;
          break;
        }
      }
      this._fileChanged();
    }).catch(this.onFail);
  }

  /**
   * 拉取20条文件数据并入当前数组
   */
  fetch(){
    if(this._fetching){
      this.onFail({
        errMsg:'请等待上次的查询'
      })
      return;
    }
    this._fetching = true;
    let data = this._getData();
    let lastTimestamp = null;
    if(data.length!=0){
      lastTimestamp = data[data.length-1].createTime;
    }else{
      lastTimestamp = new Date()
    }
    const db = wx.cloud.database();
    const _ = db.command;
    const filedb = db.collection('file');
    filedb.where({
      createTime: _.lt(lastTimestamp)
    }).orderBy('createTime','desc').get()
    .then(res=>{
      this._data = data.concat(res.data);
      this._fetching = false;
      this._fileChanged();
    })
    .catch(res=>{
      this._fetching = false;
      this.onFail(res);
    });
  }

  /**
   * 用户删除自己的某项文件
   * @param {string} fileId 待删除的文件ID
   */
  remove( fileId ){
    const db = wx.cloud.database();
    const filedb = db.collection('file');

    filedb.doc(fileId).remove()
    .then(res=>{
      let data = this._getData();
      for(var i=0;i<data.length;i++){
        if(data[i]._id==fileId){
          data.splice(i,1);
          break;
        }
      }
      this._fileChanged();
    })
    .catch(this.onFail)
  }

  /**
   * 上传一个文件，有多个请调用多次
   * @param {string} filePath - 文件路径
   */
  upload(filePath){ 

    let suffix = getSuffix(filepath);
    let fileID = generateUUID();

    const db = wx.cloud.database();
    const filedb = db.collection('file');

    getFileInfo(filePath)
    .then(res => {
      let fileSize = res.size;
      return wx.cloud.uploadFile({
        cloudPath: fileID + suffix,
        filePath: filePath
      });
    }).then(res=>{
      return filedb.add({
        data: {
          filename: getNowFormatDate() + suffix,
          cloudPath: res.fileID,
          isImage:is_image(suffix),
          createTime: db.serverDate(),
          size: fileSize
        }
      })
    }).then(res=>{
      return filedb.doc(res._id).get();
    }).then(res=>{
      this._getData().unshift(res.data);
      this._fileChanged();
    }).
    catch(this.onFail);
  }
}
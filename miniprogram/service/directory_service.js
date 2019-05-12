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

export default class DirectoryService{
  constructor(){
    wx.cloud.init();
    this.db = wx.cloud.database();
    this.fetching = false;
  }
  setFilter(filter){
    this.filter = filter;
  }

  getData() {
    if (this.data == undefined || this.data == null) {
      this.data = [];
    }
    return this.data;
  }
 
  /**
   * 用户重命名自己的某项文件
   * @param {Object} option
   * @param {string} option.fileId 待命名的文件ID
   * @param {string} option.filename 新文件名
   * @param {function(Array)} option.success 响应成功的回调函数，参数为更新后的文件列表
   * @param {function(Object)} option.fail
   */
  rename({
    fileId,
    filename,
    success = (res)=>{},
    fail = (res)=>{}}
    ){
    const db = wx.cloud.database();
    const filedb = db.collection('file');
    var that = this;
    filedb.doc(fileId).update({
      data:{
        filename
      },
      success(res) {
        let data = that.getData();
        for (var i = 0; i < data.length; i++) {
          if (data[i]._id == fileId) {
            data[i].filename=filename;
            break;
          }
        }
        success(data);
      },
      fail
    })
  }

  /**
   * 拉取20条文件数据并入当前数组
   * @param {Object} option
   * @param {function(Array)} option.success 响应成功的回调函数，参数为更新后的文件列表
   * @param {function(Object)} option.fail
   */
  fetch({
    success = (res)=>{},
    fail = (res)=>{}
  }){
    var that = this;
    let data = this.getData();
    let lastTimestamp = null;
    if(data.length!=0){
      lastTimestamp = data[data.length-1].createTime;
    }else{
      lastTimestamp = new Date()
    }
    const db = wx.cloud.database();
    const _ = db.command;
    const filedb = db.collection('file');
    console.log(lastTimestamp)
    filedb.where({
      createTime: _.lt(lastTimestamp)
    }).orderBy('createTime','desc').get({
      success(res){
        that.data = data.concat(res.data);
        success(that.data);
      },
      fail
    })
  }

  /**
   * 用户删除自己的某项文件
   * @param {Object} option
   * @param {string} option.fileId 待删除的文件ID
   * @param {function(Array)} option.success 响应成功的回调函数，参数为更新后的文件列表
   * @param {function(Object)} option.fail
   */
  remove({
    fileId,
    success = (res) => { },
    fail = (res) => { } 
    }){
    const db = wx.cloud.database();
    const filedb = db.collection('file');
    var that = this;
    filedb.doc(fileId).remove({
      success(res){
        let data = that.getData();
        for(var i=0;i<data.length;i++){
          if(data[i]._id==fileId){
            data.splice(i,1);
            break;
          }
        }
        success(data);
      },
      fail
    })
  }

  /**
   * 上传一个文件，有多个请调用多次
   * @param {Object} option
   * @param {string} option.filepath - 文件路径
   * @param {function(Array)} option.success 响应成功的回调函数，参数为更新后的文件列表
   * @param {function(Object)} option.fail 
   */
  upload({
    filepath,
    success = (res) => { },
    fail = (res) => { }
    }){

    var that = this;  

    let suffix = getSuffix(filepath);
    let fileID = generateUUID();

    wx.cloud.uploadFile({
      // 指定上传到的云路径
      cloudPath: fileID+suffix,
      // 指定要上传的文件的小程序临时文件路径
      filePath: filepath,
      // 成功回调
      success: res => {
        const db = wx.cloud.database();
        const filedb = db.collection('file');
        const createTime = db.serverDate();
        filedb.add({
          data:{
            filename:getNowFormatDate()+suffix,
            cloudpath: fileID+suffix,
            createTime:createTime
          },
          success:(res)=>{
            filedb.doc(res._id).get({
              success(res){
                that.getData().unshift(res.data);
                success(that.data);
              },
              fail(res){
                console.log(res)
              }
            })
          },
          fail
        })
      },
      fail
    })
  }
}
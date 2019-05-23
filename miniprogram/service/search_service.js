/**
 * @typedef ShareInfo
 * @property {string} _id - 分享的ID
 * @property {Array<{_id:string,filename:string}>} files - 一批文件的ID 
 * @property {date} createTime - 文件创建时间
 * @property {string} name - 分享名称
 * @property {string} remark - 分享说明
 * @property {string} nickname - 分享人
 * @property {string} avatar - 分享人头像链接
 * @property {number} comment - 评论数量
 * @property {number} score - 评论分数和
 */

/**
 * @typedef ErrorMsg
 * @property {string} errMsg - 错误信息
 * @property ...
 */

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
 * 搜索服务，提供设置搜索关键词setFilter及拉取数据接口fetch
 */
export default class SearchService {
 
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

  _getData() {
    if (this._data == undefined || this._data == null) {
      this._data = [];
    }
    return this._data;
  }

  /**
   * 设置搜索关键词，会清空已有数据
   * @param {string} filter - 搜索关键词
   */
  setFilter(filter){
    this.filter = filter;
    this._data = [];
  }

  getFilter(){
    if(this.filter==undefined||this.filter==null){
      return '';
    }
    return this.filter;
  }

 
  /**
   * 拉取20条数据并入当前数组,会沿用上次设置的搜索关键词
   */
  fetch() {
    let filter = this.getFilter();
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
    const sharedb = db.collection('share');

    sharedb.where({
      pub:true,
      createTime: _.lt(lastTimestamp),
      name:{
        $regex:'.*'+filter+".*",
        $options:'i'
      }
    }).orderBy('createTime', 'desc')
    .get()
    .then(res => {
      for(var i of res.data){
        i.time = formatDate(i.createTime);
      }
      this._fetching = false;
      if (this.getFilter() === filter) {
        this._data = this._getData().concat(res.data);
        this._dataChanged();
      }
    }).catch(res => {
      this._fetching = false;
      this.onFail(res);
    })   
  }

}
/**
 * 搜索服务，提供设置搜索关键词setFilter及拉取数据接口fetch
 */

export default class SearchService {
 
  constructor() {
    this.fetching = false;
    wx.cloud.init();
  }

  getData() {
    if (this.data == undefined || this.data == null) {
      this.data = [];
    }
    return this.data;
  }

  /**
   * 设置搜索关键词，会清空已有数据
   * @param {string} filter - 搜索关键词
   */
  setFilter(filter){
    this.filter = filter;
    this.data = [];
  }

  getFilter(){
    if(this.filter==undefined||this.filter==null){
      return '';
    }
    return this.filter;
  }

 
  /**
   * 拉取20条数据并入当前数组,会沿用上次设置的搜索关键词
   * @param {Object} option
   * @param {function(Array)} option.success 响应成功的回调函数，参数为更新后的文件列表
   * @param {function(Object)} option.fail
   */
  fetch({
    success = (res) => { },
    fail = (res) => { }
  }) {
    let filter = this.getFilter();
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
    const sharedb = db.collection('share');
    console.log(filter)
    sharedb.where({
      createTime: _.lt(lastTimestamp),
      name:{
        $regex:'.*'+filter+".*",
        $options:'i'
      }
    }).orderBy('createTime', 'desc').get({
      success(res) {
        if(that.getFilter()==filter){
          that.data = that.data.concat(res.data);
          success(that.data);
        }
        that.fetching = false;
      },
      fail(res) {
        fail(res);
        that.fetching = false;
      }
    })

  }

}
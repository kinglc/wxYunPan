// miniprogram/pages/search/search.js
import SearchService from '../../service/search_service.js'
const app = getApp();
var service = new SearchService({
  onShareListChange: () => { },
  onFail: () => { }
});
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value:'',
    choose: true,
    active: 0,
    // icon: {
    //   normal: '../../images/save-cloud.png',
    //   active: '../../images/save-cloud.png'
    // },
    // select: [false,false,false],
    
    list:[
      // { _id :1, 
      //   files: [{ _id :1, filename: "文件1", isImage: false, size: 1, cloudpath: "www"}, 
      //    { _id: 2, filename: "文件2", isImage: false, size: 1, cloudpath: "www" }], 
      //   time: 18888888,
      //   name:"第一个分享", 
      //   remark:"分享说明", 
      //   nickname:"分享人",
      //   avatar:"../../images/user-unlogin.png",
      //   comment : 8,
      //   score : 5
      // },
      // {
      //   _id: 2,
      //   files: [{ _id: 1, filename: "文件1", isImage: false, size: 1, cloudpath: "www" },
      //   { _id: 2, filename: "文件2", isImage: false, size: 1, cloudpath: "www" }],
      //   time: 18888888,
      //   name: "第二个分享",
      //   remark: "分享说明",
      //   nickname: "分享人",
      //   avatar: "../../images/user-unlogin.png",
      //   comment: 8,
      //   score: 5
      // },
      // {
      //   _id: 3,
      //   files: [{ _id: 1, filename: "文件1", isImage: false, size: 1, cloudpath: "www" },
      //     { _id: 2, filename: "文件2", isImage: false, size: 1, cloudpath: "www" }],
      //   time: 18888888,
      //   name: "第二个分享",
      //   remark: "分享说明",
      //   nickname: "分享人",
      //   avatar: "../../images/user-unlogin.png",
      //   comment: 8,
      //   score: 5
      // }
    ],
  },
  
  // 时间戳转时间
  formatDate(inputTime) {
    var date = new Date(inputTime);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
  },

  // 绑定搜索框值
  onChange(e){
    this.setData({
      value:e.detail
    })
  },
  // 点击搜索
  onSearch(e) {
    console.log(this.data.value);
    service = new SearchService({
      onShareListChange: (shareInfo) => {
          // var tmp=[];
          // for(var i=0;i<shareInfo.length;i++){
          //   shareInfo[i]["createTime"] = formatDate(shareInfo[i]["createTime"]);
            // tmp[i]=false;
          // }
          console.log(shareInfo)
          this.setData({
            list: shareInfo,
            // select: tmp
          });
        },
      onFail: () => { }
    });
    service.setFilter(this.data.value);
    service.fetch();
  },


  // 点击搜索结果
  turn(e) {
    // console.log('aaaa');
    console.log(e.currentTarget.dataset.id);
    wx.navigateTo({
      url: '../comment/comment?shareId=' + e.currentTarget.dataset.id
    })
  },

  // // 存到云盘
  // saveToCloud(){

  // },

  // // 点击选择
  // changeSwitch() {
  //   var tmp = this.data.choose;
  //   this.setData({
  //     choose: !tmp
  //   });
  // },
  // // 选择文件
  // onSelect(e){
  //   var tmp = this.data.select[e.target.dataset.index]
  //   var str = "select["+e.target.dataset.index+"]"
  //   this.setData({
  //     [str]:!tmp
  //   })
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
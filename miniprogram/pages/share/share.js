// miniprogram/pages/share/share.js
import ShareService from '../../service/share_service.js'
const app = getApp();
var service = new ShareService({
  onShareListChange:() => { },
  onFail:() => { }
});
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value: '',
    choose: true,
    active: 0,
    radio: 0,

    list: [
      // {
      //   _id: 1,
      //   files: [{ _id: 1, filename: "文件1", isImage: false, size: 1, cloudpath: "www" },
      //   { _id: 2, filename: "文件2", isImage: false, size: 1, cloudpath: "www" }],
      //   createTime: 18888888,
      //   name: "第一个分享",
      //   remark: "分享说明",
      //   nickname: "分享人",
      //   avatar: "../../images/user-unlogin.png",
      //   comment: 8,
      //   score: 5,
      //   pub:false,
      //   pub_color:""
      // },
      // {
      //   _id: 2,
      //   files: [{ _id: 1, filename: "文件1", isImage: false, size: 1, cloudpath: "www" },
      //   { _id: 2, filename: "文件2", isImage: false, size: 1, cloudpath: "www" }],
      //   createTime: 18888888,
      //   name: "第二个分享",
      //   remark: "分享说明",
      //   nickname: "分享人",
      //   avatar: "../../images/user-unlogin.png",
      //   comment: 8,
      //   score: 5,
      //   pub:true
      // },
      // {
      //   _id: 3,
      //   files: [{ _id: 1, filename: "文件1", isImage: false, size: 1, cloudpath: "www" },
      //   { _id: 2, filename: "文件2", isImage: false, size: 1, cloudpath: "www" }],
      //   createTime: 18888888,
      //   name: "第二个分享",
      //   remark: "分享说明",
      //   nickname: "分享人",
      //   avatar: "../../images/user-unlogin.png",
      //   comment: 8,
      //   score: 5,
      //   pub:false
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
  // 点击分享信息
  turn(e) {
    wx.navigateTo({
      url: '../comment/comment?shareId=' + e.currentTarget.dataset.id
    })
  },
  // 点击选择
  changeSwitch() {
    var tmp = this.data.choose;
    this.setData({
      choose: !tmp
    });
  },
  // 选择文件
  onChange(e) {
    this.setData({
      radio:+e.detail //下标
    })
  },
  //再次分享
  onShareAppMessage(res){
    if (res.from === 'button') {
    }
    return {
      title: '您的阿爸分享给你',
      path: 'pages/comment/comment?shareId=' + this.data.radio,
      imageUrl: this.data.list[this.data.radio]["avatar"],
      success: (res) => {
        console.log("分享成功", res);
      },
      fail: (res) => {
        console.log("分享失败", res);
      }
    }
  },
  //取消分享
  onCancel(){
    var shareId = this.data.list[this.data.radio]["_id"];
    console.log(shareId)
    service.remove(shareId);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    service = new ShareService({
      onShareListChange: (shareInfo) => {
        // for (var i = 0; i < shareInfo.length; i++) {
          // shareInfo[i]["createTime"] = formatDate(shareInfo[i]["createTime"]);
        // }
        console.log(shareInfo)
        this.setData({
          list: shareInfo
        });
      },
      onFail: (a) => {
        console.log(a)
       }
    });
    service.fetch();
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
})
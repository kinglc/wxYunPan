// miniprogram/pages/history/history.js
import FileService from '../../service/file_service.js'
var fs = new FileService({
  onHistoryListChange: () => { },
  onFail: () => { }
});
Page({

  /**
   * 页面的初始数据
   */
  data: {
    files: [],
    nofile:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var that = this;
      fs = new FileService({
        onFileListChange: (res) => {
          console.log(res);
          that.setData({ files: res });
        },
        onFail: (res) => {
          console.log('res'); 
          }
      });
      fs.fetch();
      if(this.data.files==''){
        this.setData({nofile:true});
      }
      console.log(this.data.nofile);
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

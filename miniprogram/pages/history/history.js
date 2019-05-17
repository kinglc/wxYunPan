// miniprogram/pages/history/history.js
import DirectoryService from '../../service/directory_service.js'
const directory = new DirectoryService()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    files: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var that = this;
      directory.fetch({
        success: function (res) {
          console.log(res);
          that.setData({ files: res });
        },
        fail: function (res) {
          console.log(res);
          wx.showToast("获取失败，请检查网络设置");
        }
      });
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

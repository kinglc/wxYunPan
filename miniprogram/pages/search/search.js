// miniprogram/pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value: '',
    choose: true,
    active: 0,
    icon: {
      normal: 'save-cloud.png',
      active: 'save-cloud.png'
    },
    select: [],
    list: [
      { fileName: '文件1', fileTime: '2019-04-29 00:00', usr: '用户1' },
      { fileName: '文件2', fileTime: '2019-04-29 00:00', usr: '用户2' },
      { fileName: '文件3', fileTime: '2019-04-29 00:00', usr: '用户3' }
    ],
  },

  changeSwitch() {
    var tmp = this.data.choose;
    this.setData({
      choose: !tmp
    });
  },

  turn() {
    wx.navigateTo({
      url: '../index/index',
    })
  },

  saveToCloud() {

  },

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
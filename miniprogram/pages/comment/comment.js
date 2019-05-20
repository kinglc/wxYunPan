// miniprogram/pages/comment/comment.js
import CommentService from '../../service/comment_service.js'
// const comment=new CommentService({
//   shareId:'asdasd',
//   onCommentListChange:console.log,
//   onFail:console.log
// }) 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    share:{score:1},
    imgsrc:'../../images/file.png',
    comments:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('bbbb');
    let shareId = options.shareId;
    console.log(shareId);
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

  },

  /**
   * 评价按钮
   */
  comment:function(e){

  },

  /**用户点击写评论按钮 */
  writeComment:function(e){
      wx.navigateTo({
          url: '../writeComment/writeComment',
      })
  }
})

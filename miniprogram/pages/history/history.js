// miniprogram/pages/history/history.js
import FileService from '../../service/file_service.js'
var fs = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    files: [],
    nofile:false,
    show:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var that = this;
      fs = new FileService({
        onHistoryListChange: (res) => {
          console.log(res);
          that.setData({ files: res });
        },
        onFail: (res) => {
          console.log('res'); 
          }
      });
      fs.fetch();
      // if(this.data.files==''){
      //   this.setData({nofile:true});
      // }
      // console.log(this.data.nofile);
  },
  
  delete:function(e){
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定删除此记录？',
      success(res) {
        if (res.confirm) {
            fs.remove(e.currentTarget.dataset.id);
            wx.showToast({
              title: '删除成功',
            })
            that.setData({ show: false });
          }
        }
    });  
  }
})
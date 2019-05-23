//index.js
// let regeneratorRuntime = require("../../utils/regenerator-runtime/runtime");
import DirectoryService from '../../service/directory_service.js'
const app = getApp();
var directory = new DirectoryService({
  onFileListChange:() =>{},
  onFail: () =>{}
});
const page = new Page({
  data: {
    avatarUrl: '../../images/user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    files:[],
  },

  onLoad: function () {
    // wx.navigateTo({
    //   url: '../comment/comment',
    // })
    var that = this;
    directory = new DirectoryService({
      onFileListChange: (res) => {
        console.log(res);
        that.setData({ files: res });
      },
      onFail: (res) => {
        console.log(res);
     }
    });
    directory.fetch();

    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log(res.userInfo);
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function (e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onReachBottom(){
    console.log('a');
    directory.fetch();
  },

  turn:function(e){
    var param = e.currentTarget.dataset.url;
    app.globalData.myfile=this.data.files;
    wx.navigateTo({
        url: '../' + param + '/' + param
    })
  },

  upfile: function (res) {
    var time = res.tempFiles.length*400;
    for (var i = 0; i < res.tempFiles.length; i++) {
      var path = res.tempFiles[i].path;
      console.log(path);
      directory.upload({
        filePath: path,
        success: function (res) {
          console.log(res);
        },
        fail: function (res) {
          console.log(res);
        }
      });
    }
    setTimeout(function () {
      wx.navigateTo({
        url: '../../pages/index/index',
      });
      wx.showToast({
        title: '上传成功',
      });
      },time)
  },


  update:function(){
    var that = this;
    wx.chooseMessageFile({
      count:10,
      type:'all',
      success(res){
        console.log(res);
        wx.showLoading({
          title: '上传中',
        });
        setTimeout(that.upfile(res), 500);
      },
      fail(res){
        console.log(res);
      }
    });
  }

})
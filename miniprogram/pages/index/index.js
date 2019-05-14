//index.js
import DirectoryService from '../../service/directory_service.js'
const app = getApp()
const directory = new DirectoryService()
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },

  onLoad: function () {
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

  turn:function(e){
    var param = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: '../' + param + '/' + param,
    })
  }

  // upload(){
  //   wx.chooseImage({
  //     success: function(res) {
  //       directory.upload({
  //         filepath:res.tempFilePaths[0],
  //         success(res){
  //           console.log(res)
  //         },
  //         fail:console.log
  //       })
  //     },
  //   })
  // },
  // fetch(){
  //   directory.fetch({
  //     success:console.log,
  //     fail:console.log
  //   })
  // },
})
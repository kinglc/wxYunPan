//index.js
// let regeneratorRuntime = require("../../utils/regenerator-runtime/runtime");
import DirectoryService from '../../service/directory_service.js'
const app = getApp();
var directory = null;
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
    var that = this;
   

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
            },
            fail: function (res) {
              console.log(res);
              wx.showToast({
                title: '网络错误，请稍后重试',
                icon:'none',
              })
            }
          })
        }
        else {
          wx.redirectTo({
            url: '../../pages/welcome/welcome',
          })
        }
      },
      fail:(res) => {
        console.log(res);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
        })
      }
    })
  },

  onShow() {
    directory = new DirectoryService({
      onFileListChange: (res) => {
        console.log(res);
        this.setData({ files: res });
        app.globalData.myfile = this.data.files;
      },
      onFail: (res) => {
        console.log(res);
      }
    });
    directory.fetch();
  },

  onReachBottom(){
    directory.fetch();
  },

  turn:function(e){
    var param = e.currentTarget.dataset.url;
    if(param=='index'){
      this.onLoad();
    }
    else{
      wx.navigateTo({
          url: '../' + param + '/' + param
      })
    }
  },

  upfile: function (r) {
    console.log(r);
    let cnt = 0;
    wx.showLoading({
      title: '上传中',
    });
    new Promise((resolve, reject) => {
      for (var i = 0; i < r.tempFiles.length; i++) {
        var path = r.tempFiles[i].path;
        directory.upload({
          filePath: path,
          success:(res)=>{
            console.log(res);
            cnt++;
            if(cnt==r.tempFiles.length){
              console.log(path);
              console.log(i);
              resolve(res);
            }
          },
          fail:(res)=>{
            console.log(res);
            reject("");
          }
        });
      }
    }).then((res) => {
      wx.showToast({
        title: '上传成功',
      });
      // this.setData({files:[]});
      // this.onLoad();
    }).catch(console.log)
  },

  update:function(){
    new Promise((success, fail) => {
            wx.chooseMessageFile({
              count: 10,
              type: 'all',
              success,
              fail,
            });
        }).then((r) => {
          console.log('Done: ' + r);
          this.upfile(r);
        }).catch((r) => {
          wx.showToast({
            title: '上传失败，请检查网络',
            icon:'none'
          })
          console.log('Failed: ' + r);
        });
  }

})
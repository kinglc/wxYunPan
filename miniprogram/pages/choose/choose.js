// miniprogram/pages/choose/choose.js
import DirectoryService from '../../service/directory_service.js'
import ShareService from '../../service/share_service.js'


var app = getApp();
var directory = new DirectoryService({
  onFileListChange: () => { },
  onFail: () => { }
});
var share = new ShareService({
  onShareListChange:() => { },
  onFail:() => { }
});

Page({

  /**
   * 页面的初始数据
   */
  data: {
    files:[],
    len:app.globalData.multiLen,
    showShare:false,
    shareName:'',
    shareRemark:'',
    pub:true,
    shareId:'',
    showPersonal:false,
    con:false,
  },

  turn: function () {
    wx.redirectTo({
      url: '../../pages/index/index',
    })
  },

  changeNum:function(){
    this.setData({len:app.globalData.multiLen});
  },
  
  delete: function () {
    if(app.globalData.multiLen==0){
      wx.showToast({
        title: '请选择文件',
      });
    }
    else {
      var that = this;
      console.log(app.globalData.multiId);
      wx.showModal({
        title: '提示',
        content: '确定删除这'+app.globalData.multiLen+'项文件？',
        success(res) {
          if (res.confirm) {
            for (var i = 0; i < that.data.files.length && app.globalData.multiLen!=0; i++) {
              if (app.globalData.multiId[i] == true) {
                console.log('a');
                app.globalData.multiLen--;
                directory.remove(that.data.files[i]._id);
              }
            }
            setTimeout(function(){
              wx.showToast({
                title: '删除成功',
              });
              wx.redirectTo({
                url: '../../pages/index/index',
              })
            },app.globalData.multiLen*500);
          }
        }
      })
    }
  },

  showShare: function () {
    if (app.globalData.multiLen > 0 && app.globalData.multiLen <= 20) {
      this.setData({
        showShare: true,
      });
    }
    else {
      wx.showToast({
        title: '请选择1-20个文件',
        icon: 'none',
      })
    }    
  },

  closeShare: function () {
    this.setData({ showShare: false });
  },

  closePersonal:function(){
    this.setData({showPersonal:false});
  },

  input1: function (e) {
    this.setData({ shareName: e.detail.value });
  },

  input2: function (e) {
    this.setData({ shareRemark: e.detail.value });
  },

  share:function(){
  if (this.data.shareName == '') {
      wx.showToast({
        title: '请输入分享组名',
        icon: 'none',
        });
      this.showShare();
    }
    else{
      var fileIds=[];
      var that = this;
      var j = 0;
      for (var i = 0; i < that.data.files.length; i++) {
        if (app.globalData.multiId[i] == true) {
          console.log(that.data.files[i]._id);
          fileIds[j]=that.data.files[i]._id;
          j++;
        }
      }
      share.share({
        fileIds:fileIds,
        name:that.data.shareName,
        remark:that.data.shareRemark,
        pub:that.data.pub,
        success: function (res) {
          console.log(res);
          that.setData({shareId:res._id});
          that.setData({
            shareName:'',
            shareRemark:'',
          });
          if(that.data.pub==true){
            wx.showToast({
              title: '分享成功',
            });
            wx.redirectTo({
              url: '../../pages/share/share',
            })    
          }
          else {
            that.setData({showPersonal:true});
          }
        },
        fail:function(res){
          console.log(res);
          wx.showToast({
            title: '分享失败',
            icon:'none',
          })
        }
      })
    }
  },

  setPersonal: function () {
    if(app.globalData.multiLen>0&&app.globalData.multiLen<20){
      this.setData({ 
        pub: false,
        showShare:true, 
      });
    }
    else{
      wx.showToast({
        title: '请选择1-20个文件',
        icon:'none',
      })
    }
  },

  selectall:function(){
    var flag;
    if(this.data.files.length==app.globalData.multiLen){
      flag = false;
      app.globalData.multiLen=0;
    }
    else{
      flag = true;
      app.globalData.multiLen = this.data.files.length;
    }
    for(var i = 0;i<this.data.files.length;i++){
      this.myComponent = this.selectComponent('#myCom'+i);
      this.myComponent.setSelected(flag);
    }
    this.changeNum();
  },

  onShareAppMessage: function (res) {
    var that = this;
    wx.redirectTo({
      url: '../../pages/share/share',
    })
    return {
      title: '您的好友给您分享文件',
      path: 'pages/comment/comment?shareId=' + that.data.shareId,
      imageUrl: '../../images/logo.png',
      success: (res) => {
        console.log(res);
      },
      fail: (res) => {
        console.log(res);
      }
    };
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.setData({
      files:app.globalData.myfile,
    })
    console.log(this.data.files);
    var that = this;
    directory = new DirectoryService({
      onFileListChange: (res) => {
        console.log(res);
        that.setData({ files: res });
      },
      onFail: console.log,
    });
    share = new ShareService({
      onShareListChange: (res) => {
        console.log(res);
        // that.setData({ files: res });
      },
      onFail: console.log,
    });
  }, 
  
  onReachBottom() {
    directory.fetch();
  },
})
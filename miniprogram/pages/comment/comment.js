// miniprogram/pages/comment/comment.js
import CommentService from '../../service/comment_service.js'
import ShareService from '../../service/share_service.js'
import FileService from '../../service/file_service.js'
var comment = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shareId:'',
    share:{},
    comments:[],
    showWrite:false,
    value:'',
    avgscore:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({ shareId: options.shareId})   
    console.log('shareId:'+that.data.shareId);
    ShareService.getShareInfo({
      shareId:that.data.shareId,
      success:function(res){
        console.log(res);
        var tmp = res.data;
        if (tmp.remark==""){
          tmp.remark='暂无描述';
        }
        if (tmp.comment == 0) {
          that.setData({
            share: tmp,
            avgscore: 0,
          });
        }
        else{
          var score = tmp.score/tmp.comment;
          console.log(score);
          score = score.toFixed(1);
          console.log(score);
          that.setData({
            share: tmp,
            avgscore:score,
          });
        }
      },
      fail: function (res) {
        console.log(res);
      }
    });
    comment = new CommentService({
      shareId: that.data.shareId,
      onCommentListChange:(res) => {
        console.log(res);
        that.setData({comments:res})
       },
      onFail:(res) => {
        console.log(res);
        wx.showToast({
          title: res.errMsg,
          icon:'none',
        })
       }
    });
    comment.fetch();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    comment.fetch();
  },

  download:function(){
    var files = this.data.share.files;
    for(var i = 0;i<files.length;i++){
        comment.save({
          fileId:files[i]._id,
          success:function(res){
            console.log(res);
            wx.showLoading({
              title: '保存中',
            })
            setTimeout(function () {
              wx.showToast({
                title: '保存成功',
              })
              wx.redirectTo({
                url: '../../pages/index/index',
              })
            }, files.length * 500);
          },
          fail: function (res) {
            console.log(res);
            wx.showToast({
              title: res,
              icon:'none',
            })
          },
      })
    };
  
  },

  showWrite:function(){
    this.setData({showWrite:true});
  },

  closeWrite: function () {
    this.setData({ showWrite: false });
  },


  input:function(e){
    this.setData({ value: e.detail.value});
  },

  submit:function(){
    this.myComponent = this.selectComponent('#score');
    var that = this;
    console.log(that.data.value);
    new Promise(function(resolve,reject){
      comment.comment({
        comment: that.data.value,
        score: that.myComponent.getScore(),
      });
      resolve();
    }).then(()=>{
      this.setData({
        comments:[],
        showWrite:false,
        score:0,
        value:'',
      })
      this.onLoad(); 
    }).catch(()=>{
      wx.showToast({
        title: '评论失败',
        icon:'none',
      })
    })
  },

  onReachBottom(){
    comment.fetch();
  }
})

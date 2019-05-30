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
    focus:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({ shareId: options.shareId})   
    console.log('shareId:'+that.data.shareId);
    this.setScore();
    comment = new CommentService({
      shareId: that.data.shareId,
      onCommentListChange:(res) => {
        console.log(res);
        that.setData({ comments: res });
        this.setScore();
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

  setScore:function(){
    var that = this;
    ShareService.getShareInfo({
      shareId: that.data.shareId,
      success: function (res) {
        console.log(res);
        var tmp = res.data;
        if (tmp.remark == "") {
          tmp.remark = '暂无描述';
        }
        if (tmp.comment == 0) {
          that.setData({
            share: tmp,
            avgscore: 0,
          });
        }
        else {
          var score = tmp.score / tmp.comment;
          console.log(score);
          score = score.toFixed(1);
          console.log(score);
          that.setData({
            share: tmp,
            avgscore: score,
          });
        }
      },
      fail: function (res) {
        wx.showToast({
          title: res.errMsg,
          icon:'none',
        })
        console.log(res);
      }
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    comment.fetch();
  },

  download:function(){
    var files = this.data.share.files;
    console.log(files);
    var cnt = 0;
    wx.showLoading({
      title: '保存中',
    });
    new Promise((resolve,fail)=>{
      for(var i = 0;i<files.length;i++){
          comment.save({
            file:files[i],
            success:function(res){
              console.log(res);
              cnt++;
              if(cnt==files.length){
                resolve(res);
              }
            },
            fail: function (res) {
              console.log(res);
              wx.showToast({
                title: res.errMsg,
                icon:'none',
              })
            },
        })
    };
    }).then((res)=>{
      wx.showToast({
        title: '保存成功',
      })
      wx.redirectTo({
        url: '../../pages/index/index',
      })
    });
  
  },

  showWrite:function(){
    this.setData({showWrite:true});
  },

  closeWrite: function () {
    this.setData({ showWrite: false });
  },

  changeFocus: function () {
    this.setData({ focus: true });
  },

  input:function(e){
    this.setData({ value: e.detail.value});
  },

  submit:function(){
    this.myComponent = this.selectComponent('#score');
    var that = this;
    if (that.data.value == '' ||that.myComponent.getScore==0){
      wx.showToast({
        title: '请输入内容或评分',
        icon:'none',
      })
    }
    else{
      console.log(that.data.value);
        comment.comment({
          comment: that.data.value,
          score: that.myComponent.getScore(),
        });
        this.setData({
          showWrite:false,
          score:0,
          value: '',
          focus: true,
        });
    }
  },

  onReachBottom(){
    comment.fetch();
  }
})

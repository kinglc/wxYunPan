// components/fileList/fileList.js
import DirectoryService from '../../service/directory_service.js'
import FileService from '../../service/file_service.js'
var app = getApp();

const directory = new DirectoryService({
  onFileListChange :console.log,
  onFail:console.log
})
const fs = new FileService({
  onHistoryListChange:() => { },
  onFail: () => { }
});
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    file:{
      type:Object,
      value: {}
    }
  },

  attached(){
    var suffix = this.data.file.filename.split('.')[1];
    this.setData({
      filename:this.data.file.filename,
      createTime:this.data.file.time,
    })
    if (this.data.file.isImage){
      this.setData({
        imgsrc:this.data.file.cloudpath
      })
    }
    if(this.dataset.type=='select'){
      this.setData({showSelect:true});
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showPop:false,
    showRename:false,
    newName:'',
    filename:'',
    imgsrc:'../../images/file.png',
    show:true,
    showSelect:false,
    createTime:'',
    checked:false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showPop: function () {
      if (this.dataset.type=="pop"){
          this.setData({ showPop:true});
      }
      else if(this.dataset.type=='delete'){
          this.delete();
      }
    },

    setSelected:function(param){
      this.setData({checked:param});
    },

    closePop: function () {
      this.setData({ showPop: false });
    },

    showRename:function(){
      this.closePop();
      this.setData({ showRename: true });
    },

    closeRename: function () {
      this.setData({ showRename: false });
    },

    input: function (e) {
      this.setData({ newName: e.detail.value });
    },

    rename: function (e) {
      if (this.data.newName == '') {
        wx.showToast({
          title: '请输入名称',
          icon: 'none',
        });
        this.showRename();
      }
      else{
        var that = this;
        var newname = that.data.newName + '.' + this.data.file.filename.split('.')[1];
        directory.rename({
          fileId: that.data.file._id,
          filename: newname
        });
        that.setData({ filename: newname });
      }
    },

    delete:function(){
      var that=this;
      wx.showModal({
        title: '提示',
        content: '确定删除此文件？',
        success(res) {
          if (res.confirm) {
            if(that.dataset.type=="delete"){
              fs.remove(that.data.file.historyId);
            }
            else if(that.dataset.type=="pop"){
              directory.remove(that.data.file._id);
            }
            that.setData({show:false});
          } 
        }
      })
    },

    onChange: function (e) {
      this.setData({
        checked: e.detail
      });
      console.log(this.dataset.index);
      if (this.data.checked == true) {
        app.globalData.multiId[this.dataset.index] = true;
        app.globalData.multiLen++;
      }
      else {
        app.globalData.multiId[this.dataset.index] = false;
        app.globalData.multiLen--;
      }
      this.triggerEvent('changeNum');
    },

    funfile:function(){
      if(this.dataset.type=='history'){
        //////////////////////
      }
      else if(this.dataset.type=='pop'){
        this.preview();
      }
    },

    preview:function(){
      var that=this;
      // console.log(that.data.file.cloudpath);
      fs.preview({
        path:that.data.file.cloudpath,
        success:(res)=>{
          console.log(res);
          },
        fail: (res) => { 
          console.log(res); 
          wx.showToast({
            icon: 'none',
            title: res.errMsg,
          })}
      })
    },

  //   download:function(){
  //     var that = this;
  //     fs.downloadFile({
  //       cloudpath:that.data.file.cloudpath,
  //       success:(res)=>{
  //         console.log(res);
  //         wx.showToast("下载成功！");
  //         that.closePop();
  //       },
  //       fail: (res) => {
  //         console.log(res);
  //         wx.showToast("下载失败！");
  //         that.closePop();
  //       },
  //     })
  // }

  }
})

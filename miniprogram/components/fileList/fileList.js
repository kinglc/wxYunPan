// components/fileList/fileList.js
import DirectoryService from '../../service/directory_service.js'
import FileService from '../../service/file_service.js'

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
    createTime:''
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
      var that = this;
      var newname = that.data.newName + '.' + this.data.file.filename.split('.')[1];
      directory.rename({
        fileId: that.data.file._id,
        filename: newname
      });
      that.setData({ filename: newname });
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

    funfile:function(){
      if(this.dataset.type=='select'){
        console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      }
      else{
        this.preview();
      }
    },

    preview:function(){
      var that=this;
      fs.preview({
        path:that.data.file.cloudPath,
        success:(res)=>{console.log(res)},
        fail: (res) => { console.log(res) }
      })
    },

    download:function(){
      var that = this;
      fs.downloadFile({
        cloudpath:'cloud://wxyunpan-936858.7778-wxyunpan-936858/0d398854-edcf-49b3-8425-f6b815a2dde7.png',
        success:(res)=>{
          console.log(res);
          wx.showToast("下载成功！");
        },
        fail: (res) => {
          console.log(res);
          wx.showToast("下载失败！")
        },
      })
  }

  }
})

// components/fileList/fileList.js
import DirectoryService from '../../service/directory_service.js'
const directory = new DirectoryService()
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

  /**
   * 组件的初始数据
   */
  data: {
    showPop:false,
    showRename:false,
    newName:'',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showPop: function () {
      if (this.dataset.pop=="true")
        this.setData({ showPop:true});
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

    rename:function(e){
      var suffix = this.data.file.filename.split('.')[1];
      console.log(suffix);
      directory.rename({
        fileId:this.data.file._id,
        filename:this.data.newName+'.'+suffix,
        success: function (res) {
           console.log(res);
           wx.navigateTo({
           url: '../../pages/index/index',
         });
        },
        fail:function (res) {
         console.log(res);
         wx.showToast("重命名失败，请检查网络设置");
        }
      });
    },

    delete:function(){
      var that=this;
      wx.showModal({
        title: '提示',
        content: '确定删除此文件？',
        success(res) {
          if (res.confirm) {
            directory.remove({
              fileId: that.data.file._id,
              success: function (res) {
                console.log(res);
                wx.navigateTo({
                  url: '../../pages/index/index',
                });
               },
              fail: function (res) { 
                console.log(res);
                wx.showToast("删除失败，请检查网络设置");
              },
            });
          } 
        }
      })
    }

  }
})

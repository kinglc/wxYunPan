// components/fileList/fileList.js
import DirectoryService from '../../service/directory_service.js'
const app = getApp()
const directory = new DirectoryService()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    files:{
      type:Object,
      value:[1,2,3]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  onLoad:function() {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {


  }
})

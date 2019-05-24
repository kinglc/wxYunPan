// components/iconInfo/iconInfo.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    name: {
      type: String,
      value: ''
    },
    info: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  attached(){
    this.setData({ color: this.dataset.color});
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})

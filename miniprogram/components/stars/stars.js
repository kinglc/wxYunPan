// components/stars/stars.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    colors: [],
    size:'30px',
  },

  attached(){
    this.change(this.dataset.score);
    if (this.dataset.type == "read"){
      this.setData({size:'25px'});
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeColor:function(e){
      if(this.dataset.type=="write"){
        this.change(e.currentTarget.dataset.pt);
      }
    },

    change:function(param){
      var color = [];
      var i = 0
      for (; i < param; i++) {
        color[i] = '#FF9800';
      }
      for (; i < 5; i++) {
        color[i] = '#9D9D9D';
      }
      this.setData({ colors: color });
    },

    getScore:function(){
      var i;
      for(i = 0;i<5;i++){
        if (this.data.colors[i] =="#9D9D9D")
        break;
      }
      return i;
    },

  }
})

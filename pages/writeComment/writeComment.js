// miniprogram/pages/writeComment.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        inputTitle:"type something here...",
        inputContent:"type something here..."
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    /**
     * 用户点击标题输入框
     */
    titleGetFocus:function(e){
        this.setData({
            inputTitle: ''
        })
    },
    // /**输入框失去焦点 */
    // loseFocus:function(e){
    //     if(this.data.inputTitle.length==0){
    //         this.setData({
    //             inputTitle:'type something here...'
    //         })
    //     }
    // }
    contentGetFocus: function (e) {
        this.setData({
            inputContent: ''
        })
    },
    /**取消按钮 */
    cancel:function(e){
        wx.navigateTo({
            url: '../comment/comment',
        })
    },
    /**提交按钮 */
    submit:function(e){
        wx.showToast({
            title: '待实现',
        })
    }
})

//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    avatar1: './user-unlogin.png',
    avatar2: './user-unlogin.png',
    avatar3: './user-unlogin.png',
    avatar4: './user-unlogin.png',
  
    race :[0,0,0,0],

    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    url: 'https://www.fangkemi.xyz/api/v1/',
    // url:"http://127.0.0.1:8000/api/v1/",
  },

  onLoad: function() {
    var _this = this
    // this.getFamilyMember(3,444)

    let clientHeight = wx.getSystemInfoSync().windowHeight;
    let clientWidth = wx.getSystemInfoSync().windowWidth;
    let changeHeight = 750 / clientWidth;
    let height = clientHeight * changeHeight;
    this.setData({
      height: height
    })
    console.log("height:",this.data.height)

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log("avatar", res.userInfo.avatarUrl)
              let id = wx.getStorageSync("id")
              _this.setData({logged:true})

              _this.getFamilyMember(id, res.userInfo.avatarUrl,_this)

                  _this.setData({
                    avatarUrl: res.userInfo.avatarUrl,
                    userInfo: res.userInfo,
                    logged: true,
                  })
              
            }
          })
        }
      }
    })
  },
  onShow: function() {
    var _this = this
    setInterval(function() {
      console.log('doSomething')
      _this.getAllScore()
   }, 1000);
  },

  onGetUserInfo: function(e) {
    console.log("auth",e)
    if (!this.data.logged && e.detail.userInfo) {  
      let id = e.currentTarget.dataset.id
      wx.setStorageSync("id", e.currentTarget.dataset.id )
      this.setAvatar(id, e.detail.userInfo.avatarUrl,this)

      this.getFamilyMember(e.currentTarget.dataset.id, e.detail.userInfo.avatarUrl,this)
      this.setData({
        id : e.currentTarget.dataset.id,
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },
  setAvatar: function(id, avatar,_this) {
    console.log("setAvatar id",id,avatar)
    switch (id) {
      case "1":
        _this.setData({ avatar1: avatar });
        break
      case "2":
        _this.setData({ avatar2: avatar });
        break
      case "3":
        _this.setData({ avatar3: avatar });
        break
      case "4":
        _this.setData({ avatar4: avatar })
        break
      }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  getFamilyMember: function(id,avatarUrl,_this) {
    // var _this = this
    wx.request({
      url: this.data.url + 'get_families',
      data:{
        id:id,
        avatar:avatarUrl,
        openid: avatarUrl,
        nickname: id,
      },
      success (res) {
        console.log(res)
        console.log(res.data.data)
        let familyList = res.data.data
        familyList.forEach(element => {
          var avatar = element.Avatar
          console.log(element.Id, avatar)
          switch (element.Id) {
            case 1:
              _this.setData({ avatar1: avatar });
              break
            case 2:
              _this.setData({ avatar2: avatar });
              break
            case 3:
              _this.setData({ avatar3: avatar });
              break
            case 4:
              _this.setData({ avatar4: avatar })
          }
        })
        //获取数量列表
        
      }
    })
  },
  getAllScore: function() {
    var _this = this
    wx.request({
      url: this.data.url + 'get_all_score',
      data: {
        id: wx.getStorageSync("id"),
        avatar: this.data.avatarUrl,
      },
      success (res) {
         console.log("getScore",res)
         let lists = res.data.data.lists
         let race = res.data.data.race     
         console.log("getScore", lists, race)
         _this.setData({
           race:race,
           lists:lists,
           toIndex: "s"+lists.length
         }) 
      }
    })
  },
  bindOnformSubmit: function(e) {
    var _this = this
    console.log("bindOnformSubmit",e,e.detail.value.content)
    let score = e.detail.value.content
    let id = wx.getStorageSync('id')
    
    wx.request({
      url: this.data.url + 'add_score',
      data:{
        id: id,
        score: score,
        openid:this.data.avatarUrl,
      },
      success (res) {
        console.log(res)
        console.log(res.data.data)
        _this.setData({
          content: ""
      })
      }
    })
  }, 

  

})

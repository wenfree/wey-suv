//index.js
//获取应用实例
const app = getApp();
var extra = require('extra.js');

Page({
  data: {
    scrollTop: 0,
    pageInfos: [],
    gender: [],
    provinces: [],
    citys: [],
    shops: [],
    shopsId: [],
    windowHeight: 0,
    windowWidth: 0,
    lawText: '',
    hideLawDesc: true,
    selGender: 0,
    selProv: 0,
    selCity: 0,
    selSsss: 0,

    // 下面是请求信息
    name: '',// 姓名
    phone: '',// 电话
    genderText: '请选择',// 性别
    provText: '请选择',// 省份
    cityText: '请选择',// 城市
    ssss: '请选择',// 经销商
    ssssid : "",// 经销商id
    apply: true,// 同意法律声明

    // 图片更新信息
    now:Date.now(),
    imgUrl:'https://wenfree.cn/api/Public/idfa_xianyu/?service=Wey.Img'
  },
  onLoad: function () {
    //第一时间读出图片信息
    console.log(this.data.imgUrl)
    var self = this;
    wx.request({
      url: this.data.imgUrl,
      method: 'get',
      success: function (res) {
        console.log("取到图片数据",res.data.data)
        self.setData({ pageInfos: res.data.data });
      },
      fail: function (err) {
        self.setData({ 
          pageInfos: extra.dataInfos,
        })
      }
    }),

    console.log('onload');
    var self = this;
    var sysInfo = wx.getSystemInfoSync();
    console.log(sysInfo);
    this.setData({ 
      // pageInfos: extra.dataInfos, 
      gender: extra.gender, 
      windowHeight: sysInfo.windowHeight,
      windowWidth: sysInfo.windowWidth,
      lawText: extra.lawDesc
    });

    wx.request({
      url: extra.apiUrls[0],
      method: 'get',
      success: function(res){
        console.log("省", res);
        var provinces = [];
        for (var i in res.data) {
          provinces.push(res.data[i].sh_province);
        }
        self.setData({ provinces: provinces});
        wx.request({
          url: extra.apiUrls[1] + provinces[0],
          method: 'get',
          success: function(res){
            console.log("城市",res);
            var citys = [];
            for(var i in res.data){
              citys.push(res.data[i].sh_city);
            }
            self.setData({citys: citys});
            wx.request({
              url: extra.apiUrls[2] + citys[0],
              method: 'get',
              success: function(res){
                console.log("经销商",res);
                var shops = [];
                var shopsId = [];
                for (var i in res.data) {
                  shops.push(res.data[i].sh_serviceStoreName);
                  shopsId.push(res.data[i].sh_number);
                }
                self.setData({shops: shops});
                self.setData({shopsId: shopsId});
              },
              fail: function(err){
                wx.showToast({
                  title: '获取经销商信息失败！',
                  icon: 'none'
                });
              }
            });
          },
          fail: function(err){
            wx.showToast({
              title: '获取城市信息失败！',
              icon: 'none'
            });
          }
        });
      },
      fail: function(err){
        wx.showToast({
          title: '获取省份信息失败！',
          icon: 'none'
        });
      },
    });
    // 查询用ip
  },
  OnShowLawDesc: function(e){
    this.setData({ hideLawDesc: !this.data.hideLawDesc});
  },
  onInput: function(e){
    var name = e.target.dataset.name;
    var value = e.detail.value;
    this.setData({[name]: value});
    console.log(name, value);
  },
  onPick: function(e){
    var self = this;
    var name = e.target.dataset.name;
    var value = parseInt(e.detail.value);
    this.setData({ [name]: value });
    if(name=='selProv'){
      var key = this.data.provinces[value];
      this.setData({ selProv: value, provText: key});
      wx.request({
        url: extra.apiUrls[1] + key,
        method: 'get',
        success: function (res) {
          console.log(res);
          var citys = [];
          for (var i in res.data) {
            citys.push(res.data[i].sh_city);
          }
          self.setData({ citys: citys });
          wx.request({
            url: extra.apiUrls[2] + citys[0],
            method: 'get',
            success: function (res) {
              console.log(res);
              var shops = [];
              var shopsId = [];
              for (var i in res.data) {
                shops.push(res.data[i].sh_serviceStoreName);
                shopsId.push(res.data[i].sh_number);
              }
              self.setData({ shops: shops });
              self.setData({ shopsId: shopsId });
            },
            fail: function (err) {
              wx.showToast({
                title: '获取经销商信息失败！',
                icon: 'none'
              });
            }
          });
        },
        fail: function (err) {
          wx.showToast({
            title: '获取城市信息失败！',
            icon: 'none'
          });
        }
      });
    }
    if(name=='selCity'){
      this.setData({cityText: this.data.citys[value]});
      wx.request({
        url: extra.apiUrls[2] + this.data.citys[value],
        method: 'get',
        success: function (res) {
          console.log(res);
          var shops = [];
          var shopsId = [];
          for (var i in res.data) {
            shops.push(res.data[i].sh_serviceStoreName);
            shopsId.push(res.data[i].sh_number);
          }
          self.setData({ shops: shops });
          self.setData({ shopsId: shopsId });
        },
        fail: function (err) {
          wx.showToast({
            title: '获取经销商信息失败！',
            icon: 'none'
          });
        }
      });
    }
    if(name == 'selGender'){
      this.setData({ genderText: this.data.gender[value] });
    }
    if (name == 'selSsss') {
      console.log("--------------------------");
      console.log(value);
      this.setData({ ssss: this.data.shops[value] });
      this.setData({ ssssid: this.data.shopsId[value] });
    }
    console.log("c", e, name, value, this.data.ssssid);
  },
  onCheck: function(e){
    this.setData({apply: !this.data.apply});
    console.log('apply', this.data.apply);
  },
  onSubmit: function(e){
    var params = {
      ssss: this.data.ssssid,
      ssssname: this.data.ssss,
      name: this.data.name,
      phone: this.data.phone,
      gender: this.data.genderText,
      province: this.data.provText,
      city: this.data.cityText,
    };
    if(!this.data.apply){
      wx.showToast({
        title: '请您阅读并接受个人信息保护法律声明',
        icon: 'none',
        mask: true,
        duration: 2000,
      });
      return;
    }
    console.log(params);
    wx.request({
      url: 'https://wenfree.cn/api/Public/idfa_xianyu/?service=Wey.crm',// 请求的URL
      method: 'get',
      data: params,
      success: function(res){
        console.log("success",res);
        if (res.data.ret == 200 ){
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            mask: true,
            duration: 2000,
          });
        }else{
          console.log("success", "fail");
        }
      },
      fail: function(err){
        console.log("fail",err);
        wx.showToast({
          title: '提交失败',
          icon: 'fail',
          mask: true,
          duration: 2000,
        });
      },
      complete: function (res) {
        console.log("complete",res);
      },
    });
  },
  // 监听滚动条坐标
  onPageScroll: function (e) {
    //console.log(e)
    var that = this
    console.log('当前存储的scrollTop->', that.data.scrollTop);
    var scrollTop = e.scrollTop
//当滚动的top值最大或者最小时，为什么要做这一步是由于在手机实测小程序的时候会发生滚动条回弹，所以为了解决回弹，设置默认最大最小值   
    if (e.scrollTop <= 0) {
      e.scrollTop = 0;
    }

    if (e.scrollTop > this.data.scrollTop || e.scrollTop == wx.getSystemInfoSync().windowHeight) {
      console.log('向下滚动');
      // console.log('向下滚动->', scrollTop);
      // if (scrollTop - that.data.scrollTop > 50 && scrollTop - that.data.scrollTop < 52 ){
      //   console.log('下滑一页');
      //   this.upPage();
      // }

    } else {
      console.log('向上滚动');
      // console.log('向上滚动->', scrollTop);
      // console.log('差值->', scrollTop - that.data.scrollTop);
      // if (scrollTop - that.data.scrollTop < -50 && scrollTop - that.data.scrollTop > -52 ) {
      //   console.log('上滑一页');
      //   this.upDown();
      // }
    }
  },
  // 上滑一页
  upPage: function (e){
    //给scrollTop重新赋值   
    var new_scrollTop = this.data.scrollTop + this.data.windowHeight
    wx.pageScrollTo({
      scrollTop: new_scrollTop
    })
    this.setData({ scrollTop: new_scrollTop });
  },
  // 下滑一页
  upDown: function () {
    var new_scrollTop = this.data.scrollTop - this.data.windowHeight
    wx.pageScrollTo({
      scrollTop: new_scrollTop
    })
    this.setData({ scrollTop: new_scrollTop });
  },

  // 滚动到顶部
  onTop: function () {
    // 控制滚动
    wx.pageScrollTo({
      scrollTop: wx.getSystemInfoSync().windowHeight*2*0
    })
  },

  // 转发
  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: 'WEYSUV预约试驾',
      path: '/pages/index/index',
      imageUrl: 'https://img.wenfree.cn/wey/share_img.jpg'
    }
  },

})

import Vue from 'vue'
import Router from 'vue-router'
import Friends from '@/components/Friends'
import Setting from '@/components/Setting'
import Login from '@/components/Login'
import Register from '@/components/Register'
import SearchUser from '@/components/SearchUser'
import ScanQrcode from '@/components/ScanQrcode'
import MyQrcode from '@/components/MyQrcode'
import Speaker from '@/components/Speaker'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: '首页',
      redirect: '/friends/friends'
    },
    {
      path: '/login',
      name: '登录',
      component: Login
    },
    {
      path: '/register',
      name: '注册',
      component: Register
    },
    {
      path: '/friends/:type',
      name: '好友列表',
      component: Friends
    },
    {
      path: '/user/search/:type/:user_id',
      name: '用户搜索',
      component: SearchUser
    },
    {
      path: '/setting',
      name: '设置',
      component: Setting
    },
    {
        path: '/qrcode/scan',
        name: '扫码',
        component: ScanQrcode
    },
    {
        path: '/qrcode/my',
        name: '我的二维码',
        component: MyQrcode
    },
    {
      path: '/speaker/:type/:user_id',
      name: '视频通话',
      component: Speaker
    },
  ]
})

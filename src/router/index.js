import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/index'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {path:'/login', component:()=>import('@/views/login/LoginPage.vue')},
    {path:'/', component:()=>import('@/views/layout/LayoutContainer.vue'),
      redirect:'/article/manage',
      children:[
        {path:'article/manage', component:()=>import('@/views/article/ArticleManage.vue')},
        {path:'article/channel', component:()=>import('@/views/article/ArticleChannel.vue')},
        {path:'user/avatar', component:()=>import('@/views/user/UserAvatar.vue')},
        {path:'user/password', component:()=>import('@/views/user/UserPassword.vue')},
        {path:'user/profile', component:()=>import('@/views/user/UserProfile.vue')}
      ]
    },

  ]
})
router.beforeEach((to) => {
  const userStore = useUserStore()
  if (to.path === '/login') return
  // 无 token，跳转登录
  if (!userStore.token) {
    return '/login'
  }
  // 客户端检查 token 是否过期
  try {
    const payload = JSON.parse(atob(userStore.token.split('.')[1]))
    console.log(Date.now()/1000, payload.exp)
    if (payload.exp * 1000 < Date.now()) {
      ElMessage.error('登录过期，请重新登录')
      userStore.removeToken()
      return '/login'
    }
  } catch {
    // token 格式异常，也清掉
    userStore.removeToken()
    return '/login'
  }
})

export default router 

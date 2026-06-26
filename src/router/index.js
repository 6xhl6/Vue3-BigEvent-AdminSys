import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/index'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
  if (to.path !== '/login' && !userStore.token) {
    return '/login'
  }
})

export default router 

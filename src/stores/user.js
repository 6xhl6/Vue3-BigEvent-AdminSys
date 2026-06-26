import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfoService } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const setToken = (newToken) => {
    token.value = newToken
  }
  const removeToken = () => {
    token.value = ''
  }
  const user = ref({})
  const getUser = async () => {
    const res = await getUserInfoService()
    user.value = res.data.data
  }
  const setUser = (newUser) => {
    user.value = newUser
  }
  const resetUser = () => {
    user.value = {}
  }

  return {
    token,
    setToken,
    removeToken,
    user,
    setUser,
    getUser,
    resetUser
  }
},{
    persist: true
}
)
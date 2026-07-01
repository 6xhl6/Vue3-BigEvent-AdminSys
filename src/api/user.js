import request, { cacheManager } from '@/utils/request'

export const userRegisterService = ({username, password, repassword}) => {
  return request({
    url: '/api/reg',
    method: 'post',
    data: {
      username,
      password,
      repassword
    }
  })
}
export const userLoginService = ({username, password}) => {
  return request({
    url: '/api/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}
export const getUserInfoService = () => {
  return request({
    url: '/my/userinfo',
    method: 'get'
  })
}
export const updateUserInfoService = async (data) => {
  const res = await request({
    url: '/my/userinfo',
    method: 'put',
    data
  })
  // 更新用户信息后，用户信息缓存失效
  cacheManager.invalidate('/my/userinfo')
  return res
}
export const uploadAvatarService = async (avatar_string) => {
  const res = await request({
    url: '/my/update/avatar',
    method: 'patch',
    data:{
      avatar: avatar_string
    }
  })
  cacheManager.invalidate('/my/userinfo')
  return res
}
export const updatePasswordService = (data) => {
  return request({
    url: '/my/updatepwd',
    method: 'patch',
    data
  })
}
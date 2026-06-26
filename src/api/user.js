import request from '@/utils/request'

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
export const updateUserInfoService = (data) => {
  return request({
    url: '/my/userinfo',
    method: 'put',
    data
  })
}
export const uploadAvatarService = (avatar_string) => {
  return request({
    url: '/my/update/avatar',
    method: 'patch',
    data:{
      avatar: avatar_string
    }
  })
}
export const updatePasswordService = (data) => {
  return request({
    url: '/my/updatepwd',
    method: 'patch',
    data
  })
}
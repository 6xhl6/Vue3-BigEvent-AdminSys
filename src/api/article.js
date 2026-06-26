import request from '@/utils/request'

export const getArticleChannelList = () => {
  return request({
    url: '/my/cate/list',
    method: 'get'
  })
}
export const delArticleChannel = (id) => {
  return request({
    url: `/my/cate/del`,
    method: 'delete',
    params: {
      id
    }
  })
}
export const updateArticleChannel = (data) => {
  return request({
    url: '/my/cate/info',
    method: 'put',
    data
  })
}
export const addArticleChannel = (data) => {
  return request({
    url: '/my/cate/add',
    method: 'post',
    data
  })
}
export const getArticleChannelDetail = (id) => {
  return request({
    url: `/my/cate/info`,
    method: 'get',
    params: {
      id
    }
  })
}
export const getArticleList = (params) => {
  return request({
    url: '/my/article/list',
    method: 'get',
    params
  })
}
export const addArticle = (data) => {
  request.defaults.headers.post['Content-Type'] = 'multipart/form-data'
  return request({
    url: '/my/article/add',
    method: 'post',
    data
  })
}
export const updateArticle = (data) => {
  return request({
    url: '/my/article/info',
    method: 'put',
    data
  })
}
export const deleteArticle = (id) => {
  return request({
    url: '/my/article/info',
    method: 'delete',
    params: {
      id
    }
  })
}
export const getArticleDetail = (id) => {
  return request({
    url: `/my/article/info`,
    method: 'get',
    params: {
      id
    }
  })
}

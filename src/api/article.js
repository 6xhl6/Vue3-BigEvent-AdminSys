import request, { cacheManager } from '@/utils/request'

export const getArticleChannelList = () => {
  return request({
    url: '/my/cate/list',
    method: 'get'
  })
}
export const delArticleChannel = async (id) => {
  const res = await request({
    url: `/my/cate/del`,
    method: 'delete',
    params: {
      id
    }
  })
  // 删除分类后，分类列表缓存失效
  cacheManager.invalidate('/my/cate')
  return res
}
export const updateArticleChannel = async (data) => {
  const res = await request({
    url: '/my/cate/info',
    method: 'put',
    data
  })
  cacheManager.invalidate('/my/cate')
  return res
}
export const addArticleChannel = async (data) => {
  const res = await request({
    url: '/my/cate/add',
    method: 'post',
    data
  })
  cacheManager.invalidate('/my/cate')
  return res
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
export const addArticle = async (data) => {
  // axios 检测到 FormData 会自动设置 Content-Type（含 boundary），无需手动指定
  const res = await request({
    url: '/my/article/add',
    method: 'post',
    data
  })
  // 新增文章后，文章列表缓存失效
  cacheManager.invalidate('/my/article')
  return res
}
export const updateArticle = async (data) => {
  const res = await request({
    url: '/my/article/info',
    method: 'put',
    data
  })
  cacheManager.invalidate('/my/article')
  return res
}
export const deleteArticle = async (id) => {
  const res = await request({
    url: '/my/article/info',
    method: 'delete',
    params: {
      id
    }
  })
  cacheManager.invalidate('/my/article')
  return res
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

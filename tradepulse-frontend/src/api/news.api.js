import axiosInstance from './axiosInstance'

const NEWS = '/api/news'

export const newsAPI = {
  getPosts:      (page = 1, limit = 20) => axiosInstance.get(`${NEWS}/posts?page=${page}&limit=${limit}`),
  createPost:    (data)                 => axiosInstance.post(`${NEWS}/posts`, data),
  likePost:      (id)                   => axiosInstance.post(`${NEWS}/posts/${id}/like`),
  unlikePost:    (id)                   => axiosInstance.delete(`${NEWS}/posts/${id}/like`),
  addComment:    (id, data)             => axiosInstance.post(`${NEWS}/posts/${id}/comment`, data),
  deletePost:    (id)                   => axiosInstance.delete(`${NEWS}/posts/${id}`),
  getTrending:   ()                     => axiosInstance.get(`${NEWS}/trending`),
  getCryptoNews: ()                     => axiosInstance.get(`${NEWS}/crypto-news`),
  searchPosts:   (query)                => axiosInstance.get(`${NEWS}/search?q=${query}`),
}

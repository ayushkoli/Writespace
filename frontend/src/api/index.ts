import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await api.post('/users/refresh-token');
        return api(error.config);
      } catch {
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: FormData) =>
    api.post('/users/register', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  login: (data: { email?: string; username?: string; password: string }) =>
    api.post('/users/login', data),
  logout: () => api.post('/users/logout'),
  getCurrentUser: () => api.get('/users/current-user'),
  updateAccount: (data: Partial<{ name: string; bio: string; age: number; country: string; website: string }>) =>
    api.patch('/users/update-account', data),
  updateProfilePhoto: (data: FormData) =>
    api.patch('/users/update-profile-photo', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getUserChannel: (username: string) => api.get(`/users/c/${username}`),
  getFollowers: (username: string) => api.get(`/users/c/${username}/followers`),
  getFollowing: (username: string) => api.get(`/users/c/${username}/following`),
  followUnfollow: (userId: string) => api.post(`/users/follow/${userId}`),
};

export const postApi = {
  getAllPosts: () => api.get('/posts'),
  getFollowingFeed: () => api.get('/posts/following'),
  createPost: (data: FormData) =>
    api.post('/posts/create', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getSavedPosts: () => api.get('/posts/saved'),
  getUserPosts: (userId: string) => api.get(`/posts/user/${userId}`),
  getPostById: (postId: string) => api.get(`/posts/${postId}`),
  updatePost: (postId: string, data: { title?: string; content?: string }) =>
    api.patch(`/posts/${postId}`, data),
  deletePost: (postId: string) => api.delete(`/posts/${postId}`),
  toggleLike: (postId: string) => api.post(`/posts/like/${postId}`),
  toggleSave: (postId: string) => api.post(`/posts/save/${postId}`),
  addComment: (postId: string, content: string) =>
    api.post(`/posts/comment/${postId}`, { content }),
  deleteComment: (postId: string, commentId: string) =>
    api.delete(`/posts/comment/${postId}/${commentId}`),
};

export default api;

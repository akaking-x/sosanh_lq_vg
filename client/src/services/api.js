import axios from 'axios'

const API_BASE_URL = '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Admin APIs
export const adminApi = {
  login: (credentials) => apiClient.post('/admin/login', credentials),
  getProfile: () => apiClient.get('/admin/profile'),
  getDashboard: () => apiClient.get('/admin/dashboard'),
  logout: () => {
    localStorage.removeItem('authToken')
    return Promise.resolve()
  },
}

// Hero APIs
export const heroApi = {
  getAll: (params) => apiClient.get('/heroes', { params }),
  getBySlug: (slug) => apiClient.get(`/heroes/${slug}`),
  create: (data) => apiClient.post('/heroes', data),
  update: (id, data) => apiClient.put(`/heroes/${id}`, data),
  delete: (id) => apiClient.delete(`/heroes/${id}`),
}

// Item APIs
export const itemApi = {
  getAll: (params) => apiClient.get('/items', { params }),
  getBySlug: (slug) => apiClient.get(`/items/${slug}`),
  create: (data) => apiClient.post('/items', data),
  update: (id, data) => apiClient.put(`/items/${id}`, data),
  delete: (id) => apiClient.delete(`/items/${id}`),
}

// Rune APIs
export const runeApi = {
  getAll: (params) => apiClient.get('/runes', { params }),
  getById: (id) => apiClient.get(`/runes/${id}`),
  create: (data) => apiClient.post('/runes', data),
  update: (id, data) => apiClient.put(`/runes/${id}`, data),
  delete: (id) => apiClient.delete(`/runes/${id}`),
}

// Summoner Skill APIs
export const skillApi = {
  getAll: (params) => apiClient.get('/skills', { params }),
  getById: (id) => apiClient.get(`/skills/${id}`),
  create: (data) => apiClient.post('/skills', data),
  update: (id, data) => apiClient.put(`/skills/${id}`, data),
  delete: (id) => apiClient.delete(`/skills/${id}`),
}

// Mapping APIs
export const mappingApi = {
  getAll: (params) => apiClient.get('/mappings', { params }),
  getById: (id) => apiClient.get(`/mappings/${id}`),
  create: (data) => apiClient.post('/mappings', data),
  update: (id, data) => apiClient.put(`/mappings/${id}`, data),
  delete: (id) => apiClient.delete(`/mappings/${id}`),
}

export default apiClient

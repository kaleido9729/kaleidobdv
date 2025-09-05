// src/utils/request.ts
import axios from 'axios'

const instance = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE || '/api',
  // baseURL: '',
  timeout: 10000
})

instance.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error('API Error:', err)
    return Promise.reject(err)
  }
)

export default instance

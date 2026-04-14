import axios from 'axios';
import { API_URL } from './config';

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur REQUEST : ajoute le token JWT automatiquement
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur RESPONSE : gère le token expiré (401)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {

      const refreshToken = localStorage.getItem('refreshToken') 
                        || sessionStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem('accessToken', accessToken);

          const remember = localStorage.getItem('rememberMe');
          if (remember) {
            localStorage.setItem('refreshToken', newRefreshToken);
          } else {
            sessionStorage.setItem('refreshToken', newRefreshToken);
          }

          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(error.config);

        } catch {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
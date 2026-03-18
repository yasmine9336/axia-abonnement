import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://localhost:7000/api',
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

      // ✅ Chercher dans les deux storages
      const refreshToken = localStorage.getItem('refreshToken') 
                        || sessionStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // ✅ Utiliser axios brut pour éviter la boucle infinie
          const response = await axios.post('https://localhost:7000/api/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem('accessToken', accessToken);

          // ✅ Sauvegarder dans le bon storage selon rememberMe
          const remember = localStorage.getItem('rememberMe');
          if (remember) {
            localStorage.setItem('refreshToken', newRefreshToken);
          } else {
            sessionStorage.setItem('refreshToken', newRefreshToken);
          }

          // Relancer la requête originale
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(error.config);

        } catch {
          // Refresh token expiré → déconnecter
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
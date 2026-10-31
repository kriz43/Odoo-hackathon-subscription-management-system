import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

api.interceptors.request.use((c) => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401 && !location.pathname.startsWith('/login')) {
      localStorage.removeItem('token');
      location.href = '/login'; // session expired
    }
    return Promise.reject(e);
  }
);
export const errMsg = (e: any): string =>
  e?.response?.data?.detail?.toString() ?? 'Something went wrong. Please try again.';
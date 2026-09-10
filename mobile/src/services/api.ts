import axios from 'axios';

// Base API URL (defaults to localhost:5000, customizable for physical device / emulator)
export const API_BASE_URL = 'http://localhost:5000/api/v1';

let userAuthToken: string | null = null;
let anonymousUserId: string = `guest_${Math.random().toString(36).substring(2, 11)}`;

export const setAuthToken = (token: string | null) => {
  userAuthToken = token;
};

export const getAnonymousId = () => anonymousUserId;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    if (userAuthToken) {
      config.headers.Authorization = `Bearer ${userAuthToken}`;
    }
    config.headers['x-anonymous-id'] = anonymousUserId;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

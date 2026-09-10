
import axios from 'axios';

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api/v1/admin',
  headers: {
    'Content-Type': 'application/json'
  }
});
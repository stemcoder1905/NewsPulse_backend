import axios from 'axios';

export const adminApi = axios.create({
  baseURL: 'http://localhost:5000/api/v1/admin',
  headers: {
    'Content-Type': 'application/json'
  }
});

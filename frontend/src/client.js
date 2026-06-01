import axios from 'axios'

export const BASE_URL = 'https://task-manager-fl7t.onrender.com/'

export const clientServer = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})
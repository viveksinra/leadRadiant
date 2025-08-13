import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000';

function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (_) {
    return 'UTC';
  }
}

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

axiosInstance.interceptors.request.use(async (config: AxiosRequestConfig) => {
  config.headers = config.headers || {};
  config.headers['X-Timezone'] = getTimezone();
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
  } catch (_) {}
  return config;
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response?.data as any;
    if (data && typeof data === 'object' && 'variant' in data) {
      return data;
    }
    return response as any;
  },
  (error) => {
    const message = error?.response?.data?.message || error?.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export async function get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await axiosInstance.get(url, config);
  const anyRes: any = res as any;
  return anyRes?.myData ?? (anyRes?.data ?? anyRes);
}

export async function post<T = any>(url: string, body?: any, config?: AxiosRequestConfig): Promise<T> {
  const res = await axiosInstance.post(url, body, config);
  const anyRes: any = res as any;
  return anyRes?.myData ?? (anyRes?.data ?? anyRes);
}



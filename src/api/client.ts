import { createApiClient } from '@b1nd/api-client';
import type { ApiClient } from '@b1nd/api-client';

const BASE_URL = import.meta.env.DEV ? '' : import.meta.env.VITE_API_URL;
const ACCESS_TOKEN_STORAGE_KEY = 'access_token';

const client = createApiClient(BASE_URL);

const getAccessToken = () => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

type RequestConfig = Parameters<ApiClient['get']>[1];

const withAuthHeader = (config: RequestConfig = {}): RequestConfig => {
    const token = getAccessToken();
    if (!token) return config;

    return {
        ...config,
        headers: {
            ...config.headers,
            Authorization: `Bearer ${token}`,
        },
    };
};

export const apiClient = {
    get: <T = unknown>(url: string, config?: RequestConfig) =>
        client.get<T>(url, withAuthHeader(config)),
    post: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
        client.post<T>(url, data, withAuthHeader(config)),
    put: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
        client.put<T>(url, data, withAuthHeader(config)),
    patch: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
        client.patch<T>(url, data, withAuthHeader(config)),
    delete: <T = unknown>(url: string, config?: RequestConfig) =>
        client.delete<T>(url, withAuthHeader(config)),
};
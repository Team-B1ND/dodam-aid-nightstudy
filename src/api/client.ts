import { createApiClient } from '@b1nd/api-client';
import type { ApiClient } from '@b1nd/api-client';

const BASE_URL = import.meta.env.DEV ? '' : import.meta.env.VITE_API_URL;
const OAUTH_BASE = import.meta.env.DEV ? '' : import.meta.env.VITE_API_URL;
const ACCESS_TOKEN_STORAGE_KEY = 'access_token';

const client = createApiClient(BASE_URL);

const initializeToken = async () => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const dodamToken = params.get('token');
    if (!dodamToken) return;

    try {
        const authorizeRes = await fetch(
            `${OAUTH_BASE}/oauth/authorize?response_type=code&client_id=${import.meta.env.VITE_CLIENT_ID}&redirect_uri=${encodeURIComponent(import.meta.env.VITE_REDIRECT_URI)}&scope=nightstudy:read%20nightstudy:write%20profile:read`,
            { headers: { Authorization: `Bearer ${dodamToken}` } }
        );
        const authorizeData = await authorizeRes.json();
        console.log('authorize 응답:', authorizeData);

        await exchangeToken(dodamToken);
    } catch (e) {
        console.error('OAuth 토큰 교환 실패:', e);
    }
};

const exchangeToken = async (dodamToken: string) => {
    const consentRes = await fetch(`${OAUTH_BASE}/oauth/authorize/consent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${dodamToken}`,
        },
        body: JSON.stringify({
            clientId: import.meta.env.VITE_CLIENT_ID,
            redirectUri: import.meta.env.VITE_REDIRECT_URI,
            scope: 'nightstudy:read nightstudy:write profile:read',
            approved: true,
        }),
    });
    const consentData = await consentRes.json();
    console.log('consent 응답:', consentData);

    const redirectUri = consentData.data.redirectUri;
    const code = new URL(redirectUri).searchParams.get('code');

    const tokenRes = await fetch(`${OAUTH_BASE}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code!,
            redirect_uri: import.meta.env.VITE_REDIRECT_URI,
            client_id: import.meta.env.VITE_CLIENT_ID,
            client_secret: import.meta.env.VITE_CLIENT_SECRET,
        }),
    });
    const tokenData = await tokenRes.json();
    console.log('token 응답:', tokenData);
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokenData.access_token);
};

export { initializeToken };

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
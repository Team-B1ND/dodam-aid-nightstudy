import { createApiClient } from '@b1nd/api-client';
import type { ApiClient, BaseResponse } from '@b1nd/api-client';
import { AuthError, getStatusCode, isAuthStatus } from './error';
import { getAccessToken, requestNewAccessToken } from './token';
import { isTokenExpired } from './jwt';

const BASE_URL = import.meta.env.DEV ? '' : import.meta.env.VITE_API_URL;

const client = createApiClient(BASE_URL);

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

/**
 * 401/403을 만나면 도담 앱에 토큰을 다시 요청한 뒤 한 번만 재시도한다.
 *
 * 이 앱은 앱이 URL 쿼리로 넘겨준 토큰 하나로만 인증하기 때문에,
 * 토큰이 만료되면 라이브러리의 쿠키 기반 refresh로는 복구되지 않는다.
 *
 * 이 서버는 토큰이 없거나 만료됐을 때도 403을 주기 때문에 상태 코드만으로는
 * "권한 없음"과 "세션 만료"를 구분할 수 없다. 그래서 토큰의 만료 시각을 직접 본다.
 * 토큰이 멀쩡한데 거부당했다면 재발급해봐야 소용없으므로 바로 권한 없음으로 본다.
 */
const withTokenRetry = async <T>(
    send: () => Promise<BaseResponse<T>>
): Promise<BaseResponse<T>> => {
    try {
        return await send();
    } catch (error) {
        if (!isAuthStatus(getStatusCode(error))) throw error;

        const previousToken = getAccessToken();

        if (isTokenExpired(previousToken) === false) {
            throw new AuthError('forbidden', { cause: error });
        }

        const token = await requestNewAccessToken();

        // 앱에서 새 토큰을 받지 못했으면 더 해볼 수 있는 게 없다
        if (!token || token === previousToken) {
            throw new AuthError('expired', { cause: error });
        }

        try {
            // 헤더는 요청 시점에 붙으므로 재시도에는 새 토큰이 실린다
            return await send();
        } catch (retryError) {
            throw new AuthError(
                getStatusCode(retryError) === 403 ? 'forbidden' : 'expired',
                { cause: retryError }
            );
        }
    }
};

export const apiClient = {
    get: <T = unknown>(url: string, config?: RequestConfig) =>
        withTokenRetry(() => client.get<T>(url, withAuthHeader(config))),
    post: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
        withTokenRetry(() => client.post<T>(url, data, withAuthHeader(config))),
    put: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
        withTokenRetry(() => client.put<T>(url, data, withAuthHeader(config))),
    patch: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
        withTokenRetry(() => client.patch<T>(url, data, withAuthHeader(config))),
    delete: <T = unknown>(url: string, config?: RequestConfig) =>
        withTokenRetry(() => client.delete<T>(url, withAuthHeader(config))),
};

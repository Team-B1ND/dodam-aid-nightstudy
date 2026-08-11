const ACCESS_TOKEN_STORAGE_KEY = 'access_token';

export const getAccessToken = () => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

export const setAccessToken = (token: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
};

/** 도담 앱(브리지)에 새 액세스 토큰을 요청하는 함수. 앱 밖(브라우저)에서는 등록되지 않는다. */
type AccessTokenRequester = () => Promise<string | null>;

let requester: AccessTokenRequester | null = null;
let inFlight: Promise<string | null> | null = null;

export const setAccessTokenRequester = (next: AccessTokenRequester | null) => {
    requester = next;
};

/**
 * 만료된 토큰을 앱에서 다시 받아온다.
 * 여러 요청이 동시에 401을 받아도 재발급 요청은 한 번만 나간다.
 */
export const requestNewAccessToken = () => {
    if (!requester) return Promise.resolve(null);

    inFlight ??= Promise.resolve()
        .then(() => requester?.() ?? null)
        // 앱 밖(브라우저)이거나 브리지가 실패해도 요청 흐름이 끊기지 않게 한다
        .catch(() => null)
        .finally(() => {
            inFlight = null;
        });

    return inFlight;
};

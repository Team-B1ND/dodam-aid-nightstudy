/** 시계 오차나 요청 왕복을 감안해 만료 직전이면 미리 만료된 것으로 본다 */
const EXPIRY_LEEWAY_SECONDS = 10;

const decodePayload = (token: string): Record<string, unknown> | null => {
    const payload = token.split('.')[1];
    if (!payload) return null;

    try {
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(base64)
                .split('')
                .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
                .join('')
        );

        const parsed: unknown = JSON.parse(json);
        return typeof parsed === 'object' && parsed !== null
            ? (parsed as Record<string, unknown>)
            : null;
    } catch {
        return null;
    }
};

/**
 * 액세스 토큰(JWT)의 만료 여부. 서명은 검증하지 않고 `exp`만 본다.
 * 토큰이 없거나 형식을 알 수 없으면 `null`을 돌려준다(판단 불가).
 */
export const isTokenExpired = (token: string | null): boolean | null => {
    if (!token) return true;

    const payload = decodePayload(token);
    const exp = payload?.exp;
    if (typeof exp !== 'number') return null;

    return exp - EXPIRY_LEEWAY_SECONDS <= Date.now() / 1000;
};

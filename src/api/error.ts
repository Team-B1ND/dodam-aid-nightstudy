/**
 * api-client는 실패 시 서버의 ErrorResponse({ status, message, code })로 reject 하고,
 * 응답 자체가 없을 땐 AxiosError를 그대로 넘긴다. 두 경우 모두에서 상태 코드를 꺼낸다.
 */
export const getStatusCode = (error: unknown): number | null => {
    if (typeof error !== 'object' || error === null) return null;

    const { status, response } = error as {
        status?: unknown;
        response?: { status?: unknown };
    };

    if (typeof status === 'number') return status;
    if (typeof response?.status === 'number') return response.status;
    return null;
};

/** 인증/인가 실패로 볼 수 있는 상태 코드. 이 서버는 토큰이 없을 때 403을 주기도 한다. */
export const isAuthStatus = (status: number | null) =>
    status === 401 || status === 403;

export type AuthFailure =
    /** 토큰이 만료됐거나 없어서 다시 받아와야 하는 경우 */
    | 'expired'
    /** 토큰은 멀쩡한데 심자 관리 권한이 없는 경우 */
    | 'forbidden';

export class AuthError extends Error {
    readonly reason: AuthFailure;

    constructor(reason: AuthFailure, options?: { cause?: unknown }) {
        super(
            reason === 'forbidden'
                ? '심자 관리 권한이 없어요.'
                : '로그인 정보가 만료됐어요.',
            options
        );
        this.name = 'AuthError';
        this.reason = reason;
    }
}

/** 인증/인가 때문에 실패한 요청이면 그 사유를, 아니면 null을 돌려준다 */
export const getAuthFailure = (error: unknown): AuthFailure | null =>
    error instanceof AuthError ? error.reason : null;

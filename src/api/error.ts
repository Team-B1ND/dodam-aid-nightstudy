/**
 * api-client는 실패 시 서버의 ErrorResponse({ status, message, code })로 reject 하고,
 * 응답 자체가 없을 땐 AxiosError를 그대로 넘긴다. 두 경우 모두에서 상태 코드를 꺼낸다.
 */
const getStatusCode = (error: unknown): number | null => {
    if (typeof error !== 'object' || error === null) return null;

    const { status, response } = error as {
        status?: unknown;
        response?: { status?: unknown };
    };

    if (typeof status === 'number') return status;
    if (typeof response?.status === 'number') return response.status;
    return null;
};

/** 권한 없는 계정(심자 관리 권한 미보유)으로 요청했을 때인지 여부 */
export const isForbiddenError = (error: unknown): boolean => {
    const status = getStatusCode(error);
    return status === 401 || status === 403;
};

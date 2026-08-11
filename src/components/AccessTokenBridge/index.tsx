import { useEffect, useRef } from 'react';
import { useBridgeProvider } from '@b1nd/aid-kit/bridge-kit/web';
import { setAccessToken, setAccessTokenRequester } from '../../api/token';

/** 앱이 응답하지 않을 때 무한정 기다리지 않도록 하는 제한 시간 */
const TOKEN_REQUEST_TIMEOUT_MS = 5_000;

type Resolve = (token: string | null) => void;

/**
 * 브리지 응답은 `{ id, type, success, data }` 봉투로 오고, SYNC로 밀린 응답은
 * `{ flag, req, data }` 형태다. 토큰이 어느 깊이에 들어오든 찾아낸다.
 */
const extractAccessToken = (payload: unknown, depth = 0): string | null => {
    if (depth > 3) return null;
    if (typeof payload === 'string') return payload || null;
    if (typeof payload !== 'object' || payload === null) return null;

    const record = payload as Record<string, unknown>;
    if (record.success === false) return null;

    const direct = record.accessToken ?? record.access_token ?? record.token;
    if (typeof direct === 'string' && direct) return direct;

    return 'data' in record ? extractAccessToken(record.data, depth + 1) : null;
};

/**
 * 토큰이 만료됐을 때 도담 앱에 새 토큰을 요청하는 통로를 API 계층에 등록한다.
 * 앱이 URL 쿼리로 넘겨주는 토큰은 만료되면 갱신할 방법이 없어서, 브리지로 다시 받아온다.
 */
export const AccessTokenBridge = () => {
    const bridge = useBridgeProvider();
    const resolveRef = useRef<Resolve | null>(null);

    useEffect(() => {
        const unsubscribe = bridge.subscribe('OAUTH_GET_TOKEN', async (data) => {
            const accessToken = extractAccessToken(data);
            if (accessToken) setAccessToken(accessToken);
            else console.error('브리지 토큰 응답을 해석하지 못했어요:', data);

            resolveRef.current?.(accessToken);
            resolveRef.current = null;

            return {};
        });

        setAccessTokenRequester(
            () =>
                new Promise<string | null>((resolve) => {
                    const finish: Resolve = (token) => {
                        window.clearTimeout(timer);
                        if (resolveRef.current === finish) resolveRef.current = null;
                        resolve(token);
                    };

                    const timer = window.setTimeout(
                        () => finish(null),
                        TOKEN_REQUEST_TIMEOUT_MS
                    );

                    resolveRef.current = finish;
                    bridge.send('OAUTH_GET_TOKEN');
                })
        );

        return () => {
            unsubscribe();
            setAccessTokenRequester(null);
        };
    }, [bridge]);

    return null;
};

export default AccessTokenBridge;

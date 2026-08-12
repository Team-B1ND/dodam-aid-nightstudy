import { useCallback, useEffect, useState } from 'react';
import { getTotalCounts } from '../types/nightStudy';
import type { NightStudyTotalCount } from '../types/nightStudy';
import { getAuthFailure, type AuthFailure } from '../api/error';

/** 다른 선생님이 승인·거절한 결과를 따라잡는 주기 */
const POLL_INTERVAL_MS = 30_000;

/** 승인된 심자의 층별·교시별 인원수 */
export const useNightStudyCounts = () => {
    const [counts, setCounts] = useState<NightStudyTotalCount | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authFailure, setAuthFailure] = useState<AuthFailure | null>(null);

    const fetch = useCallback(async () => {
        setError(null);
        setAuthFailure(null);

        try {
            const res = await getTotalCounts();
            setCounts(res.data);
        } catch (e) {
            const failure = getAuthFailure(e);
            if (failure) setAuthFailure(failure);
            else setError('심자 인원을 불러오지 못했어요.');
            console.error(e);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const initialLoad = async () => {
            setIsLoading(true);
            await fetch();
            if (!cancelled) setIsLoading(false);
        };

        void Promise.resolve().then(initialLoad);

        const refreshWhenVisible = () => {
            if (document.visibilityState !== 'visible') return;
            void fetch();
        };

        const timer = window.setInterval(refreshWhenVisible, POLL_INTERVAL_MS);
        document.addEventListener('visibilitychange', refreshWhenVisible);
        window.addEventListener('focus', refreshWhenVisible);

        return () => {
            cancelled = true;
            window.clearInterval(timer);
            document.removeEventListener('visibilitychange', refreshWhenVisible);
            window.removeEventListener('focus', refreshWhenVisible);
        };
    }, [fetch]);

    return { counts, isLoading, error, authFailure, refetch: fetch };
};

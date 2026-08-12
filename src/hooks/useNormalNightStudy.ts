import { useCallback, useEffect, useState } from 'react';
import { getPersonalApplications } from '../types/nightStudy';
import type { PersonalNightStudyApplication } from '../types/nightStudy';
import { getAuthFailure, type AuthFailure } from '../api/error';
import { fetchAllPages } from '../api/paging';

const PAGE_SIZE = 100;

const loadAll = (status: 'ALLOWED' | 'PENDING' | 'REJECTED') =>
    fetchAllPages((page) =>
        getPersonalApplications({ page, size: PAGE_SIZE, status })
    );

/**
 * 일반 심자 신청 목록. 처리해야 할 신청이 위로 오도록
 * 대기중 → 승인 → 거절 순으로 보여준다.
 */
export const useNormalNightStudy = () => {
    const [applications, setApplications] = useState<
        PersonalNightStudyApplication[]
    >([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authFailure, setAuthFailure] = useState<AuthFailure | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setAuthFailure(null);

        try {
            const [pending, allowed, rejected] = await Promise.all([
                loadAll('PENDING'),
                loadAll('ALLOWED'),
                loadAll('REJECTED'),
            ]);

            setApplications([...pending, ...allowed, ...rejected]);
        } catch (e) {
            const failure = getAuthFailure(e);
            if (failure) setAuthFailure(failure);
            else setError('심자 목록을 불러오지 못했어요.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void Promise.resolve().then(fetch);
    }, [fetch]);

    return { applications, isLoading, error, authFailure, refetch: fetch };
};

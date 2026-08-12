import { useState, useEffect, useCallback } from 'react';
import { getProjectApplications } from '../types/nightStudy';
import type {
    ProjectNightStudyApplication,
    NightStudyStatus,
} from '../types/nightStudy';
import type { PageResponse } from '@b1nd/api-client';
import { getAuthFailure, type AuthFailure } from '../api/error';
import { fetchAllPages } from '../api/paging';

interface GetProjectParams {
    page?: number;
    size?: number;
    keyword?: string;
    status?: NightStudyStatus;
}

export const useGetProjectNightStudies = (params: GetProjectParams = {}) => {
    const [data, setData] =
        useState<PageResponse<ProjectNightStudyApplication> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authFailure, setAuthFailure] = useState<AuthFailure | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setAuthFailure(null);
        try {
            const content = await fetchAllPages((page) =>
                getProjectApplications({
                    page: (params.page ?? 0) + page,
                    size: params.size ?? 100,
                    keyword: params.keyword,
                    status: params.status,
                })
            );
            setData({ content, hasNext: false });
        } catch (e) {
            const failure = getAuthFailure(e);
            if (failure) setAuthFailure(failure);
            else setError('프로젝트 심자 목록을 불러오지 못했어요.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [params.page, params.size, params.keyword, params.status]);

    useEffect(() => {
        void Promise.resolve().then(fetch);
    }, [fetch]);

    return { data, isLoading, error, authFailure, refetch: fetch };
};

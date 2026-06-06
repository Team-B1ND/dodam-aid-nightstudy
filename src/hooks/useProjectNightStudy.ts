import { useState, useEffect, useCallback } from 'react';
import {
    getProjectApplications,
    allowApplication,
    rejectApplication,
    pendingApplication,
} from '../types/nightStudy';
import type {
    ProjectNightStudyApplication,
    NightStudyStatus,
} from '../types/nightStudy';
import type { PageResponse } from '@b1nd/api-client';

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

    const fetch = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await getProjectApplications({
                page: params.page ?? 0,
                size: params.size ?? 20,
                keyword: params.keyword,
                status: params.status,
            });
            setData(res.data);
        } catch (e) {
            setError('프로젝트 심자 목록을 불러오지 못했어요.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [params.page, params.size, params.keyword, params.status]);

    useEffect(() => {
        void Promise.resolve().then(fetch);
    }, [fetch]);

    return { data, isLoading, error, refetch: fetch };
};

export const useAllowProjectNightStudy = (onSuccess?: () => void) => {
    const [isLoading, setIsLoading] = useState(false);

    const mutate = async (id: string) => {
        setIsLoading(true);
        try {
            await allowApplication(id);
            onSuccess?.();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return { mutate, isLoading };
};

export const useRejectProjectNightStudy = (onSuccess?: () => void) => {
    const [isLoading, setIsLoading] = useState(false);

    const mutate = async ({ id, reason }: { id: string; reason: string }) => {
        setIsLoading(true);
        try {
            await rejectApplication(id, reason);
            onSuccess?.();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return { mutate, isLoading };
};

export const usePendingProjectNightStudy = (onSuccess?: () => void) => {
    const [isLoading, setIsLoading] = useState(false);

    const mutate = async (id: string) => {
        setIsLoading(true);
        try {
            await pendingApplication(id);
            onSuccess?.();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return { mutate, isLoading };
};

import { apiClient } from './client';
import type { PageResponse } from '@b1nd/api-client';

export type NightStudyStatus = 'PENDING' | 'ALLOWED' | 'REJECTED';

export interface NightStudyUser {
    publicId: string;
    name: string;
    student?: {
        grade: number;
        room: number;
        number: number;
    };
}

export interface NightStudyRoom {
    id: number;
    name: string;
}

export interface PersonalNightStudyApplication {
    id: string;
    description: string;
    period: number;
    startAt: string;
    endAt: string;
    rejectionReason: string | null;
    status: NightStudyStatus;
    needPhone: boolean;
    needPhoneReason: string | null;
    leader: NightStudyUser;
    members: NightStudyUser[];
    type: 'PERSONAL';
    room: NightStudyRoom | null;
}

export interface ProjectNightStudyApplication {
    id: string;
    name: string;
    description: string;
    period: number;
    startAt: string;
    endAt: string;
    rejectionReason: string | null;
    status: NightStudyStatus;
    leader: NightStudyUser;
    members: NightStudyUser[];
    type: 'PROJECT';
    room: NightStudyRoom | null;
}

export interface NightStudyCount {
    personal: { period1: number; period2: number };
    project:  { period1: number; period2: number };
    total:    { period1: number; period2: number };
}

// ──────────────────────────────
// 일반 심자
// ──────────────────────────────

/** 일반 심자 목록 조회 (GET /nightstudy/applications?type=PERSONAL) */
export const getPersonalApplications = (params: {
    page: number;
    size?: number;
    keyword?: string;
    status?: NightStudyStatus;
}) => {
    const { page, size = 20, keyword, status } = params;
    const qs = new URLSearchParams({ type: 'PERSONAL', page: String(page), size: String(size) });
    if (keyword) qs.set('keyword', keyword);
    if (status)  qs.set('status', status);
    return apiClient.get<PageResponse<PersonalNightStudyApplication>>(
        `/nightstudy/applications?${qs.toString()}`
    );
};

/** 심자 승인 (PATCH /nightstudy/applications/{id}/allow) */
export const allowApplication = (id: string) =>
    apiClient.patch(`/nightstudy/applications/${id}/allow`);

/** 심자 거절 (PATCH /nightstudy/applications/{id}/reject) */
export const rejectApplication = (id: string, rejectionReason: string) =>
    apiClient.patch(`/nightstudy/applications/${id}/reject`, { rejectionReason });

/** 심자 대기(승인 취소) (PATCH /nightstudy/applications/{id}/pending) */
export const pendingApplication = (id: string) =>
    apiClient.patch(`/nightstudy/applications/${id}/pending`);

// ──────────────────────────────
// 프로젝트 심자
// ──────────────────────────────

/** 프로젝트 심자 목록 조회 (GET /nightstudy/applications?type=PROJECT) */
export const getProjectApplications = (params: {
    page: number;
    size?: number;
    keyword?: string;
    status?: NightStudyStatus;
}) => {
    const { page, size = 20, keyword, status } = params;
    const qs = new URLSearchParams({ type: 'PROJECT', page: String(page), size: String(size) });
    if (keyword) qs.set('keyword', keyword);
    if (status)  qs.set('status', status);
    return apiClient.get<PageResponse<ProjectNightStudyApplication>>(
        `/nightstudy/applications?${qs.toString()}`
    );
};

/** 심자 카운트 조회 (GET /nightstudy/applications/count) */
export const getNightStudyCount = () =>
    apiClient.get<NightStudyCount>('/nightstudy/applications/count');
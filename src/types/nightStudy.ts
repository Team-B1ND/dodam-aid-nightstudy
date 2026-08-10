import { apiClient } from '../api/client.ts';
import type { PageResponse } from '@b1nd/api-client';
import type {
    NightStudyStatus,
    NightStudyUser,
    NightStudyRoom,
    PersonalNightStudyApplication,
} from '../hooks/normalNightStudy.ts';
import type {
    ProjectNightStudyApplication,
    NightStudyCount,
} from '../hooks/projectNightStudy.ts';

export type {
    NightStudyStatus,
    NightStudyUser,
    NightStudyRoom,
    PersonalNightStudyApplication,
    ProjectNightStudyApplication,
    NightStudyCount,
};

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

// ──────────────────────────────
// 출석 체크
// ──────────────────────────────

export interface Attendance {
    userId: string;
    date: string;
    period: number;
    attended: boolean;
}

export interface AttendanceParams {
    userId: string;
    date?: string;
    period: number;
}

const attendanceUrl = ({ userId, date, period }: AttendanceParams) => {
    const qs = new URLSearchParams({ period: String(period) });
    if (date) qs.set('date', date);
    return `/nightstudy/attendance/${encodeURIComponent(userId)}?${qs.toString()}`;
};

/** 학생 1명의 출석 상태 조회 (GET /nightstudy/attendance/{userId}) */
export const getAttendance = (params: AttendanceParams) =>
    apiClient.get<Attendance>(attendanceUrl(params));

/** 출석 확인 / 되돌리기 (PATCH /nightstudy/attendance/{userId}) */
export const updateAttendance = (
    params: AttendanceParams & { attended: boolean }
) => apiClient.patch<Attendance>(attendanceUrl(params), {
    attended: params.attended,
});
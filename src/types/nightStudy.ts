import { apiClient } from '../api/client.ts';
import type { PageResponse } from '@b1nd/api-client';
import type {
    NightStudyStatus,
    PersonalNightStudyApplication,
} from '../hooks/normalNightStudy.ts';
import type { ProjectNightStudyApplication } from '../hooks/projectNightStudy.ts';

export type {
    NightStudyStatus,
    PersonalNightStudyApplication,
    ProjectNightStudyApplication,
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
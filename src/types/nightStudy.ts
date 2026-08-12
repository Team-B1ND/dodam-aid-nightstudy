import { apiClient } from '../api/client.ts';
import type { PageResponse } from '@b1nd/api-client';
import type {
    NightStudyStatus,
    NightStudyUser,
    NightStudyRoom,
    PersonalNightStudyApplication,
} from '../hooks/normalNightStudy.ts';
import type { ProjectNightStudyApplication } from '../hooks/projectNightStudy.ts';

export type {
    NightStudyStatus,
    NightStudyUser,
    NightStudyRoom,
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
// 승인 / 거절 / 실 지정
// ──────────────────────────────

/** 심자 승인 (PATCH /nightstudy/applications/{id}/allow) */
export const allowApplication = (id: string) =>
    apiClient.patch(`/nightstudy/applications/${id}/allow`);

/** 심자 거절 (PATCH /nightstudy/applications/{id}/reject) */
export const rejectApplication = (id: string, rejectionReason: string) =>
    apiClient.patch(`/nightstudy/applications/${id}/reject`, { rejectionReason });

/** 승인/거절 되돌리기 (PATCH /nightstudy/applications/{id}/pending) */
export const pendingApplication = (id: string) =>
    apiClient.patch(`/nightstudy/applications/${id}/pending`);

/** 실이 교시별로 이미 쓰이고 있는지 */
export interface RoomInUse {
    period1: boolean;
    period2: boolean;
}

export interface ProjectRoom extends NightStudyRoom {
    inUse: RoomInUse;
}

/** 자습 가능한 실 목록 (GET /nightstudy/rooms) */
export const getRooms = () => apiClient.get<ProjectRoom[]>('/nightstudy/rooms');

/** 프로젝트 실 지정 (PATCH /nightstudy/applications/{id}/room) */
export const assignRoom = (id: string, roomId: number) =>
    apiClient.patch(`/nightstudy/applications/${id}/room`, { roomId });

// ──────────────────────────────
// 인원 조회
// ──────────────────────────────

export interface TypeCount {
    /** 일반 심자 인원 */
    personal: number;
    /** 프로젝트 심자 인원 */
    project: number;
}

export interface PeriodCount {
    /** 심자 1 (심자 2까지 신청한 인원도 포함) */
    period1: TypeCount;
    /** 심자 2 */
    period2: TypeCount;
}

export interface NightStudyTotalCount {
    floors: { floor: number; count: PeriodCount }[];
    total: PeriodCount;
}

/** 승인된 심자의 층별 인원수 (GET /nightstudy/applications/total) */
export const getTotalCounts = () =>
    apiClient.get<NightStudyTotalCount>('/nightstudy/applications/total');

// ──────────────────────────────
// 실별 출석 현황
// ──────────────────────────────

/** 실 1개의 요약 (1·2학년은 학반, 3학년은 심자실, 그 외는 프로젝트 실) */
export interface RoomSummary {
    /** 예: `CLASS_1_1`, `GRADE_3`, `PROJECT_2` */
    roomId: string;
    roomName: string;
    /** 그 실에서 심자하는 인원 */
    memberCount: number;
    /** 아직 출석 확인이 안 된 인원 */
    unchecked: number;
}

export interface RoomMember {
    userId: string;
    name: string;
    profileImage: string | null;
    grade: number;
    room: number;
    number: number;
    attended: boolean;
}

/** 실별 심자 현황 (GET /nightstudy/rooms/status) */
export const getRoomStatuses = (params: { date?: string; period: number }) => {
    const qs = new URLSearchParams({ period: String(params.period) });
    if (params.date) qs.set('date', params.date);
    return apiClient.get<RoomSummary[]>(`/nightstudy/rooms/status?${qs.toString()}`);
};

/** 실 1개의 심자 인원과 출석 여부 (GET /nightstudy/rooms/status/{roomId}) */
export const getRoomMembers = (
    roomId: string,
    params: { date?: string; period: number }
) => {
    const qs = new URLSearchParams({ period: String(params.period) });
    if (params.date) qs.set('date', params.date);
    return apiClient.get<{ roomMember: RoomMember[] }>(
        `/nightstudy/rooms/status/${encodeURIComponent(roomId)}?${qs.toString()}`
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
import type { NightStudyStatus } from '../types/nightStudy';

/** 처리해야 할 신청이 위로 오도록 대기중 → 승인 → 거절 순 */
const STATUS_ORDER: Record<NightStudyStatus, number> = {
    PENDING: 0,
    ALLOWED: 1,
    REJECTED: 2,
};

export const byStatusOrder = <T extends { status: NightStudyStatus }>(
    a: T,
    b: T
) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status];

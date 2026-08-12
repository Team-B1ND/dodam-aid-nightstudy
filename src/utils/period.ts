/** 심자 2로 넘어가는 시각 (22시 30분) */
const SECOND_PERIOD_START = { hour: 22, minute: 30 };

/**
 * 지금 시각에 해당하는 심자 교시.
 * 22시 30분 전이면 심자 1, 그 뒤로는 심자 2.
 */
export const getCurrentPeriod = (now: Date = new Date()) => {
    const minutes = now.getHours() * 60 + now.getMinutes();
    const boundary = SECOND_PERIOD_START.hour * 60 + SECOND_PERIOD_START.minute;

    return minutes < boundary ? 1 : 2;
};

/** 드롭다운이 문자열을 쓰기 때문에 맞춰서 돌려준다 */
export const getCurrentPeriodValue = () => String(getCurrentPeriod());

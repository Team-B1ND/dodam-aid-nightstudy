import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAttendance, updateAttendance } from '../types/nightStudy';
import { getToday } from '../utils/date';

export interface AttendanceTarget {
    /** 학생의 publicId */
    userId: string;
    /** 심자 1 / 심자 2 */
    period: number;
}

/** 다른 기기(웹 등)에서 바뀐 출석을 따라잡는 주기 */
const POLL_INTERVAL_MS = 10_000;

const toKey = (userId: string, period: number) => `${period}:${userId}`;

const fromKey = (key: string) => {
    const separator = key.indexOf(':');
    return {
        period: Number(key.slice(0, separator)),
        userId: key.slice(separator + 1),
    };
};

const withKey = (keys: Set<string>, key: string, has: boolean) => {
    const next = new Set(keys);
    if (has) next.add(key);
    else next.delete(key);
    return next;
};

/** 요청이 한꺼번에 몰리지 않도록 동시 실행 개수를 제한한다 */
const runWithLimit = async <T>(tasks: (() => Promise<T>)[], limit = 8) => {
    const results: T[] = [];
    let cursor = 0;

    const worker = async () => {
        while (cursor < tasks.length) {
            const index = cursor++;
            results[index] = await tasks[index]();
        }
    };

    await Promise.all(
        Array.from({ length: Math.min(limit, tasks.length) }, worker)
    );

    return results;
};

/**
 * 목록에 있는 학생들의 오늘자 출석 상태를 조회하고, 체크박스로 출석 확인/되돌리기를 수행한다.
 *
 * - 서버 반영 전에 화면을 먼저 바꾸고(낙관적 업데이트), 실패하면 원래 상태로 되돌린다.
 * - 화면이 보이는 동안 주기적으로 다시 읽어 웹에서 바뀐 출석을 따라간다.
 */
export const useNightStudyAttendance = (
    targets: AttendanceTarget[],
    pollIntervalMs: number = POLL_INTERVAL_MS
) => {
    const [attendedKeys, setAttendedKeys] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const attendedKeysRef = useRef(attendedKeys);
    /** PATCH 전송 중인 항목 */
    const pendingKeysRef = useRef<Set<string>>(new Set());
    /** 항목별 마지막 로컬 변경 시각 (오래된 조회 결과가 덮어쓰지 못하게 한다) */
    const changedAtRef = useRef<Map<string, number>>(new Map());
    const isFetchingRef = useRef(false);
    const hasLoadedRef = useRef(false);
    const date = getToday();

    useEffect(() => {
        attendedKeysRef.current = attendedKeys;
    }, [attendedKeys]);

    // 배열은 매 렌더 새로 만들어지므로 문자열로 만들어 의존성으로 쓴다
    const targetKeys = useMemo(
        () =>
            Array.from(
                new Set(targets.map(({ userId, period }) => toKey(userId, period)))
            )
                .sort()
                .join(','),
        [targets]
    );

    const load = useCallback(async () => {
        const keys = targetKeys ? targetKeys.split(',') : [];
        if (keys.length === 0 || isFetchingRef.current) return;

        const startedAt = Date.now();
        isFetchingRef.current = true;
        if (!hasLoadedRef.current) setIsLoading(true);

        const results = await runWithLimit(
            keys.map((key) => async () => {
                const { userId, period } = fromKey(key);
                try {
                    const res = await getAttendance({ userId, date, period });
                    return res.data.attended ? key : null;
                } catch (e) {
                    // 출석 기록이 없는 학생은 조회가 실패할 수 있어 미출석으로 둔다
                    console.error(e);
                    return null;
                }
            })
        );

        const attended = new Set(
            results.filter((key): key is string => key !== null)
        );

        setAttendedKeys((prev) => {
            const next = new Set(prev);

            keys.forEach((key) => {
                // 전송 중이거나 조회 시작 이후에 바뀐 항목은 로컬 상태를 유지한다
                if (pendingKeysRef.current.has(key)) return;
                if ((changedAtRef.current.get(key) ?? 0) > startedAt) return;

                if (attended.has(key)) next.add(key);
                else next.delete(key);
            });

            return next;
        });

        hasLoadedRef.current = true;
        isFetchingRef.current = false;
        setIsLoading(false);
    }, [targetKeys, date]);

    useEffect(() => {
        void load();

        if (pollIntervalMs <= 0) return;

        const refreshWhenVisible = () => {
            if (document.visibilityState !== 'visible') return;
            void load();
        };

        const timer = window.setInterval(refreshWhenVisible, pollIntervalMs);
        // 다른 앱/탭에 갔다 돌아오면 기다리지 않고 바로 갱신한다
        document.addEventListener('visibilitychange', refreshWhenVisible);
        window.addEventListener('focus', refreshWhenVisible);

        return () => {
            window.clearInterval(timer);
            document.removeEventListener('visibilitychange', refreshWhenVisible);
            window.removeEventListener('focus', refreshWhenVisible);
        };
    }, [load, pollIntervalMs]);

    const isAttended = useCallback(
        (userId: string, period: number) => attendedKeys.has(toKey(userId, period)),
        [attendedKeys]
    );

    const toggleAttendance = useCallback(
        async (userId: string, period: number) => {
            const key = toKey(userId, period);
            if (pendingKeysRef.current.has(key)) return;

            const attended = !attendedKeysRef.current.has(key);
            pendingKeysRef.current.add(key);
            changedAtRef.current.set(key, Date.now());
            setAttendedKeys((prev) => withKey(prev, key, attended));

            try {
                await updateAttendance({ userId, date, period, attended });
                changedAtRef.current.set(key, Date.now());
            } catch (e) {
                console.error(e);
                changedAtRef.current.set(key, Date.now());
                setAttendedKeys((prev) => withKey(prev, key, !attended));
            } finally {
                pendingKeysRef.current.delete(key);
            }
        },
        [date]
    );

    return { isAttended, toggleAttendance, isLoading };
};

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    getRoomMembers,
    getRoomStatuses,
    updateAttendance,
} from '../types/nightStudy';
import type { RoomMember, RoomSummary } from '../types/nightStudy';
import { getToday } from '../utils/date';
import { runWithLimit } from '../utils/concurrency';
import { getAuthFailure, type AuthFailure } from '../api/error';

/** 다른 기기(웹 등)에서 바뀐 출석을 따라잡는 주기 */
const POLL_INTERVAL_MS = 10_000;

/**
 * 실별 심자 현황과 출석 확인.
 *
 * 학반·3학년 심자실·프로젝트 실로 묶는 일과 출석 여부는 서버가 이미 계산해서 주므로
 * (`GET /rooms/status`), 여기서는 그대로 받아 쓰고 출석만 다시 기록한다.
 */
export const useRoomAttendance = (period: number) => {
    const [rooms, setRooms] = useState<RoomSummary[]>([]);
    const [openRoomId, setOpenRoomId] = useState<string | null>(null);
    const [members, setMembers] = useState<RoomMember[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authFailure, setAuthFailure] = useState<AuthFailure | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    /** 전송 중인 학생 (뒤늦게 온 조회 결과가 덮어쓰지 못하게 한다) */
    const pendingUserIdsRef = useRef<Set<string>>(new Set());
    const date = getToday();

    const handleError = useCallback((e: unknown, message: string) => {
        const failure = getAuthFailure(e);
        if (failure) setAuthFailure(failure);
        else setError(message);
        console.error(e);
    }, []);

    const loadRooms = useCallback(async () => {
        try {
            const res = await getRoomStatuses({ date, period });
            setRooms(res.data);
            setError(null);
            setAuthFailure(null);
        } catch (e) {
            handleError(e, '실별 현황을 불러오지 못했어요.');
        }
    }, [date, period, handleError]);

    const loadMembers = useCallback(
        async (roomId: string) => {
            try {
                const res = await getRoomMembers(roomId, { date, period });
                setMembers((previous) => {
                    const pending = pendingUserIdsRef.current;
                    if (pending.size === 0) return res.data.roomMember;

                    // 전송 중인 학생은 화면에 보이던 상태를 유지한다
                    return res.data.roomMember.map((member) => {
                        if (!pending.has(member.userId)) return member;
                        const shown = previous.find(
                            (item) => item.userId === member.userId
                        );
                        return shown ?? member;
                    });
                });
                setError(null);
                setAuthFailure(null);
            } catch (e) {
                handleError(e, '실 인원을 불러오지 못했어요.');
            }
        },
        [date, period, handleError]
    );

    // 목록 화면과 실 상세 화면 모두 주기적으로 다시 읽는다
    useEffect(() => {
        let cancelled = false;

        const refresh = async () => {
            if (cancelled) return;
            await (openRoomId ? loadMembers(openRoomId) : loadRooms());
        };

        const initialLoad = async () => {
            setIsLoading(true);
            await refresh();
            if (!cancelled) setIsLoading(false);
        };

        void Promise.resolve().then(initialLoad);

        const refreshWhenVisible = () => {
            if (document.visibilityState !== 'visible') return;
            void refresh();
        };

        const timer = window.setInterval(refreshWhenVisible, POLL_INTERVAL_MS);
        // 다른 앱/탭에 갔다 돌아오면 기다리지 않고 바로 갱신한다
        document.addEventListener('visibilitychange', refreshWhenVisible);
        window.addEventListener('focus', refreshWhenVisible);

        return () => {
            cancelled = true;
            window.clearInterval(timer);
            document.removeEventListener('visibilitychange', refreshWhenVisible);
            window.removeEventListener('focus', refreshWhenVisible);
        };
    }, [openRoomId, loadRooms, loadMembers]);

    const openRoom = useCallback((roomId: string | null) => {
        setMembers([]);
        setError(null);
        setOpenRoomId(roomId);
    }, []);

    /** 화면을 먼저 바꾸고 서버에 보낸다. 실패하면 원래대로 되돌린다. */
    const setAttendance = useCallback(
        async (targets: RoomMember[], attended: boolean) => {
            const changed = targets.filter(
                (member) =>
                    member.attended !== attended &&
                    !pendingUserIdsRef.current.has(member.userId)
            );
            if (changed.length === 0) return;

            const changedIds = new Set(changed.map((member) => member.userId));
            changedIds.forEach((userId) => pendingUserIdsRef.current.add(userId));

            const apply = (ids: Set<string>, value: boolean) =>
                setMembers((previous) =>
                    previous.map((member) =>
                        ids.has(member.userId) ? { ...member, attended: value } : member
                    )
                );

            apply(changedIds, attended);
            setIsSaving(true);
            setError(null);

            const failedIds = new Set<string>();

            await runWithLimit(
                changed.map((member) => async () => {
                    try {
                        await updateAttendance({
                            userId: member.userId,
                            date,
                            period,
                            attended,
                        });
                    } catch (e) {
                        console.error(e);
                        failedIds.add(member.userId);
                    }
                })
            );

            if (failedIds.size > 0) {
                apply(failedIds, !attended);
                setError('출석을 저장하지 못했어요.');
            }

            changedIds.forEach((userId) =>
                pendingUserIdsRef.current.delete(userId)
            );
            setIsSaving(false);
        },
        [date, period]
    );

    return {
        rooms,
        openRoomId,
        members,
        isLoading,
        isSaving,
        error,
        authFailure,
        openRoom,
        setAttendance,
        // 당겨서 새로고침이 끝날 때까지 기다릴 수 있도록 Promise를 돌려준다
        retry: () => (openRoomId ? loadMembers(openRoomId) : loadRooms()),
    };
};

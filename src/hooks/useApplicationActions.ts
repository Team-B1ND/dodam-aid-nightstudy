import { useState } from 'react';
import {
    allowApplication,
    assignRoom,
    pendingApplication,
    rejectApplication,
} from '../types/nightStudy';
import { runWithLimit } from '../utils/concurrency';

/**
 * 심자 신청의 승인/거절/되돌리기와 실 지정을 처리한다.
 * 성공하면 `onSuccess`로 목록을 다시 불러오게 한다.
 */
export const useApplicationActions = (onSuccess?: () => void) => {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const run = async (task: () => Promise<unknown>, failureMessage: string) => {
        if (isPending) return false;

        setIsPending(true);
        setError(null);
        try {
            await task();
            onSuccess?.();
            return true;
        } catch (e) {
            console.error(e);
            setError(failureMessage);
            return false;
        } finally {
            setIsPending(false);
        }
    };

    return {
        isPending,
        error,
        allow: (id: string) => run(() => allowApplication(id), '승인하지 못했어요.'),
        reject: (id: string, reason: string) =>
            run(() => rejectApplication(id, reason), '거절하지 못했어요.'),
        revert: (id: string) =>
            run(() => pendingApplication(id), '되돌리지 못했어요.'),
        assign: (id: string, roomId: number) =>
            run(() => assignRoom(id, roomId), '실을 지정하지 못했어요.'),
        allowAll: (ids: string[]) =>
            run(
                () => runWithLimit(ids.map((id) => () => allowApplication(id))),
                '일괄 승인하지 못했어요.'
            ),
        rejectAll: (ids: string[], reason: string) =>
            run(
                () =>
                    runWithLimit(
                        ids.map((id) => () => rejectApplication(id, reason))
                    ),
                '일괄 거절하지 못했어요.'
            ),
    };
};

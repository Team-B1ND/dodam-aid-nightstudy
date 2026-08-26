import { useEffect, useRef, useState } from 'react';
import { Dropdown } from '@b1nd/dodam-design-system/components';
import { useRouter } from '@b1nd/aid-kit/navigation';
import { PageShell, CenteredScreen } from '../../components/PageShell';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { NoPermission, SessionExpired } from '../../components/NoPermission';
import { PullToRefreshList } from '../../components/PullToRefreshList';
import { useRoomList } from '../../hooks/useRoomAttendance';
import { getCurrentPeriodValue } from '../../utils/period';
import { ATTENDANCE_ROOM_PATH } from '../../routes';
import type { AttendanceRoomState } from './room';
import './index.css';
import { DROPDOWN_STYLE } from '../dropdownStyle';

const PERIODS = [
    { name: '심자 1', value: '1' },
    { name: '심자 2', value: '2' },
];

export const AttendanceCheckPage = () => {
    // 탭에 들어온 시각에 맞는 교시로 시작한다 (직접 고르면 그 선택을 따른다)
    const [period, setPeriod] = useState(getCurrentPeriodValue);
    const { stack } = useRouter();

    const { rooms, isLoading, error, authFailure, retry } = useRoomList(
        Number(period)
    );

    const stackLength = stack.current.length;
    const previousStackLength = useRef(stackLength);

    // 실에서 출석을 체크하고 돌아왔을 때만 현황을 새로 불러온다
    useEffect(() => {
        const returned = previousStackLength.current > 0 && stackLength === 0;
        previousStackLength.current = stackLength;
        if (returned) void retry();
    }, [stackLength, retry]);

    if (authFailure) {
        return (
            <CenteredScreen>
                {authFailure === 'forbidden' ? (
                    <NoPermission />
                ) : (
                    <SessionExpired onRetry={retry} />
                )}
            </CenteredScreen>
        );
    }

    if (isLoading && rooms.length === 0) {
        return (
            <CenteredScreen>
                <LoadingSpinner />
            </CenteredScreen>
        );
    }

    return (
        <PageShell>
            <div className="night-study-page__field-group night-study-page__field-group--two">
                <Dropdown
                    items={PERIODS}
                    value={period}
                    onSelectedItemChange={(item) => setPeriod(item.value)}
                    customStyle={DROPDOWN_STYLE}
                />
            </div>

            <section className="night-study-list" aria-label="실별 심자 현황">
                <div className="night-study-list__header">
                    <span>실이름</span>
                    <span aria-hidden="true">·</span>
                    <span>심자 인원</span>
                    <span aria-hidden="true">·</span>
                    <span>미출석 인원</span>
                </div>

                {error ? (
                    <p className="night-study-list__error">{error}</p>
                ) : rooms.length === 0 ? (
                    <p className="night-study-list__empty">
                        오늘 심자하는 학생이 없어요.
                    </p>
                ) : (
                    <PullToRefreshList onRefresh={retry}>
                        {rooms.map((room) => (
                            <li key={room.roomId}>
                                <button
                                    type="button"
                                    className="night-study-list__item"
                                    onClick={() =>
                                        stack.push(ATTENDANCE_ROOM_PATH, {
                                            roomId: room.roomId,
                                            roomName: room.roomName,
                                            period: Number(period),
                                        } satisfies AttendanceRoomState)
                                    }
                                >
                                    <span className="night-study-list__info">
                                        <span className="night-study-list__name">
                                            {room.roomName}
                                        </span>
                                        <span className="night-study-list__dot">·</span>
                                        <span className="night-study-list__meta">
                                            {room.memberCount}명
                                        </span>
                                        <span className="night-study-list__dot">·</span>
                                        <span className="night-study-list__meta">
                                            {room.unchecked}명
                                        </span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </PullToRefreshList>
                )}
            </section>
        </PageShell>
    );
};

export default AttendanceCheckPage;

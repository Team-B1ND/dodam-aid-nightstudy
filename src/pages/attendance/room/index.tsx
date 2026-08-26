import { useState } from 'react';
import { TextField } from '@b1nd/dodam-design-system/components';
import { useRouter, type RouteProps } from '@b1nd/aid-kit/navigation';
import { StackShell, CenteredScreen } from '../../../components/PageShell';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { NoPermission, SessionExpired } from '../../../components/NoPermission';
import { PullToRefreshList } from '../../../components/PullToRefreshList';
import { useRoomMembers } from '../../../hooks/useRoomAttendance';
import '../index.css';

export interface AttendanceRoomState {
    roomId: string;
    roomName: string;
    period: number;
}

export const AttendanceRoomPage = ({ state }: RouteProps) => {
    const { stack } = useRouter();
    const room = state as AttendanceRoomState | undefined;

    const [searchTerm, setSearchTerm] = useState('');

    const {
        members,
        isLoading,
        isSaving,
        error,
        authFailure,
        setAttendance,
        retry,
    } = useRoomMembers(room?.roomId ?? '', room?.period ?? 1);

    if (!room) {
        return (
            <CenteredScreen>
                <p className="night-study-list__empty">실 정보를 찾을 수 없어요.</p>
            </CenteredScreen>
        );
    }

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

    const visibleMembers = members.filter((member) =>
        searchTerm ? member.name.includes(searchTerm.trim()) : true
    );
    const uncheckedMembers = members.filter((member) => !member.attended);

    return (
        <StackShell title={room.roomName} onBack={() => stack.pop()}>
            <div className="night-study-page__search">
                <TextField
                    type="text"
                    label=""
                    value={searchTerm}
                    placeholder="학생 검색"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="night-study-page__bulk">
                <button
                    type="button"
                    className="night-study-page__bulk-button night-study-page__bulk-button--allow"
                    onClick={() => void setAttendance(uncheckedMembers, true)}
                    disabled={isSaving || uncheckedMembers.length === 0}
                >
                    일괄 출석
                </button>
            </div>

            <p className="attendance__summary">
                심자 인원: {members.length}명
                <span className="night-study-list__dot">·</span>
                미출석 인원: {uncheckedMembers.length}명
            </p>

            {error && <p className="night-study-list__error">{error}</p>}

            <section className="night-study-list" aria-label={`${room.roomName} 출석`}>
                <div className="night-study-list__header">
                    <span>이름</span>
                    <span aria-hidden="true">·</span>
                    <span>학번</span>
                    <span aria-hidden="true">·</span>
                    <span>출석 여부</span>
                </div>

                {isLoading && members.length === 0 ? (
                    <LoadingSpinner />
                ) : visibleMembers.length === 0 ? (
                    <p className="night-study-list__empty">학생을 찾을 수 없어요.</p>
                ) : (
                    <PullToRefreshList onRefresh={retry}>
                        {visibleMembers.map((member) => (
                            <li key={member.userId}>
                                <div className="night-study-list__item night-study-list__item--static">
                                    <span className="night-study-list__info">
                                        <span className="night-study-list__name">
                                            {member.name}
                                        </span>
                                        <span className="night-study-list__dot">·</span>
                                        <span className="night-study-list__meta">
                                            {member.grade}
                                            {member.room}
                                            {String(member.number).padStart(2, '0')}
                                        </span>
                                    </span>

                                    <button
                                        type="button"
                                        className={`attendance__button ${
                                            member.attended
                                                ? 'attendance__button--revert'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            void setAttendance([member], !member.attended)
                                        }
                                        disabled={isSaving}
                                    >
                                        {member.attended ? '되돌리기' : '출석 확인'}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </PullToRefreshList>
                )}
            </section>
        </StackShell>
    );
};

export default AttendanceRoomPage;

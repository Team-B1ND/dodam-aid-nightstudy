import { useState } from 'react';
import { Dropdown, TextField } from '@b1nd/dodam-design-system/components';
import { ArrowLeft } from '@b1nd/dodam-design-system/icons/mono';
import { PageShell, CenteredScreen } from '../../components/PageShell';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { NoPermission, SessionExpired } from '../../components/NoPermission';
import { PullToRefreshList } from '../../components/PullToRefreshList';
import { useRoomAttendance } from '../../hooks/useRoomAttendance';
import { getCurrentPeriodValue } from '../../utils/period';
import './index.css';
import { DROPDOWN_STYLE } from '../dropdownStyle';

const PERIODS = [
    { name: '심자 1', value: '1' },
    { name: '심자 2', value: '2' },
];

export const AttendanceCheckPage = () => {
    // 탭에 들어온 시각에 맞는 교시로 시작한다 (직접 고르면 그 선택을 따른다)
    const [period, setPeriod] = useState(getCurrentPeriodValue);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        rooms,
        openRoomId,
        members,
        isLoading,
        isSaving,
        error,
        authFailure,
        openRoom,
        setAttendance,
        retry,
    } = useRoomAttendance(Number(period));

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

    if (!openRoomId) {
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
                                        onClick={() => {
                                            openRoom(room.roomId);
                                            setSearchTerm('');
                                        }}
                                    >
                                        <span className="night-study-list__info">
                                            {room.roomName}
                                            <span className="night-study-list__dot">·</span>
                                            {room.memberCount}명
                                            <span className="night-study-list__dot">·</span>
                                            {room.unchecked}명
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </PullToRefreshList>
                    )}
                </section>
            </PageShell>
        );
    }

    const openRoomName =
        rooms.find((room) => room.roomId === openRoomId)?.roomName ?? '심자 인원';
    const visibleMembers = members.filter((member) =>
        searchTerm ? member.name.includes(searchTerm.trim()) : true
    );
    const uncheckedMembers = members.filter((member) => !member.attended);

    return (
        <PageShell>
            <div className="attendance__room-header">
                <button
                    type="button"
                    className="attendance__back"
                    aria-label="실 목록으로"
                    onClick={() => openRoom(null)}
                >
                    <ArrowLeft size={24} color="currentColor" />
                </button>
                <h2 className="attendance__room-name">{openRoomName}</h2>
            </div>

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

            <section className="night-study-list" aria-label={`${openRoomName} 출석`}>
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
                                        {member.name}
                                        <span className="night-study-list__dot">·</span>
                                        {member.grade}
                                        {member.room}
                                        {String(member.number).padStart(2, '0')}
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
        </PageShell>
    );
};

export default AttendanceCheckPage;

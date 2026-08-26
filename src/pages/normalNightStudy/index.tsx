import { useState } from 'react';
import { Dropdown, TextField } from '@b1nd/dodam-design-system/components';
import { PageShell, CenteredScreen } from '../../components/PageShell';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { NoPermission, SessionExpired } from '../../components/NoPermission';
import { StudentDialog } from './components/StudentDialog';
import { RejectDialog } from '../../components/RejectDialog';
import { PullToRefreshList } from '../../components/PullToRefreshList';
import { useNormalNightStudy } from '../../hooks/useNormalNightStudy';
import { useApplicationActions } from '../../hooks/useApplicationActions';
import type { PersonalNightStudyApplication } from '../../types/nightStudy';
import { DROPDOWN_STYLE } from '../dropdownStyle';

// 드롭다운 라벨이자 "거르지 않음"을 뜻하는 값 — 필터 조건과 반드시 같아야 한다
const ALL_GRADES = '모든 학년';
const ALL_CLASS_ROOMS = '모든 학반';
const ALL_TIMES = '모든 심자';

const GRADES = [
    { name: ALL_GRADES, value: ALL_GRADES },
    { name: '1학년', value: '1학년' },
    { name: '2학년', value: '2학년' },
    { name: '3학년', value: '3학년' },
];

const CLASS_ROOMS = [
    { name: ALL_CLASS_ROOMS, value: ALL_CLASS_ROOMS },
    { name: '1반', value: '1반' },
    { name: '2반', value: '2반' },
    { name: '3반', value: '3반' },
    { name: '4반', value: '4반' },
];

const TIMES = [
    { name: ALL_TIMES, value: ALL_TIMES },
    { name: '심1', value: '심1' },
    { name: '심2', value: '심2' },
];

const getStudentNumber = (application: PersonalNightStudyApplication) => {
    const student = application.leader.student;
    if (!student) return '';
    return `${student.grade}${student.room}${String(student.number).padStart(2, '0')}`;
};

const getPeriodText = (period: number) => (period >= 2 ? '심2' : '심1');

export const NormalNightStudyPage = () => {
    const { applications, isLoading, error, authFailure, refetch } =
        useNormalNightStudy();

    const [gradeSelected, setGradeSelected] = useState(ALL_GRADES);
    const [classRoomSelected, setClassRoomSelected] = useState(ALL_CLASS_ROOMS);
    const [timeSelected, setTimeSelected] = useState(ALL_TIMES);
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState<PersonalNightStudyApplication | null>(
        null
    );
    const [isBulkRejecting, setIsBulkRejecting] = useState(false);

    const actions = useApplicationActions(() => {
        setSelected(null);
        setIsBulkRejecting(false);
        void refetch();
    });

    if (authFailure) {
        return (
            <CenteredScreen>
                {authFailure === 'forbidden' ? (
                    <NoPermission />
                ) : (
                    <SessionExpired onRetry={() => void refetch()} />
                )}
            </CenteredScreen>
        );
    }

    if (isLoading && applications.length === 0) {
        return (
            <CenteredScreen>
                <LoadingSpinner />
            </CenteredScreen>
        );
    }

    const filtered = applications.filter((application) => {
        const studentNumber = getStudentNumber(application);
        const grade = gradeSelected === ALL_GRADES ? null : gradeSelected[0];
        const classRoom =
            classRoomSelected === ALL_CLASS_ROOMS ? null : classRoomSelected[0];
        const time = timeSelected === ALL_TIMES ? null : timeSelected;

        const matchGrade = grade ? studentNumber[0] === grade : true;
        const matchClass = classRoom ? studentNumber[1] === classRoom : true;
        const matchTime = time ? getPeriodText(application.period) === time : true;
        const matchSearch = searchTerm
            ? application.leader.name.includes(searchTerm.trim())
            : true;

        return matchGrade && matchClass && matchTime && matchSearch;
    });

    // 일괄 처리는 지금 화면에 보이는 대기 중 신청만 대상으로 한다
    const pendingIds = filtered
        .filter((application) => application.status === 'PENDING')
        .map((application) => application.id);
    const hasPending = pendingIds.length > 0;

    return (
        <PageShell>
            <div className="night-study-page__field-group">
                <Dropdown
                    items={GRADES}
                    value={gradeSelected}
                    onSelectedItemChange={(item) => setGradeSelected(item.value)}
                    customStyle={DROPDOWN_STYLE}
                />
                <Dropdown
                    items={CLASS_ROOMS}
                    value={classRoomSelected}
                    onSelectedItemChange={(item) => setClassRoomSelected(item.value)}
                    customStyle={DROPDOWN_STYLE}
                />
                <Dropdown
                    items={TIMES}
                    value={timeSelected}
                    onSelectedItemChange={(item) => setTimeSelected(item.value)}
                    customStyle={DROPDOWN_STYLE}
                />
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
                    onClick={() => void actions.allowAll(pendingIds)}
                    disabled={actions.isPending || !hasPending}
                >
                    일괄 승인
                </button>
                <button
                    type="button"
                    className="night-study-page__bulk-button night-study-page__bulk-button--danger"
                    onClick={() => setIsBulkRejecting(true)}
                    disabled={actions.isPending || !hasPending}
                >
                    일괄 거절
                </button>
            </div>

            {actions.error && (
                <p className="night-study-list__error">{actions.error}</p>
            )}

            <section className="night-study-list" aria-label="일반 심자 목록">
                <div className="night-study-list__header">
                    <span>이름</span>
                    <span aria-hidden="true">·</span>
                    <span>학번</span>
                    <span aria-hidden="true">·</span>
                    <span>진행 정보</span>
                    <span aria-hidden="true">·</span>
                    <span>승인 여부</span>
                </div>

                {error ? (
                    <p className="night-study-list__error">{error}</p>
                ) : filtered.length === 0 ? (
                    <p className="night-study-list__empty">신청한 학생이 없어요.</p>
                ) : (
                    <PullToRefreshList onRefresh={refetch}>
                        {filtered.map((application) => {
                            const isAllowed = application.status === 'ALLOWED';
                            const isRejected = application.status === 'REJECTED';

                            return (
                                <li key={application.id}>
                                    <button
                                        type="button"
                                        className="night-study-list__item"
                                        onClick={() => setSelected(application)}
                                    >
                                        <span className="night-study-list__info">
                                            {application.leader.name}
                                            <span className="night-study-list__dot">·</span>
                                            {getStudentNumber(application)}
                                            <span className="night-study-list__dot">·</span>
                                            {getPeriodText(application.period)}까지
                                        </span>

                                        <span
                                            className={`night-study-list__status ${
                                                isAllowed
                                                    ? 'night-study-list__status--allowed'
                                                    : isRejected
                                                      ? 'night-study-list__status--rejected'
                                                      : ''
                                            }`}
                                        >
                                            {isAllowed ? '승인' : isRejected ? '거절' : '대기중'}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </PullToRefreshList>
                )}
            </section>

            {selected && (
                <StudentDialog
                    application={selected}
                    isPending={actions.isPending}
                    error={actions.error}
                    onClose={() => setSelected(null)}
                    onAllow={() => void actions.allow(selected.id)}
                    onReject={(reason) => void actions.reject(selected.id, reason)}
                    onRevert={() => void actions.revert(selected.id)}
                />
            )}

            {isBulkRejecting && (
                <RejectDialog
                    title={`대기 중인 신청 ${pendingIds.length}건`}
                    isPending={actions.isPending}
                    error={actions.error}
                    onClose={() => setIsBulkRejecting(false)}
                    onReject={(reason) => void actions.rejectAll(pendingIds, reason)}
                />
            )}
        </PageShell>
    );
};

export default NormalNightStudyPage;

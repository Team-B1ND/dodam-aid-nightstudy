import { useEffect, useState } from 'react';
import { Dropdown, TextField } from '@b1nd/dodam-design-system/components';
import { useRouter } from '@b1nd/aid-kit/navigation';
import { PageShell, CenteredScreen } from '../../components/PageShell';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { NoPermission, SessionExpired } from '../../components/NoPermission';
import { PullToRefreshList } from '../../components/PullToRefreshList';
import { useGetProjectNightStudies } from '../../hooks/useProjectNightStudy';
import type { ProjectNightStudyApplication } from '../../types/nightStudy';
import { PROJECT_DETAIL_PATH } from '../../routes';
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

const getPeriodText = (period: number) => (period >= 2 ? '심2' : '심1');

export const ProjectNightStudyPage = () => {
    const { data, isLoading, error, authFailure, refetch } =
        useGetProjectNightStudies();
    const { stack } = useRouter();

    const [gradeSelected, setGradeSelected] = useState(ALL_GRADES);
    const [classSelected, setClassSelected] = useState(ALL_CLASS_ROOMS);
    const [timeSelected, setTimeSelected] = useState(ALL_TIMES);
    const [searchTerm, setSearchTerm] = useState('');

    const projects = data?.content ?? [];
    const stackLength = stack.current.length;

    // 상세 페이지에서 승인/거절하고 돌아오면 목록을 새로 불러온다
    useEffect(() => {
        if (stackLength === 0) void refetch();
    }, [stackLength, refetch]);

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

    if (isLoading && projects.length === 0) {
        return (
            <CenteredScreen>
                <LoadingSpinner />
            </CenteredScreen>
        );
    }

    // 정렬은 서버가 준 순서를 그대로 쓴다
    const filtered = projects.filter((project: ProjectNightStudyApplication) => {
        const members = [project.leader, ...project.members];
        const grade =
            gradeSelected === ALL_GRADES ? null : Number(gradeSelected[0]);
        const classRoom =
            classSelected === ALL_CLASS_ROOMS ? null : Number(classSelected[0]);
        const time = timeSelected === ALL_TIMES ? null : timeSelected;

        const matchSearch = project.name
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase());

        const matchTime = time ? getPeriodText(project.period) === time : true;

        const matchStudent =
            grade === null && classRoom === null
                ? true
                : members.some((member) => {
                      if (!member.student) return false;
                      return (
                          (grade === null || member.student.grade === grade) &&
                          (classRoom === null ||
                              member.student.room === classRoom)
                      );
                  });

        return matchSearch && matchTime && matchStudent;
    });

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
                    value={classSelected}
                    onSelectedItemChange={(item) => setClassSelected(item.value)}
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
                    placeholder="프로젝트 검색"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <section className="night-study-list" aria-label="프로젝트 심자 목록">
                <div className="night-study-list__header">
                    <span>프로젝트명</span>
                    <span aria-hidden="true">·</span>
                    <span>장소</span>
                    <span aria-hidden="true">·</span>
                    <span>진행 정보</span>
                </div>

                {error ? (
                    <p className="night-study-list__error">{error}</p>
                ) : filtered.length === 0 ? (
                    <p className="night-study-list__empty">프로젝트가 없어요.</p>
                ) : (
                    <PullToRefreshList onRefresh={refetch}>
                        {filtered.map((project) => {
                            const isAllowed = project.status === 'ALLOWED';
                            const isRejected = project.status === 'REJECTED';

                            return (
                                <li key={project.id}>
                                    <button
                                        type="button"
                                        className="night-study-list__item"
                                        onClick={() =>
                                            stack.push(PROJECT_DETAIL_PATH, { project })
                                        }
                                    >
                                        <span className="night-study-list__info">
                                            <span className="night-study-list__name">
                                                {project.name}
                                            </span>
                                            <span className="night-study-list__dot">·</span>
                                            <span className="night-study-list__meta">
                                                {project.room?.name ?? '장소 미정'}
                                            </span>
                                            <span className="night-study-list__dot">·</span>
                                            <span className="night-study-list__meta">
                                                {getPeriodText(project.period)}
                                            </span>
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
        </PageShell>
    );
};

export default ProjectNightStudyPage;

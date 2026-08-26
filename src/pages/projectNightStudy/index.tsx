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
import { byStatusOrder } from '../../utils/status';
import { DROPDOWN_STYLE } from '../dropdownStyle';

const GRADES = [
    { name: '모든 학년', value: '모든 학년' },
    { name: '1학년', value: '1학년' },
    { name: '2학년', value: '2학년' },
    { name: '3학년', value: '3학년' },
];

const CLASS_ROOMS = [
    { name: '모든 학반', value: '모든 학반' },
    { name: '1반', value: '1반' },
    { name: '2반', value: '2반' },
    { name: '3반', value: '3반' },
    { name: '4반', value: '4반' },
];

const getPeriodText = (period: number) => (period >= 2 ? '심2' : '심1');

export const ProjectNightStudyPage = () => {
    const { data, isLoading, error, authFailure, refetch } =
        useGetProjectNightStudies();
    const { stack } = useRouter();

    const [gradeSelected, setGradeSelected] = useState('모든 학년');
    const [classSelected, setClassSelected] = useState('모든 학반');
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

    const filtered = projects
        .filter((project: ProjectNightStudyApplication) => {
            const members = [project.leader, ...project.members];
            const grade =
                gradeSelected === '모든 학년' ? null : Number(gradeSelected[0]);
            const classRoom =
                classSelected === '모든 학반' ? null : Number(classSelected[0]);

            const matchSearch = project.name
                .toLowerCase()
                .includes(searchTerm.trim().toLowerCase());

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

            return matchSearch && matchStudent;
        })
        .sort(byStatusOrder);

    return (
        <PageShell>
            <div className="night-study-page__field-group night-study-page__field-group--two">
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

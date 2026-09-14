import { useState } from 'react';
import { Dropdown } from '@b1nd/dodam-design-system/components';
import { PageShell } from '../../components/PageShell';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { NoPermission, SessionExpired } from '../../components/NoPermission';
import { PullToRefreshList } from '../../components/PullToRefreshList';
import { useNightStudyCounts } from '../../hooks/useNightStudyCounts';
import type { NightStudyTotalCount } from '../../types/nightStudy';
import { getCurrentPeriodValue } from '../../utils/period';
import { DROPDOWN_STYLE } from '../dropdownStyle';
import './index.css';

const PERIODS = [
    { name: '심자 1', value: '1' },
    { name: '심자 2', value: '2' },
];

const GROUPS = [
    { name: '층별', value: 'floors' },
    { name: '학년별', value: 'grades' },
];

const toRows = (counts: NightStudyTotalCount, period: string, group: string) => {
    const periodKey = period === '2' ? 'period2' : 'period1';
    const isGrade = group === 'grades';
    const list = (type: 'personal' | 'project') =>
        isGrade ? counts[type][periodKey].grades : counts[type][periodKey].floors;
    const idOf = (item: ReturnType<typeof list>[number]) =>
        'grade' in item ? item.grade : item.floor;

    const project = list('project');
    const rows = list('personal').map((item) => {
        const id = idOf(item);
        const other = project.find((each) => idOf(each) === id);

        return {
            key: String(id),
            label: isGrade ? `${id}학년` : `${id}층`,
            male: item.male + (other?.male ?? 0),
            female: item.female + (other?.female ?? 0),
        };
    });

    const total = rows.reduce(
        (sum, row) => ({ male: sum.male + row.male, female: sum.female + row.female }),
        { male: 0, female: 0 }
    );

    return [...rows, { key: 'total', label: '전체', ...total }];
};

export const MemberLookupPage = () => {
    // 탭에 들어온 시각에 맞는 교시로 시작한다 (직접 고르면 그 선택을 따른다)
    const [period, setPeriod] = useState(getCurrentPeriodValue);
    const [group, setGroup] = useState('floors');
    const { counts, isLoading, error, authFailure, refetch } = useNightStudyCounts();

    if (authFailure) {
        return (
            <PageShell centered>
                {authFailure === 'forbidden' ? (
                    <NoPermission />
                ) : (
                    <SessionExpired onRetry={() => void refetch()} />
                )}
            </PageShell>
        );
    }

    if (isLoading && !counts) {
        return (
            <PageShell centered>
                <LoadingSpinner />
            </PageShell>
        );
    }

    const rows = counts ? toRows(counts, period, group) : [];

    return (
        <PageShell>
            <div className="night-study-page__field-group night-study-page__field-group--two">
                <Dropdown
                    items={GROUPS}
                    value={group}
                    onSelectedItemChange={(item) => setGroup(item.value)}
                    customStyle={DROPDOWN_STYLE}
                />
                <Dropdown
                    items={PERIODS}
                    value={period}
                    onSelectedItemChange={(item) => setPeriod(item.value)}
                    customStyle={DROPDOWN_STYLE}
                />
            </div>

            <section className="night-study-list" aria-label="심자 남녀 인원">
                <div className="night-study-list__header member-counts">
                    <span>{group === 'grades' ? '학년' : '층'}</span>
                    <span>남</span>
                    <span>녀</span>
                    <span>총인원</span>
                </div>

                {error ? (
                    <p className="night-study-list__error">{error}</p>
                ) : rows.length === 0 ? (
                    <p className="night-study-list__empty">
                        승인된 심자 인원이 없어요.
                    </p>
                ) : (
                    <PullToRefreshList onRefresh={refetch}>
                        {rows.map((row) => (
                            <li key={row.key}>
                                <div className="night-study-list__item night-study-list__item--static">
                                    <span className="night-study-list__info member-counts">
                                        <span>{row.label}</span>
                                        <span>{row.male}명</span>
                                        <span>{row.female}명</span>
                                        <span>{row.male + row.female}명</span>
                                    </span>
                                </div>
                            </li>
                        ))}
                    </PullToRefreshList>
                )}
            </section>
        </PageShell>
    );
};

export default MemberLookupPage;

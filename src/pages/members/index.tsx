import { useState } from 'react';
import { Dropdown } from '@b1nd/dodam-design-system/components';
import { PageShell, CenteredScreen } from '../../components/PageShell';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { NoPermission, SessionExpired } from '../../components/NoPermission';
import { useNightStudyCounts } from '../../hooks/useNightStudyCounts';
import type { PeriodCount } from '../../types/nightStudy';

const PERIODS = [
    { name: '심자 1', value: '1' },
    { name: '심자 2', value: '2' },
];

const pickPeriod = (count: PeriodCount, period: string) =>
    period === '2' ? count.period2 : count.period1;

export const MemberLookupPage = () => {
    const [period, setPeriod] = useState('1');
    const { counts, isLoading, error, authFailure, refetch } = useNightStudyCounts();

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

    if (isLoading && !counts) {
        return (
            <CenteredScreen>
                <LoadingSpinner />
            </CenteredScreen>
        );
    }

    // 층별 인원 아래에 전체 인원을 한 줄 더 붙인다
    const rows = counts
        ? [
              ...counts.floors.map((item) => ({
                  key: String(item.floor),
                  label: `${item.floor}층`,
                  count: pickPeriod(item.count, period),
              })),
              {
                  key: 'total',
                  label: '전체',
                  count: pickPeriod(counts.total, period),
              },
          ]
        : [];

    return (
        <PageShell>
            <div className="night-study-page__field-group night-study-page__field-group--two">
                <Dropdown
                    items={PERIODS}
                    value={period}
                    onSelectedItemChange={(item) => setPeriod(item.value)}
                    customStyle={{ height: '44px' }}
                />
            </div>

            <section className="night-study-list" aria-label="층별 심자 인원">
                <div className="night-study-list__header">
                    <span>층</span>
                    <span aria-hidden="true">·</span>
                    <span>일반 심자</span>
                    <span aria-hidden="true">·</span>
                    <span>프로젝트 심자</span>
                </div>

                {error ? (
                    <p className="night-study-list__error">{error}</p>
                ) : rows.length === 0 ? (
                    <p className="night-study-list__empty">
                        승인된 심자 인원이 없어요.
                    </p>
                ) : (
                    <ul className="night-study-list__items">
                        {rows.map((row) => (
                            <li key={row.key}>
                                <div className="night-study-list__item night-study-list__item--static">
                                    <span className="night-study-list__info">
                                        {row.label}
                                        <span className="night-study-list__dot">·</span>
                                        {row.count.personal}명
                                        <span className="night-study-list__dot">·</span>
                                        {row.count.project}명
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </PageShell>
    );
};

export default MemberLookupPage;

import type { ReactNode } from 'react';
import { TopNavBar } from '@b1nd/dodam-design-system/components';
import { TabBar } from '../TabBar';
import '../../pages/shared.css';

/** 탭 화면 공통 뼈대 — 상단 타이틀 고정, 가운데 내용, 하단 탭바 고정 */
export const PageShell = ({ children }: { children: ReactNode }) => (
    <main className="night-study-page">
        <div className="night-study-page__body">
            <TopNavBar customStyle={{ backgroundColor: 'transparent', padding: 0 }}>
                <TopNavBar.Title hasBackButton>심자 관리</TopNavBar.Title>
            </TopNavBar>

            {children}
        </div>

        <TabBar />
    </main>
);

/** 로딩·권한 안내처럼 화면 전체를 차지하는 상태 */
export const CenteredScreen = ({ children }: { children: ReactNode }) => (
    <main className="night-study-page">
        <div className="night-study-page__body night-study-page__body--centered">
            {children}
        </div>
    </main>
);

export default PageShell;

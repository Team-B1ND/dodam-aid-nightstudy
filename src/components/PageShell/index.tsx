import { useEffect, useRef, useState, type ReactNode } from 'react';
import { TopNavBar } from '@b1nd/dodam-design-system/components';
import { TabBar } from '../TabBar';
import '../../pages/shared.css';

/** 타이틀을 접으면 목록이 늘어나는 높이 (타이틀 + 아래 여백) */
const COLLAPSE_GAIN = 80;

/**
 * 목록을 내리면 타이틀을 접어 목록에 자리를 내준다.
 * 목록의 scroll 이벤트는 위로 전파되지 않아 캡처 단계에서 받는다.
 */
const useScrolledList = () => {
    const rootRef = useRef<HTMLElement>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const handleScroll = (event: Event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) return;
            // 드롭다운 선택지 같은 다른 스크롤에는 반응하지 않는다
            if (!target.classList.contains('night-study-list__items')) return;

            setIsScrolled((wasScrolled) => {
                if (target.scrollTop <= 4) return false;
                // 한 번 접었으면 맨 위로 돌아올 때까지 접어 둔다
                if (wasScrolled) return true;

                // 접어서 늘어난 만큼도 스크롤할 게 없으면 화면이 튀므로 둔다
                return (
                    target.scrollHeight - target.clientHeight > COLLAPSE_GAIN
                );
            });
        };

        root.addEventListener('scroll', handleScroll, true);
        return () => root.removeEventListener('scroll', handleScroll, true);
    }, []);

    return { rootRef, isScrolled };
};

/** 탭 화면 공통 뼈대 — 상단 타이틀, 가운데 내용, 하단 탭바 고정 */
export const PageShell = ({ children }: { children: ReactNode }) => {
    const { rootRef, isScrolled } = useScrolledList();

    return (
        <main
            ref={rootRef}
            className={`night-study-page${
                isScrolled ? ' night-study-page--scrolled' : ''
            }`}
        >
            <div className="night-study-page__body">
                <div className="night-study-page__title">
                    <TopNavBar
                        customStyle={{ backgroundColor: 'transparent', padding: 0 }}
                    >
                        <TopNavBar.Title hasBackButton>심자 관리</TopNavBar.Title>
                    </TopNavBar>
                </div>

                {children}
            </div>

            <TabBar />
        </main>
    );
};

/** 로딩·권한 안내처럼 화면 전체를 차지하는 상태 */
export const CenteredScreen = ({ children }: { children: ReactNode }) => (
    <main className="night-study-page">
        <div className="night-study-page__body night-study-page__body--centered">
            {children}
        </div>
    </main>
);

export default PageShell;

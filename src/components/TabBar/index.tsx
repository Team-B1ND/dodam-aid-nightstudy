import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { useRouter } from '@b1nd/aid-kit/navigation';
import {
    Actions,
    useBridgeProvider,
    type HapticRequest,
} from '@b1nd/aid-kit/bridge-kit/web';
import {
    ArrowLeft,
    Chart,
    CheckmarkCircleFill,
    People,
    Person,
} from '@b1nd/dodam-design-system/icons/mono';
import { TAB_PATHS } from '../../routes';
import './index.css';

const TABS = [
    { path: TAB_PATHS.normal, label: '일반 심자', Icon: Person },
    { path: TAB_PATHS.project, label: '프로젝트 심자', Icon: People },
    { path: TAB_PATHS.members, label: '인원 조회', Icon: Chart },
    { path: TAB_PATHS.attendance, label: '출석 체크', Icon: CheckmarkCircleFill },
];

const SLIDE: KeyframeAnimationOptions = {
    duration: 300,
    easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
};

let lastIndex: number | null = null;

export const TabBar = () => {
    const { tab } = useRouter();
    const { send } = useBridgeProvider();
    const indicatorRef = useRef<HTMLSpanElement>(null);
    const activeIconRef = useRef<HTMLSpanElement>(null);

    // 0번 칸은 뒤로 가기 버튼
    const activeIndex = TABS.findIndex(({ path }) => path === tab.current) + 1;

    useLayoutEffect(() => {
        const from = lastIndex;
        lastIndex = activeIndex;

        if (from === null || from === activeIndex) return;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        indicatorRef.current?.animate(
            [
                { transform: `translateX(${from * 100}%)` },
                { transform: `translateX(${activeIndex * 100}%)` },
            ],
            SLIDE
        );

        // 사각형이 도착하기 전에 흰 아이콘이 배경에 묻히지 않게 색도 같이 바꾼다
        const icon = activeIconRef.current;
        if (!icon) return;
        const style = getComputedStyle(icon);
        icon.animate(
            [
                { color: style.getPropertyValue('--dds-color-text-primary') },
                { color: style.color },
            ],
            SLIDE
        );
    }, [activeIndex]);

    return (
        <nav
            className="tab-bar"
            aria-label="심자 관리 메뉴"
            style={
                {
                    '--tab-count': TABS.length + 1,
                    '--tab-index': activeIndex,
                } as CSSProperties
            }
        >
            <span ref={indicatorRef} className="tab-bar__indicator" aria-hidden="true" />

            <button
                type="button"
                className="tab-bar__item"
                aria-label="도담도담으로 돌아가기"
                onClick={() => send(Actions.NAVIGATION_POP)}
            >
                <span className="tab-bar__icon tab-bar__icon--back">
                    <ArrowLeft size={24} color="currentColor" />
                </span>
            </button>

            {TABS.map(({ path, label, Icon }) => {
                const isActive = tab.current === path;

                return (
                    <button
                        key={path}
                        type="button"
                        className="tab-bar__item"
                        aria-label={label}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => {
                            if (isActive) return;
                            send(Actions.HAPTIC, {
                                style: 'light',
                            } satisfies HapticRequest);
                            tab.move(path);
                        }}
                    >
                        <span
                            ref={isActive ? activeIconRef : undefined}
                            className={`tab-bar__icon${
                                isActive ? ' tab-bar__icon--active' : ''
                            }`}
                        >
                            <Icon size={24} color="currentColor" />
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};

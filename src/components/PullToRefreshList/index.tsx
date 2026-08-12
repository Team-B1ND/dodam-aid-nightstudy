import { useEffect, useRef, useState, type ReactNode } from 'react';
import './index.css';

/** 이만큼 당기면 새로고침한다 */
const THRESHOLD = 64;
/** 당길 수 있는 최대 거리 */
const MAX_PULL = 88;
/** 손가락이 움직인 거리보다 덜 따라오게 해서 고무줄처럼 보이게 한다 */
const RESISTANCE = 0.5;

interface Props {
    /** 새로고침이 끝날 때까지 기다릴 수 있도록 Promise를 돌려준다 */
    onRefresh: () => Promise<unknown> | void;
    children: ReactNode;
    'aria-label'?: string;
}

/**
 * 목록 맨 위에서 아래로 당기면 새로고침되는 목록.
 * `.night-study-list__items`를 그대로 대체한다.
 */
export const PullToRefreshList = ({
    onRefresh,
    children,
    'aria-label': ariaLabel,
}: Props) => {
    const listRef = useRef<HTMLUListElement>(null);
    const [pull, setPull] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    // 터치 핸들러를 다시 붙이지 않으려고 최신 값을 ref로 들고 있는다
    const onRefreshRef = useRef(onRefresh);
    const isRefreshingRef = useRef(false);

    useEffect(() => {
        onRefreshRef.current = onRefresh;
    }, [onRefresh]);

    useEffect(() => {
        const list = listRef.current;
        if (!list) return;

        let startY = 0;
        let isPulling = false;
        let distance = 0;

        const stop = () => {
            isPulling = false;
            distance = 0;
            setPull(0);
        };

        const handleStart = (event: TouchEvent) => {
            if (isRefreshingRef.current || list.scrollTop > 0) return;
            startY = event.touches[0].clientY;
            isPulling = true;
            distance = 0;
        };

        const handleMove = (event: TouchEvent) => {
            if (!isPulling) return;

            const moved = event.touches[0].clientY - startY;

            // 위로 올리거나 이미 스크롤이 내려가 있으면 평범한 스크롤로 둔다
            if (moved <= 0 || list.scrollTop > 0) {
                if (distance !== 0) setPull(0);
                isPulling = false;
                distance = 0;
                return;
            }

            // 브라우저의 기본 당김 동작 대신 우리 인디케이터를 보여준다
            event.preventDefault();
            distance = Math.min(moved * RESISTANCE, MAX_PULL);
            setPull(distance);
        };

        const handleEnd = () => {
            if (!isPulling) return;
            isPulling = false;

            if (distance < THRESHOLD) {
                stop();
                return;
            }

            distance = 0;
            isRefreshingRef.current = true;
            setIsRefreshing(true);
            setPull(THRESHOLD);

            void Promise.resolve(onRefreshRef.current()).finally(() => {
                isRefreshingRef.current = false;
                setIsRefreshing(false);
                setPull(0);
            });
        };

        // preventDefault를 쓰려면 passive가 아니어야 한다
        list.addEventListener('touchstart', handleStart, { passive: true });
        list.addEventListener('touchmove', handleMove, { passive: false });
        list.addEventListener('touchend', handleEnd);
        list.addEventListener('touchcancel', handleEnd);

        return () => {
            list.removeEventListener('touchstart', handleStart);
            list.removeEventListener('touchmove', handleMove);
            list.removeEventListener('touchend', handleEnd);
            list.removeEventListener('touchcancel', handleEnd);
        };
    }, []);

    return (
        <div className="pull-refresh">
            <p className="pull-refresh__hint" style={{ height: Math.max(pull, 0) }}>
                {isRefreshing
                    ? '새로고침 중...'
                    : pull >= THRESHOLD
                      ? '놓으면 새로고침'
                      : '당겨서 새로고침'}
            </p>

            <ul
                ref={listRef}
                className="night-study-list__items"
                aria-label={ariaLabel}
                style={{
                    transform: `translateY(${pull}px)`,
                    transition: pull === 0 ? 'transform 0.2s ease' : 'none',
                }}
            >
                {children}
            </ul>
        </div>
    );
};

export default PullToRefreshList;

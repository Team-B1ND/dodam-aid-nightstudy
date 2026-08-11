import './index.css';

const BlockIcon = () => (
    <svg
        className="no-permission__icon"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
    >
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" />
        <path
            d="M9.86 9.86L38.14 38.14"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
        />
    </svg>
);

const RetryIcon = () => (
    <svg
        className="no-permission__icon no-permission__icon--neutral"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
    >
        <path
            d="M40 24a16 16 0 1 1-4.7-11.3"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
        />
        <path
            d="M40 6v10H30"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

/** 심자 관리 권한이 없는 계정으로 접속했을 때 */
export const NoPermission = () => (
    <section className="no-permission" aria-label="권한 없음">
        <BlockIcon />

        <div className="no-permission__text">
            <h2 className="no-permission__title">권한이 없어요</h2>
            <p className="no-permission__description">
                관리자 계정만 접속할 수 있어요. 심자 관리자 계정으로 접속해주세요.
            </p>
        </div>
    </section>
);

/** 토큰이 만료돼 다시 받아와야 할 때 */
export const SessionExpired = ({ onRetry }: { onRetry: () => void }) => (
    <section className="no-permission" aria-label="로그인 정보 만료">
        <RetryIcon />

        <div className="no-permission__text">
            <h2 className="no-permission__title">다시 시도해주세요</h2>
            <p className="no-permission__description">
                로그인 정보가 만료됐어요. 아래 버튼을 눌러도 안 되면 도담 앱에서
                다시 열어주세요.
            </p>
        </div>

        <button type="button" className="no-permission__retry" onClick={onRetry}>
            다시 시도
        </button>
    </section>
);

export default NoPermission;

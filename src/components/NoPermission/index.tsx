import './index.css';

export const NoPermission = () => (
    <section className="no-permission" aria-label="권한 없음">
        <svg
            className="no-permission__icon"
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            aria-hidden="true"
        >
            <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                d="M9.86 9.86L38.14 38.14"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />
        </svg>

        <div className="no-permission__text">
            <h2 className="no-permission__title">권한이 없어요</h2>
            <p className="no-permission__description">
                관리자 계정만 접속할 수 있어요. 심자 관리자 계정으로 접속해주세요.
            </p>
        </div>
    </section>
);

export default NoPermission;

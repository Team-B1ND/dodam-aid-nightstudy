import './index.css';

export const LoadingSpinner = () => (
    <div className="loading-spinner" role="status" aria-label="불러오는 중">
        <span className="loading-spinner__circle" aria-hidden="true" />
    </div>
);

export default LoadingSpinner;

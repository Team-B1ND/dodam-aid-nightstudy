import type { ReactNode } from 'react';
import './index.css';

interface Props {
    label: string;
    onClose: () => void;
    children: ReactNode;
}

/** 배경을 누르면 닫히는 가운데 정렬 다이얼로그 */
export const Dialog = ({ label, onClose, children }: Props) => (
    <div className="dialog__overlay" onClick={onClose} role="presentation">
        <div
            className="dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={label}
        >
            {children}
        </div>
    </div>
);

export default Dialog;

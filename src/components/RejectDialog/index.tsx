import { useState } from 'react';
import { Dialog } from '../Dialog';

interface Props {
    /** 다이얼로그 상단에 보여줄 대상 이름 */
    title: string;
    isPending: boolean;
    error: string | null;
    onClose: () => void;
    onReject: (reason: string) => void;
}

/** 거절 사유를 입력받는 다이얼로그 (서버가 거절 사유를 요구한다) */
export const RejectDialog = ({
    title,
    isPending,
    error,
    onClose,
    onReject,
}: Props) => {
    const [reason, setReason] = useState('');

    return (
        <Dialog label={`${title} 거절`} onClose={onClose}>
            <h2 className="dialog__title">{title}</h2>
            <p className="dialog__row">거절 사유는 학생에게 그대로 전달돼요.</p>

            <input
                className="dialog__input"
                type="text"
                placeholder="거절 사유를 입력하세요"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                autoFocus
            />

            {error && <p className="dialog__error">{error}</p>}

            <div className="dialog__action-row">
                <button
                    type="button"
                    className="dialog__button dialog__button--neutral"
                    onClick={onClose}
                    disabled={isPending}
                >
                    취소
                </button>
                <button
                    type="button"
                    className="dialog__button dialog__button--danger"
                    onClick={() => onReject(reason.trim())}
                    disabled={isPending || !reason.trim()}
                >
                    거절하기
                </button>
            </div>
        </Dialog>
    );
};

export default RejectDialog;

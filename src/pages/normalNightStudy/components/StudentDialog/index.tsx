import { useState } from 'react';
import { Dialog } from '../../../../components/Dialog';
import type { PersonalNightStudyApplication } from '../../../../types/nightStudy';

interface Props {
    application: PersonalNightStudyApplication;
    isPending: boolean;
    error: string | null;
    onClose: () => void;
    onAllow: () => void;
    onReject: (reason: string) => void;
    onRevert: () => void;
}

export const StudentDialog = ({
    application,
    isPending,
    error,
    onClose,
    onAllow,
    onReject,
    onRevert,
}: Props) => {
    const [rejectReason, setRejectReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const isAllowed = application.status === 'ALLOWED';
    const isRejected = application.status === 'REJECTED';

    return (
        <Dialog label={`${application.leader.name} 심자 신청`} onClose={onClose}>
            <h2 className="dialog__title">{application.leader.name}</h2>

            <div className="dialog__rows">
                <p className="dialog__row">심자 사유 : {application.description}</p>
                <p className="dialog__row">
                    휴대폰: {application.needPhone ? '필요' : '불필요'}
                </p>
                <p className="dialog__row">
                    휴대폰 신청 사유 : {application.needPhoneReason ?? ''}
                </p>
                {isRejected && (
                    <p className="dialog__row">
                        거절 사유: {application.rejectionReason}
                    </p>
                )}
            </div>

            {error && <p className="dialog__error">{error}</p>}

            {isRejecting ? (
                <div className="dialog__actions">
                    <input
                        className="dialog__input"
                        type="text"
                        placeholder="거절 사유를 입력하세요"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        autoFocus
                    />
                    <div className="dialog__action-row">
                        <button
                            type="button"
                            className="dialog__button dialog__button--neutral"
                            onClick={() => setIsRejecting(false)}
                            disabled={isPending}
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            className="dialog__button dialog__button--danger"
                            onClick={() => onReject(rejectReason.trim())}
                            disabled={isPending || !rejectReason.trim()}
                        >
                            거절하기
                        </button>
                    </div>
                </div>
            ) : (
                <div className="dialog__actions">
                    {isAllowed || isRejected ? (
                        <button
                            type="button"
                            className="dialog__button dialog__button--danger"
                            onClick={onRevert}
                            disabled={isPending}
                        >
                            되돌리기
                        </button>
                    ) : (
                        <div className="dialog__action-row">
                            <button
                                type="button"
                                className="dialog__button dialog__button--allow"
                                onClick={onAllow}
                                disabled={isPending}
                            >
                                승인
                            </button>
                            <button
                                type="button"
                                className="dialog__button dialog__button--danger"
                                onClick={() => setIsRejecting(true)}
                                disabled={isPending}
                            >
                                거절
                            </button>
                        </div>
                    )}

                    <button
                        type="button"
                        className="dialog__button dialog__button--neutral"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        닫기
                    </button>
                </div>
            )}
        </Dialog>
    );
};

export default StudentDialog;

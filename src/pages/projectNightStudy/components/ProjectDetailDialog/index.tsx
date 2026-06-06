import { useState } from 'react';
import { Calendar } from '@b1nd/dodam-design-system/icons/mono';
import './index.css';
import type { ProjectNightStudyApplication } from '../../../../types/nightStudy';

interface Props {
    project: ProjectNightStudyApplication;
    onClose: () => void;
    onApprove: () => void;
    onReject: (reason: string) => void;
}

const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

const formatStudentId = (student: {
    grade: number;
    room: number;
    number: number;
}) =>
    `${student.grade}${student.room}${String(student.number).padStart(2, '0')}`;

export const ProjectDetailDialog = ({
    project,
    onClose,
    onApprove,
    onReject,
}: Props) => {
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    const allMembers = [project.leader, ...project.members].filter(
        (member, index, members) => {
            const key = member.publicId ?? `${member.name}-${member.student
                ? formatStudentId(member.student)
                : 'no-student'}`;
            return members.findIndex((item) => {
                const itemKey = item.publicId ?? `${item.name}-${item.student
                    ? formatStudentId(item.student)
                    : 'no-student'}`;
                return itemKey === key;
            }) === index;
        }
    );

    return (
        <div
            className="project-dialog__overlay"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="project-dialog"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={`${project.name} 프로젝트 정보`}
            >
                <h2 className="project-dialog__title">
                    {project.name}의 프로젝트 정보
                </h2>

                <ul className="project-dialog__info">
                    <li>
                        <span className="project-dialog__label">자습 일시</span>
                        <span className="project-dialog__value project-dialog__value--date">
                            {formatDate(project.startAt)}
                            <span
                                className="project-dialog__calendar-icon"
                                aria-hidden="true"
                            >
                                <Calendar size={18} color="currentColor" />
                            </span>
                        </span>
                    </li>
                    <li>
                        <span className="project-dialog__label">자습 장소</span>
                        <span className="project-dialog__value">
                            {project.room?.name ?? '장소 미정'}
                        </span>
                    </li>
                    <li>
                        <span className="project-dialog__label">참여인원</span>
                    </li>
                </ul>

                <hr className="project-dialog__divider" />

                <ul className="project-dialog__members">
                    {allMembers.map((member) => (
                        <li
                            key={member.publicId}
                            className="project-dialog__member"
                        >
                            <span>{member.name}</span>
                            <span
                                className="project-dialog__dot"
                                aria-hidden="true"
                            >
                                ·
                            </span>
                            <span>
                                {member.student
                                    ? formatStudentId(member.student)
                                    : '-'}
                            </span>
                        </li>
                    ))}
                </ul>

                {showRejectInput ? (
                    <div className="project-dialog__reject-area">
                        <input
                            className="project-dialog__reject-input"
                            type="text"
                            placeholder="거절 사유를 입력하세요"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="project-dialog__actions">
                            <button
                                type="button"
                                className="project-dialog__btn project-dialog__btn--reject"
                                onClick={() => setShowRejectInput(false)}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                className="project-dialog__btn project-dialog__btn--approve"
                                onClick={() => onReject(rejectReason)}
                                disabled={!rejectReason.trim()}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="project-dialog__actions">
                        <button
                            type="button"
                            className="project-dialog__btn project-dialog__btn--reject"
                            onClick={() => setShowRejectInput(true)}
                        >
                            거절하기
                        </button>
                        <button
                            type="button"
                            className="project-dialog__btn project-dialog__btn--approve"
                            onClick={onApprove}
                        >
                            승인하기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

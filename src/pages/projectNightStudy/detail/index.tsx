import { useState } from 'react';
import { useRouter, type RouteProps } from '@b1nd/aid-kit/navigation';
import { ArrowLeft, Person } from '@b1nd/dodam-design-system/icons/mono';
import { useApplicationActions } from '../../../hooks/useApplicationActions';
import type {
    NightStudyRoom,
    NightStudyStatus,
    NightStudyUser,
    ProjectNightStudyApplication,
} from '../../../types/nightStudy';
import { RoomAssignDialog } from './RoomAssignDialog';
import { RejectDialog } from '../../../components/RejectDialog';
import './index.css';

const formatDate = (value: string) => (value ? value.slice(0, 10) : '-');

const getStudentNumber = (user: NightStudyUser) => {
    if (!user.student) return '';
    return `${user.student.grade}${user.student.room}${String(
        user.student.number
    ).padStart(2, '0')}`;
};

export const ProjectDetailPage = ({ state }: RouteProps) => {
    const { stack } = useRouter();
    const project = (state as { project?: ProjectNightStudyApplication } | undefined)
        ?.project;

    const [status, setStatus] = useState<NightStudyStatus | undefined>(
        project?.status
    );
    const [room, setRoom] = useState<NightStudyRoom | null | undefined>(
        project?.room
    );
    const [rejectionReason, setRejectionReason] = useState(
        project?.rejectionReason ?? null
    );
    const [isAssigning, setIsAssigning] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const actions = useApplicationActions();

    if (!project) {
        return (
            <div className="project-detail">
                <p className="project-detail__empty">프로젝트 정보를 찾을 수 없어요.</p>
            </div>
        );
    }

    const members = [project.leader, ...project.members].filter(
        (member, index, all) =>
            all.findIndex((item) => item.publicId === member.publicId) === index
    );
    const isAllowed = status === 'ALLOWED';

    const handleAllow = async () => {
        if (await actions.allow(project.id)) {
            setStatus('ALLOWED');
            setRejectionReason(null);
        }
    };

    const handleReject = async (reason: string) => {
        if (!(await actions.reject(project.id, reason))) return;
        setStatus('REJECTED');
        setRejectionReason(reason);
        setIsRejecting(false);
    };

    const handleRevert = async () => {
        if (await actions.revert(project.id)) {
            setStatus('PENDING');
            setRejectionReason(null);
        }
    };

    const handleAssign = async (selectedRoom: NightStudyRoom) => {
        if (!(await actions.assign(project.id, selectedRoom.id))) return;
        setRoom(selectedRoom);
        setIsAssigning(false);
    };

    return (
        <div className="project-detail">
            <header className="project-detail__header">
                <button
                    type="button"
                    className="project-detail__back"
                    aria-label="뒤로 가기"
                    onClick={() => stack.pop()}
                >
                    <ArrowLeft size={24} color="currentColor" />
                </button>
                <h1 className="project-detail__title">
                    {project.name}의 프로젝트 정보
                </h1>
            </header>

            <div className="project-detail__body">
                <dl className="project-detail__info">
                    <div className="project-detail__row">
                        <dt>진행 시간</dt>
                        <dd>심자 {project.period >= 2 ? 2 : 1}</dd>
                    </div>
                    <div className="project-detail__row">
                        <dt>시작일</dt>
                        <dd>{formatDate(project.startAt)}</dd>
                    </div>
                    <div className="project-detail__row">
                        <dt>종료일</dt>
                        <dd>{formatDate(project.endAt)}</dd>
                    </div>
                    <div className="project-detail__row">
                        <dt>자습 장소</dt>
                        <dd>{room?.name ?? '장소 미정'}</dd>
                    </div>
                    <div className="project-detail__row">
                        <dt>희망 장소</dt>
                        <dd>{project.wishRoom?.name ?? '없음'}</dd>
                    </div>
                </dl>

                <section className="project-detail__section">
                    <h2 className="project-detail__label">프로젝트 설명</h2>
                    <p className="project-detail__description">
                        {project.description}
                    </p>
                </section>

                {status === 'REJECTED' && (
                    <dl className="project-detail__info">
                        <div className="project-detail__row">
                            <dt>거절 사유</dt>
                            <dd>{rejectionReason ?? '-'}</dd>
                        </div>
                    </dl>
                )}

                <section className="project-detail__section">
                    <h2 className="project-detail__label">참여 명단</h2>
                    <ul className="project-detail__members">
                        {members.map((member) => (
                            <li key={member.publicId} className="project-detail__member">
                                <span className="project-detail__avatar" aria-hidden="true">
                                    <Person size={16} color="currentColor" />
                                </span>
                                {member.name}
                                <span className="project-detail__dot">·</span>
                                {getStudentNumber(member)}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {actions.error && (
                <p className="project-detail__error">{actions.error}</p>
            )}

            <div
                className={`project-detail__actions ${
                    status === 'REJECTED' ? 'project-detail__actions--single' : ''
                }`}
            >
                {status === 'REJECTED' ? (
                    <button
                        type="button"
                        className="project-detail__button project-detail__button--danger"
                        onClick={() => void handleRevert()}
                        disabled={actions.isPending}
                    >
                        되돌리기
                    </button>
                ) : isAllowed ? (
                    <>
                        <button
                            type="button"
                            className="project-detail__button project-detail__button--danger"
                            onClick={() => void handleRevert()}
                            disabled={actions.isPending}
                        >
                            되돌리기
                        </button>
                        <button
                            type="button"
                            className="project-detail__button project-detail__button--primary"
                            onClick={() => setIsAssigning(true)}
                            disabled={actions.isPending}
                        >
                            랩실 지정
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            className="project-detail__button project-detail__button--danger"
                            onClick={() => setIsRejecting(true)}
                            disabled={actions.isPending}
                        >
                            거절하기
                        </button>
                        <button
                            type="button"
                            className="project-detail__button project-detail__button--primary"
                            onClick={() => void handleAllow()}
                            disabled={actions.isPending}
                        >
                            승인하기
                        </button>
                    </>
                )}
            </div>

            {isAssigning && (
                <RoomAssignDialog
                    initialRoomId={room?.id}
                    period={project.period}
                    isPending={actions.isPending}
                    error={actions.error}
                    onClose={() => setIsAssigning(false)}
                    onAssign={(selectedRoom) => void handleAssign(selectedRoom)}
                />
            )}

            {isRejecting && (
                <RejectDialog
                    title={project.name}
                    isPending={actions.isPending}
                    error={actions.error}
                    onClose={() => setIsRejecting(false)}
                    onReject={(reason) => void handleReject(reason)}
                />
            )}
        </div>
    );
};

export default ProjectDetailPage;

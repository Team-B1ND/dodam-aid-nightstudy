import { useEffect, useState } from 'react';
import { Dialog } from '../../../components/Dialog';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { getRooms } from '../../../types/nightStudy';
import type { NightStudyRoom, ProjectRoom } from '../../../types/nightStudy';
import './RoomAssignDialog.css';

interface Props {
    initialRoomId?: number;
    /** 이 프로젝트가 쓰는 교시 (그 교시에 비어 있는 실만 지정할 수 있다) */
    period: number;
    isPending: boolean;
    error: string | null;
    onClose: () => void;
    onAssign: (room: NightStudyRoom) => void;
}

export const RoomAssignDialog = ({
    initialRoomId,
    period,
    isPending,
    error,
    onClose,
    onAssign,
}: Props) => {
    const [rooms, setRooms] = useState<ProjectRoom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedRoomId, setSelectedRoomId] = useState<number | undefined>(
        initialRoomId
    );

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await getRooms();
                if (!cancelled) setRooms(res.data);
            } catch (e) {
                console.error(e);
                if (!cancelled) setLoadError('실 목록을 불러오지 못했어요.');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <Dialog label="프로젝트 실 지정" onClose={onClose}>
            <span className="room-assign__caption">프로젝트 실 지정</span>

            {isLoading ? (
                <LoadingSpinner />
            ) : loadError ? (
                <p className="dialog__error">{loadError}</p>
            ) : (
                <div className="room-assign__grid">
                    {rooms.map((room) => {
                        // 이미 이 프로젝트에 지정된 실은 그대로 둘 수 있어야 한다
                        const inUse =
                            room.id !== initialRoomId &&
                            (period >= 2 ? room.inUse.period2 : room.inUse.period1);

                        return (
                            <label key={room.id} className="room-assign__room">
                                <input
                                    type="radio"
                                    name="night-study-room"
                                    className="room-assign__radio"
                                    checked={selectedRoomId === room.id}
                                    disabled={inUse}
                                    onChange={() => setSelectedRoomId(room.id)}
                                />
                                <span className="room-assign__text">
                                    <span className="room-assign__name">{room.name}</span>
                                    <span
                                        className={`room-assign__hint ${
                                            inUse ? 'room-assign__hint--in-use' : ''
                                        }`}
                                    >
                                        {inUse ? '사용 중' : '실 지정 가능'}
                                    </span>
                                </span>
                            </label>
                        );
                    })}
                </div>
            )}

            {error && <p className="dialog__error">{error}</p>}

            <button
                type="button"
                className="dialog__button dialog__button--allow"
                disabled={selectedRoomId === undefined || isPending}
                onClick={() => {
                    const selected = rooms.find((room) => room.id === selectedRoomId);
                    if (selected) onAssign(selected);
                }}
            >
                지정완료
            </button>
        </Dialog>
    );
};

export default RoomAssignDialog;

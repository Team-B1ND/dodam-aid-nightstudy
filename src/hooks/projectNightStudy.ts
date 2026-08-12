export type NightStudyStatus = 'PENDING' | 'ALLOWED' | 'REJECTED';

export interface NightStudyUser {
    publicId: string;
    name: string;
    student?: {
        grade: number;
        room: number;
        number: number;
    };
}

export interface NightStudyRoom {
    id: number;
    name: string;
}

export interface ProjectNightStudyApplication {
    id: string;
    name: string;
    description: string;
    period: number;
    startAt: string;
    endAt: string;
    rejectionReason: string | null;
    status: NightStudyStatus;
    leader: NightStudyUser;
    members: NightStudyUser[];
    type: 'PROJECT';
    /** 배정된 자습 장소 */
    room: NightStudyRoom | null;
    /** 신청할 때 학생이 적어낸 희망 장소 */
    wishRoom: NightStudyRoom | null;
}

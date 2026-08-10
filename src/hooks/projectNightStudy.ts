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
    room: NightStudyRoom | null;
}

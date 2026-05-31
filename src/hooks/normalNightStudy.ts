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

export interface PersonalNightStudyApplication {
    id: string;
    description: string;
    period: number;
    startAt: string;
    endAt: string;
    rejectionReason: string | null;
    status: NightStudyStatus;
    needPhone: boolean;
    needPhoneReason: string | null;
    leader: NightStudyUser;
    members: NightStudyUser[];
    type: 'PERSONAL';
    room: NightStudyRoom | null;
}

import {
    SegmentedButton,
    type SegmentedButtonData,
    Dropdown,
    TextField,
    TopNavBar,
} from '@b1nd/dodam-design-system/components';
import { useState, useEffect } from 'react';
import { NormalNightStudy, type NormalNightStudyItem } from './normalNightStudy';
import { ProjectNightStudy } from './projectNightStudy';
import {
    getPersonalApplications,
    type PersonalNightStudyApplication,
} from '../types/nightStudy';
import { getAuthFailure, type AuthFailure } from '../api/error';
import { NoPermission, SessionExpired } from '../components/NoPermission';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useNightStudyAttendance } from '../hooks/useNightStudyAttendance';

import './index.css';

const toNormalItem = (item: PersonalNightStudyApplication): NormalNightStudyItem => ({
    id: item.id,
    userId: item.leader.publicId,
    studentName: item.leader.name,
    classInfo: item.leader.student
        ? `${item.leader.student.grade}${item.leader.student.room}${String(item.leader.student.number).padStart(2, '0')}`
        : '',
    time: item.period === 1 ? '심자1' : '심자2',
    checked: false,
});

const NightStudyPage = () => {
    const [segmentData, setSegmentData] = useState<SegmentedButtonData[]>([
        { text: '일반 심자', isActive: true, value: 'normal' },
        { text: '프로젝트 심자', isActive: false, value: 'project' },
    ]);

    const [gradeSelected, setGradeSelected] = useState<string>('모든 학년');
    const [classRoomSelected, setClassRoomSelected] = useState<string>('모든 학반');
    const [timeSelected, setTimeSelected] = useState<string>('모든 시간');
    const [searchNormalTerm, setSearchNormalTerm] = useState<string>('');
    const [searchProjectTerm, setSearchProjectTerm] = useState<string>('');

    const [normalItems, setNormalItems] = useState<NormalNightStudyItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authFailure, setAuthFailure] = useState<AuthFailure | null>(null);
    /** 다시 시도 버튼으로 목록 조회를 다시 돌리기 위한 값 */
    const [reloadCount, setReloadCount] = useState(0);

    const grade = [
        { name: '모든 학년', value: '모든 학년' },
        { name: '1학년', value: '1학년' },
        { name: '2학년', value: '2학년' },
        { name: '3학년', value: '3학년' },
    ];

    const classRoom = [
        { name: '모든 학반', value: '모든 학반' },
        { name: '1반', value: '1반' },
        { name: '2반', value: '2반' },
        { name: '3반', value: '3반' },
        { name: '4반', value: '4반' },
    ];

    const time = [
        { name: '모든 시간', value: '모든 시간' },
        { name: '심자1', value: '심자1' },
        { name: '심자2', value: '심자2' },
    ];

    const activeType = segmentData.find((item) => item.isActive)?.value ?? 'normal';

    useEffect(() => {
        if (activeType !== 'normal') return;

        const fetchAll = async () => {
            setLoading(true);
            setError(null);
            setAuthFailure(null);
            try {
                // 출석 대상은 승인된 신청만이라 ALLOWED만 가져온다
                const res = await getPersonalApplications({
                    page: 0,
                    size: 100,
                    status: 'ALLOWED',
                });
                setNormalItems(res.data.content.map(toNormalItem));
            } catch (e) {
                const failure = getAuthFailure(e);
                if (failure) setAuthFailure(failure);
                else setError('심자 목록을 불러오지 못했어요.');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [activeType, reloadCount]);

    // 신청서의 period는 "심자 N까지"라는 뜻이라 출석은 교시별로 따로 기록된다.
    // 심자2를 보고 있을 때만 2교시 출석을, 그 외에는 1교시 출석을 다룬다.
    const attendancePeriod = timeSelected === '심자2' ? 2 : 1;

    const visibleNormalItems = normalItems.filter((item) => {
        const gradeNum = gradeSelected === '모든 학년' ? null : gradeSelected.replace('학년', '');
        const classNum = classRoomSelected === '모든 학반' ? null : classRoomSelected.replace('반', '');
        const timeFilter = timeSelected === '모든 시간' ? null : timeSelected;

        const matchGrade = gradeNum ? item.classInfo[0] === gradeNum : true;
        const matchClass = classNum ? item.classInfo[1] === classNum : true;
        const matchTime = timeFilter ? item.time === timeFilter : true;
        const matchSearch = searchNormalTerm ? item.studentName.includes(searchNormalTerm) : true;

        return matchGrade && matchClass && matchTime && matchSearch;
    });

    // 화면에 보이는 학생만 조회 대상으로 둬서 갱신 비용을 줄인다
    const attendanceTargets = visibleNormalItems.map(({ userId }) => ({
        userId,
        period: attendancePeriod,
    }));

    const {
        isAttended,
        toggleAttendance,
        isLoading: attendanceLoading,
    } = useNightStudyAttendance(attendanceTargets);

    const handleToggleCheck = (id: string) => {
        const item = normalItems.find((i) => i.id === id);
        if (!item) return;
        void toggleAttendance(item.userId, attendancePeriod);
    };

    const filteredNormalItems = visibleNormalItems.map((item) => ({
        ...item,
        checked: isAttended(item.userId, attendancePeriod),
    }));

    if (authFailure) {
        return (
            <main className="night-study-page night-study-page--centered">
                {authFailure === 'forbidden' ? (
                    <NoPermission />
                ) : (
                    <SessionExpired
                        onRetry={() => setReloadCount((count) => count + 1)}
                    />
                )}
            </main>
        );
    }

    // 처음 들어오거나 새로고침한 직후에는 빈 화면에 로딩만 보여준다
    if (loading && activeType === 'normal' && normalItems.length === 0) {
        return (
            <main className="night-study-page night-study-page--centered">
                <LoadingSpinner />
            </main>
        );
    }

    return (
        <main
            className={`night-study-page ${
                activeType === 'project' ? 'night-study-page--project' : ''
            }`}
        >
            <TopNavBar
                customStyle={{ backgroundColor: 'transparent', padding: 0 }}
            >
                <TopNavBar.Title hasBackButton>심자 관리</TopNavBar.Title>
            </TopNavBar>

            <SegmentedButton
                data={segmentData}
                setData={setSegmentData}
                width="100%"
            />

            <div
                className={`night-study-page__field-group ${
                    activeType === 'project'
                        ? 'night-study-page__field-group--project'
                        : ''
                }`}
            >
                <Dropdown
                    items={grade}
                    value={gradeSelected}
                    onSelectedItemChange={(item) => setGradeSelected(item.value)}
                    customStyle={{ height: '50px' }}
                />
                <Dropdown
                    items={classRoom}
                    value={classRoomSelected}
                    onSelectedItemChange={(item) => setClassRoomSelected(item.value)}
                    customStyle={{ height: '50px' }}
                />
                {activeType === 'normal' && (
                    <Dropdown
                        items={time}
                        value={timeSelected}
                        onSelectedItemChange={(item) => setTimeSelected(item.value)}
                        customStyle={{ height: '50px' }}
                    />
                )}
            </div>

            <div className="night-study-page__search">
                <TextField
                    type="text"
                    label=""
                    value={activeType === 'normal' ? searchNormalTerm : searchProjectTerm}
                    placeholder={activeType === 'normal' ? '학생 검색' : '프로젝트 검색'}
                    onChange={(e) => {
                        if (activeType === 'normal') setSearchNormalTerm(e.target.value);
                        else setSearchProjectTerm(e.target.value);
                    }}
                />
            </div>

            {activeType === 'normal' ? (
                loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <p style={{ color: 'var(--dds-color-status-error)', fontSize: '14px' }}>
                        {error}
                    </p>
                ) : (
                    <NormalNightStudy
                        items={filteredNormalItems}
                        onToggleCheck={handleToggleCheck}
                        isCheckDisabled={attendanceLoading}
                        periodLabel={`심자${attendancePeriod}`}
                    />
                )
            ) : (
                <ProjectNightStudy
                    searchTerm={searchProjectTerm}
                    gradeSelected={gradeSelected}
                    classSelected={classRoomSelected}
                />
            )}
        </main>
    );
};

export default NightStudyPage;

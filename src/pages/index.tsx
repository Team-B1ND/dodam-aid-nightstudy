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
import { isForbiddenError } from '../api/error';
import { NoPermission } from '../components/NoPermission';
import { useNightStudyAttendance } from '../hooks/useNightStudyAttendance';

import './index.css';

const toNormalItem = (item: PersonalNightStudyApplication): NormalNightStudyItem => ({
    id: item.id,
    userId: item.leader.publicId,
    period: item.period,
    studentName: item.leader.name,
    classInfo: item.leader.student
        ? `${item.leader.student.grade}${item.leader.student.room}${String(item.leader.student.number).padStart(2, '0')}`
        : '',
    time: item.period === 1 ? '심자1' : '심자2',
    status: item.status === 'ALLOWED' ? 'ALLOWED' : 'PENDING',
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
    const [forbidden, setForbidden] = useState(false);

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
            setForbidden(false);
            try {
                const [pendingRes, allowedRes] = await Promise.all([
                    getPersonalApplications({ page: 0, size: 100, status: 'PENDING' }),
                    getPersonalApplications({ page: 0, size: 100, status: 'ALLOWED' }),
                ]);
                const merged = [
                    ...allowedRes.data.content.map(toNormalItem),
                    ...pendingRes.data.content.map(toNormalItem),
                ];
                setNormalItems(merged);
            } catch (e) {
                if (isForbiddenError(e)) setForbidden(true);
                else setError('심자 목록을 불러오지 못했어요.');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [activeType]);

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

    if (forbidden) {
        return (
            <main className="night-study-page night-study-page--forbidden">
                <NoPermission />
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
                onBlockClick={(value) => console.log(value)}
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
                    <p style={{ color: 'var(--dds-color-text-tertiary)', fontSize: '14px' }}>
                        불러오는 중...
                    </p>
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

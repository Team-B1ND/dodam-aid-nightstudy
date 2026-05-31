import { SegmentedButton, type SegmentedButtonData, Dropdown, TextField } from '@b1nd/dodam-design-system/components';
import { useState, useEffect } from 'react';
import { NormalNightStudy, type NormalNightStudyItem } from './normalNightStudy';
import {
  getPersonalApplications,
  allowApplication,
  pendingApplication,
  type PersonalNightStudyApplication,
} from '../api/nightStudy';

import './index.css';

const toNormalItem = (item: PersonalNightStudyApplication): NormalNightStudyItem => ({
  id: item.id,
  studentName: item.leader.name,
  classInfo: item.leader.student
      ? `${item.leader.student.grade}${item.leader.student.room}${String(item.leader.student.number).padStart(2, '0')}`
      : '',
  time: item.period === 1 ? '심자1' : '심자2',
  status: item.status === 'ALLOWED' ? 'ALLOWED' : 'PENDING',
  checked: false,
});

const NightStudyPage = () => {
  const [data, setData] = useState<SegmentedButtonData[]>([
    { text: '일반', isActive: true, value: 'normal' },
    { text: '프로젝트', isActive: false, value: 'project' },
  ]);

  const [gradeSelected, setGradeSelected] = useState<string>('모든 학년');
  const [classRoomSelected, setClassRoomSelected] = useState<string>('모든 학반');
  const [timeSelected, setTimeSelected] = useState<string>('모든 시간');
  const [searchNormalTerm, setSearchNormalTerm] = useState<string>('');
  const [searchProjectTerm, setSearchProjectTerm] = useState<string>('');

  const [normalItems, setNormalItems] = useState<NormalNightStudyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const activeType = data.find((item) => item.isActive)?.value ?? 'normal';

  useEffect(() => {
    if (activeType !== 'normal') return;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        // PENDING + ALLOWED 두 번 요청해서 합치기
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
        setError('심자 목록을 불러오지 못했어요.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [activeType]);

  const handleToggleCheck = (id: string) => {
    setNormalItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };

  const filteredNormalItems = normalItems.filter((item) => {
    const gradeNum = gradeSelected === '모든 학년' ? null : gradeSelected.replace('학년', '');
    const classNum = classRoomSelected === '모든 학반' ? null : classRoomSelected.replace('반', '');
    const timeFilter = timeSelected === '모든 시간' ? null : timeSelected;

    const matchGrade = gradeNum ? item.classInfo[0] === gradeNum : true;
    const matchClass = classNum ? item.classInfo[1] === classNum : true;
    const matchTime = timeFilter ? item.time === timeFilter : true;
    const matchSearch = searchNormalTerm ? item.studentName.includes(searchNormalTerm) : true;

    return matchGrade && matchClass && matchTime && matchSearch;
  });

  return (
      <main className="night-study-page">
        <h1 className="night-study-page__title">심야 자습 관리</h1>

        <SegmentedButton
            data={data}
            setData={setData}
            onBlockClick={(value) => console.log(value)}
            width="100%"
        />

        <div className="night-study-page__field-group">
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

        {activeType === 'normal' && (
            loading
                ? <p style={{ color: 'var(--dds-color-text-tertiary)', fontSize: '14px' }}>불러오는 중...</p>
                : error
                    ? <p style={{ color: 'var(--dds-color-status-error)', fontSize: '14px' }}>{error}</p>
                    : <NormalNightStudy items={filteredNormalItems} onToggleCheck={handleToggleCheck} />
        )}
      </main>
  );
};

export default NightStudyPage;
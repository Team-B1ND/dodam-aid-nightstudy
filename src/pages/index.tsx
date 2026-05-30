import { SegmentedButton, type SegmentedButtonData, Dropdown, TextField } from '@b1nd/dodam-design-system/components'
import { useState } from 'react'

import './index.css'


const NightStudyPage = () => {
  // 일반/프심 세그먼트
  const [data, setData] = useState<SegmentedButtonData[]>([
    { text: "일반", isActive: true, value: "normal" },
    { text: "프로젝트", isActive: false, value: "project" },
  ]);
  
  // 학년 드롭다운 옵션
  const [gradeSelected, setGradeSelected] = useState<string>("모든 학년");

  // 학반 드롭다운 옵션
  const [classRoomSelected, setClassRoomSelected] = useState<string>("모든 학반");
  
  // 학년 드롭다운 케이스
  const grade = [
    { name: "모든 학년", value: "모든 학년" },
    { name: "1학년", value: "1학년" },
    { name: "2학년", value: "2학년" },
    { name: "3학년", value: "3학년" },
  ];

  // 학반 드롭다운 케이스
  const classRoom = [
    { name: "모든 학반", value: "모든 학반" },
    { name: "1반", value: "1반" },
    { name: "2반", value: "2반" },
    { name: "3반", value: "3반" },
    { name: "4반", value: "4반" },
  ];
  // 일반 심자 검색
  const [searchNormalTerm, setSearchNormalTerm] = useState<string>("");
  // 프젝 심자 검색
  const [searchProjectTerm, setSearchProjectTerm] = useState<string>("");


  const activeType = data.find((item) => item.isActive)?.value ?? "normal";


  return (
    <main className="night-study-page">
      <h1 className="night-study-page__title">심야 자습 관리</h1>
        <SegmentedButton
          data={data}
          setData={setData}
          onBlockClick={(value) => {
            console.log(value)
          }}
          width='100%'
          />
          <div className="night-study-page__field-group">
            <Dropdown
              items={grade}
              value={gradeSelected}
              onSelectedItemChange={(item) => setGradeSelected(item.value)}
              customStyle={{height: "50px"}}
            />
            <Dropdown
              items={classRoom}
              value={classRoomSelected}
              onSelectedItemChange={(item) => setClassRoomSelected(item.value)}
              customStyle={{height: "50px"}}
            />
          </div>

          <div className="night-study-page__search">
            <TextField
              type='text'
              label=''
              value={activeType === "normal" ? searchNormalTerm : searchProjectTerm}
              placeholder={activeType === "normal" ? "학생 검색" : "프로젝트 검색"}
              onChange={(e) => {
                if (activeType === "normal") {
                  setSearchNormalTerm(e.target.value);
                } else {
                  setSearchProjectTerm(e.target.value);
                }
              }}
            />
      </div>
    </main>
  );
};

export default NightStudyPage;

import { SegmentedButton, type SegmentedButtonData, Dropdown, FilledTextField } from '@b1nd/dodam-design-system/components'
import { useState } from 'react'
import './index.css'

const NightStudyPage = () => {
  const [data, setData] = useState<SegmentedButtonData[]>([
    { text: "일반", isActive: true, value: "normal" },
    { text: "프로젝트", isActive: false, value: "project" },
  ]);

  const [selected, setSelected] = useState<string>("option1");
  const items = [
    { name: "Option 1", value: "option1" },
    { name: "Option 2", value: "option2" },
    { name: "Option 3", value: "option3" },
  ];

  const activeType = data.find((item) => item.isActive)?.value ?? "normal";

  return (
    <main className="night-study-page">
      <section className="night-study-page__hero">
        <p className="night-study-page__eyebrow">DODAM AID</p>
        <h1 className="night-study-page__title">심야 자습 관리</h1>
        <p className="night-study-page__description">
          모바일 웹뷰에서 바로 조작할 수 있도록 필요한 입력만 한 화면에 배치했습니다.
        </p>
      </section>

      <section className="night-study-page__controls">
        <SegmentedButton
          data={data}
          setData={setData}
          onBlockClick={(value) => {
            console.log(value)
          }}
        />

        <div className="night-study-page__card">
          <div className="night-study-page__field-group">
            <Dropdown
              items={items}
              value={selected}
              onSelectedItemChange={(item) => setSelected(item.value)}
            />
            <Dropdown
              items={items}
              value={selected}
              onSelectedItemChange={(item) => setSelected(item.value)}
            />
            <Dropdown
              items={items}
              value={selected}
              onSelectedItemChange={(item) => setSelected(item.value)}
            />
          </div>

          <div className="night-study-page__search">
            <FilledTextField
              type='text'
              label=""
              placeholder={activeType === "normal" ? "학생 검색" : "프로젝트 검색"}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default NightStudyPage;

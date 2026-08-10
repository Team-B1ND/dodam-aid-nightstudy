import './index.css';

export type NightStudyStatus = 'ALLOWED' | 'PENDING';

export type NightStudyTime = '심자1' | '심자2';

export interface NormalNightStudyItem {
  id: string;
  userId: string;
  period: number;
  studentName: string;
  classInfo: string;
  time: NightStudyTime;
  timeSuffix?: string;
  status: NightStudyStatus;
  /** 오늘자 출석 여부 */
  checked: boolean;
}

interface NormalNightStudyProps {
  items: NormalNightStudyItem[];
  onToggleCheck: (id: string) => void;
  onItemClick?: (id: string) => void;
  onStatusClick?: (id: string) => void;
  /** 출석 상태를 불러오는 중이면 체크박스를 잠근다 */
  isCheckDisabled?: boolean;
  /** 체크박스가 다루는 출석 교시 (예: `심자1`) */
  periodLabel?: string;
}

export const NormalNightStudy = ({
  items,
  onToggleCheck,
  onItemClick,
  onStatusClick,
  isCheckDisabled = false,
  periodLabel,
}: NormalNightStudyProps) => {
  const confirmedCount = items.filter((item) => item.checked).length;
  const unconfirmedCount = items.filter((item) => !item.checked).length;

  return (
      <div className="normal-night-study">
        <div className="normal-night-study__summary">
        <span className="normal-night-study__summary-item">
          {periodLabel ? `${periodLabel} 출석 인원` : '출석 인원'}: <strong>{confirmedCount}명</strong>
        </span>
          <span className="normal-night-study__summary-divider" />
          <span className="normal-night-study__summary-item">
          미출석 인원: <strong>{unconfirmedCount}명</strong>
        </span>
        </div>

        <ul className="normal-night-study__list">
          {items.map((item) => (
              <li key={item.id} className="normal-night-study__item">
                <button
                    type="button"
                    className={`normal-night-study__checkbox ${item.checked ? 'normal-night-study__checkbox--checked' : ''}`}
                    onClick={() => onToggleCheck(item.id)}
                    aria-checked={item.checked}
                    aria-label={`${item.studentName} ${periodLabel ?? ''} 출석 확인`.replace('  ', ' ')}
                    role="checkbox"
                    disabled={isCheckDisabled}
                >
                  {item.checked && (
                      <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                        <path d="M1 5L5.5 9.5L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                  )}
                </button>

                <button
                    type="button"
                    className="normal-night-study__info"
                    onClick={() => onItemClick?.(item.id)}
                    disabled={!onItemClick}
                >
                  {item.studentName}
                  <span className="normal-night-study__dot">·</span>
                  {item.classInfo}
                  <span className="normal-night-study__dot">·</span>
                  {item.time}{item.timeSuffix ?? '까지'}
                </button>

                {onStatusClick ? (
                    <button
                        type="button"
                        className={`normal-night-study__badge ${
                            item.status === 'ALLOWED'
                                ? 'normal-night-study__badge--allowed'
                                : 'normal-night-study__badge--pending'
                        }`}
                        onClick={() => onStatusClick(item.id)}
                    >
                      {item.status === 'ALLOWED' ? '승인' : '미승인'}
                    </button>
                ) : (
                    <span
                        className={`normal-night-study__badge ${
                            item.status === 'ALLOWED'
                                ? 'normal-night-study__badge--allowed'
                                : 'normal-night-study__badge--pending'
                        }`}
                    >
                      {item.status === 'ALLOWED' ? '승인' : '미승인'}
                    </span>
                )}
              </li>
          ))}
        </ul>
      </div>
  );
};

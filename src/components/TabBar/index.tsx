import { useRouter } from '@b1nd/aid-kit/navigation';
import {
    Chart,
    CheckmarkCircleFill,
    People,
    Person,
} from '@b1nd/dodam-design-system/icons/mono';
import { TAB_PATHS } from '../../routes';
import './index.css';

const TABS = [
    { path: TAB_PATHS.normal, label: '일반 심자', Icon: Person },
    { path: TAB_PATHS.project, label: '프로젝트 심자', Icon: People },
    { path: TAB_PATHS.members, label: '인원 조회', Icon: Chart },
    { path: TAB_PATHS.attendance, label: '출석 체크', Icon: CheckmarkCircleFill },
];

export const TabBar = () => {
    const { tab } = useRouter();

    return (
        <nav className="tab-bar" aria-label="심자 관리 메뉴">
            {TABS.map(({ path, label, Icon }) => {
                const isActive = tab.current === path;

                return (
                    <button
                        key={path}
                        type="button"
                        className={`tab-bar__item ${isActive ? 'tab-bar__item--active' : ''}`}
                        onClick={() => tab.move(path)}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <Icon size={24} color="currentColor" />
                        <span className="tab-bar__label">{label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default TabBar;

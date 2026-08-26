import type { ComponentProps } from 'react';
import type { Dropdown } from '@b1nd/dodam-design-system/components';

type DropdownStyle = NonNullable<
    ComponentProps<typeof Dropdown>['customStyle']
>;

const FONT_SIZE = 'clamp(13px, 4vw, 18px)';

/**
 * 드롭다운은 기본 너비가 min-content라서 가로가 좁은 기기에서 칸을 넘쳐
 * 옆 드롭다운과 붙어 보인다. 칸 너비를 넘지 않게 막고, 글자 크기를 화면 폭에
 * 맞춰 줄인 뒤 그래도 모자라면 말줄임표로 잘라낸다.
 */
export const DROPDOWN_STYLE: DropdownStyle = {
    height: '44px',
    maxWidth: '100%',
    gap: '6px',
    padding: '8px 10px',

    // 선택된 값
    '> p': {
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: FONT_SIZE,
    },

    // 펼쳤을 때 나오는 선택지 — 목록 너비가 드롭다운을 따라가므로 같이 줄인다
    '> div > div': {
        whiteSpace: 'nowrap',
        fontSize: FONT_SIZE,
    },
};

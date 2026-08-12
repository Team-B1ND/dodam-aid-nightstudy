import type { BaseResponse, PageResponse } from '@b1nd/api-client';

/** 잘못된 응답으로 무한히 도는 것을 막는 안전장치 */
const MAX_PAGES = 20;

/**
 * 서버가 `hasNext`로 다음 장이 있는지 알려주므로, 없어질 때까지 이어서 불러온다.
 * (심자 인원이 한 페이지를 넘어도 목록에서 빠지지 않게 한다)
 */
export const fetchAllPages = async <T>(
    load: (page: number) => Promise<BaseResponse<PageResponse<T>>>,
    maxPages = MAX_PAGES
) => {
    const all: T[] = [];

    for (let page = 0; page < maxPages; page++) {
        const res = await load(page);
        all.push(...res.data.content);
        if (!res.data.hasNext) break;
    }

    return all;
};

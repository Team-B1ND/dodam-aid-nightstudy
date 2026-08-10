/** 오늘 날짜를 서버가 쓰는 `YYYY-MM-DD` 형식으로 반환 */
export const getToday = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${now.getFullYear()}-${month}-${day}`;
};

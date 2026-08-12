/** 요청이 한꺼번에 몰리지 않도록 동시 실행 개수를 제한한다 */
export const runWithLimit = async <T>(
    tasks: (() => Promise<T>)[],
    limit = 8
) => {
    const results: T[] = [];
    let cursor = 0;

    const worker = async () => {
        while (cursor < tasks.length) {
            const index = cursor++;
            results[index] = await tasks[index]();
        }
    };

    await Promise.all(
        Array.from({ length: Math.min(limit, tasks.length) }, worker)
    );

    return results;
};

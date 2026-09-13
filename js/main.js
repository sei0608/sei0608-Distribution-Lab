// 範囲文字列（例: "1.21.8-1.21.11", "26.1-26.2", "26.1.0-26.1.2"）を展開する関数
function expandVersionRange(text) {
    const normalized = text.replace(/–/g, '-'); // ハイフンの表記揺れを統一
    const rangeMatch = normalized.match(/(\d+(?:\.\d+)*)\s*-\s*(\d+(?:\.\d+)*)/);

    if (rangeMatch) {
        const startParts = rangeMatch[1].split('.').map(Number);
        const endParts = rangeMatch[2].split('.').map(Number);

        // プレフィックス（メジャー・マイナー）が同じ場合、末尾の数値範囲を展開
        if (startParts.length === endParts.length && startParts.length >= 2) {
            const lastIndex = startParts.length - 1;
            const samePrefix = startParts.slice(0, lastIndex).every((val, idx) => val === endParts[idx]);

            if (samePrefix && startParts[lastIndex] <= endParts[lastIndex]) {
                const prefix = startParts.slice(0, lastIndex).join('.');
                const list = [];
                for (let i = startParts[lastIndex]; i <= endParts[lastIndex]; i++) {
                    list.push(`${prefix}.${i}`);
                }
                return list;
            }
        }
    }
    return [text];
}

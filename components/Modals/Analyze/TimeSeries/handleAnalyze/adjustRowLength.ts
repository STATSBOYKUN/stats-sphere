export const adjustRowLength = (row: string[], targetLength: number): string[] => {
    // Jika terlalu panjang, potong
    const adjustedRow = row.slice(0, targetLength);

    // Jika terlalu pendek, tambahkan elemen kosong
    while (adjustedRow.length < targetLength) {
        adjustedRow.push('');
    }

    return adjustedRow;
};
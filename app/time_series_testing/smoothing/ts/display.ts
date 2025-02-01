import * as XLSX from 'xlsx';

export async function handleDisplayTable(fileInput: HTMLInputElement, resultElement: HTMLElement): Promise<(string | number | null)[][]> {
    return new Promise<(string | number | null)[][]>((resolve, reject) => {
        fileInput.addEventListener('change', function (event: Event) {
            const target = event.target as HTMLInputElement;
            const file = target.files ? target.files[0] : null;

            if (!file) {
                resultElement.innerHTML = "<p>No file selected. Please upload a file.</p>";
                return;
            }

            const reader = new FileReader();

            reader.onload = function (e: ProgressEvent<FileReader>) {
                if (e.target && e.target.result) {
                    try {
                        const data = new Uint8Array(e.target.result as ArrayBuffer);
                        const workbook = XLSX.read(data, { type: 'array' });

                        const firstSheetName = workbook.SheetNames[0];
                        if (!firstSheetName) throw new Error("No sheets found in workbook.");

                        const worksheet = workbook.Sheets[firstSheetName];
                        if (!worksheet) throw new Error("Worksheet not found.");

                        // Mengubah worksheet menjadi array
                        const jsonData: (string | number | null)[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                        if (jsonData.length === 0 || !Array.isArray(jsonData[0])) {
                            throw new Error("Sheet is empty or invalid.");
                        }

                        // Membuat HTML tabel
                        let html = `
                            <table class="table text-center w-full">
                                <thead class="bg-grey">
                                    <tr>
                        `;

                        // Menambahkan header
                        (jsonData[0] as (string | number)[]).forEach((header: string | number) => {
                            html += `<th>${header}</th>`;
                        });

                        html += `</tr></thead><tbody>`;

                        // Menambahkan baris data
                        for (let i = 1; i < jsonData.length; i++) {
                            html += '<tr>';
                            jsonData[i].forEach((cell: string | number | null) => {
                                html += `<td>${cell !== null ? cell : ''}</td>`;
                            });
                            html += '</tr>';
                        }

                        html += `</tbody></table>`;

                        resultElement.innerHTML = html;
                        resolve(jsonData);
                    } catch (error) {
                        resultElement.innerHTML = `<p>Error: ${error instanceof Error ? error.message : "Unknown error"}</p>`;
                        reject(error);
                    }
                }
            };

            reader.readAsArrayBuffer(file);
        });  
    });
    
}

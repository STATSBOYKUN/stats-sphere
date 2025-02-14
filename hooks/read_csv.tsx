import { useEffect, useState } from "react";
import { parse } from "csv-parse/browser/esm/sync";

export const useReadCSV = (filePath: string) => {
    const [variables, setVariables] = useState<string[]>([]);

    useEffect(() => {
        const fetchCSV = async () => {
            try {
                const response = await fetch(filePath);
                const text = await response.text();
                const records = parse(text, {
                    columns: true, // Mengambil header sebagai kolom
                    skip_empty_lines: true,
                });

                // Ambil nama variabel (header)
                if (records.length > 0) {
                    const headers = Object.keys(records[0]);
                    setVariables(headers);
                }
            } catch (error) {
                console.error("Error reading CSV file:", error);
            }
        };

        fetchCSV();
    }, [filePath]);

    return variables;
};

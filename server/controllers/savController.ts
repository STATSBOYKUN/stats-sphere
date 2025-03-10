// savController.ts - Versi dengan perbaikan
import { Request, Response } from 'express';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { SavBufferReader } from 'sav-reader';
import { saveToFile, VariableType, VariableAlignment, VariableMeasure } from 'sav-writer';

interface FormidableFile {
    filepath?: string;
    path?: string;
    [key: string]: any;
}

export const uploadSavFile = (req: Request, res: Response) => {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing form:', err);
            return res.status(500).send('Error parsing form');
        }

        const uploadedFile = files.file as FormidableFile | FormidableFile[];
        if (!uploadedFile) {
            return res.status(400).send('No file uploaded');
        }

        const filePath = Array.isArray(uploadedFile)
            ? uploadedFile[0]?.filepath || uploadedFile[0]?.path
            : uploadedFile?.filepath || uploadedFile?.path;

        if (!filePath) {
            return res.status(400).send('Invalid file path');
        }

        try {
            const fileData = fs.readFileSync(filePath);
            const sav = new SavBufferReader(fileData);
            await sav.open();

            const meta = sav.meta;
            const rows = await sav.readAllRows();

            res.json({ meta, rows });
        } catch (error) {
            console.error('Error processing SAV file:', error);
            res.status(500).send('Error processing SAV file');
        }
    });
};

export const createSavFile = (req: Request, res: Response) => {
    const { data, variables } = req.body;

    if (!data || !variables) {
        return res
            .status(400)
            .json({ error: "Parameter data dan variables wajib disediakan." });
    }

    try {
        const filteredVariables = variables.filter((variable: any) => {
            if (variable.type === "DATE") {
                if (variable.width !== 11) {
                    console.warn(`Variabel ${variable.name} dengan tipe DATE diabaikan: width harus 11 (format: dd-mmm-yyyy).`);
                    return false;
                }
                return true;
            } else if (variable.type === "DATETIME") {
                if (variable.width !== 20) {
                    console.warn(`Variabel ${variable.name} dengan tipe DATETIME diabaikan: width harus 20 (format: dd-mmm-yyyy hh:mm:ss).`);
                    return false;
                }
                return true;
            } else if (["ADATE", "EDATE", "SDATE", "JDATE", "QYR", "MOYR", "WKYR", "WKDAY", "MONTH", "TIME", "DTIME"].includes(variable.type)) {
                console.warn(`Variabel ${variable.name} dengan tipe ${variable.type} diabaikan: format tidak didukung. Hanya DATE dan DATETIME yang didukung.`);
                return false;
            }
            return true;
        });

        if (filteredVariables.length === 0) {
            return res.status(400).json({
                error: "Tidak ada variabel yang valid untuk diproses setelah filtering."
            });
        }

        const transformedVariables = filteredVariables.map((variable: any) => {
            let type: number;
            if (variable.type === "STRING") {
                type = VariableType.String;
            } else if (["DATE", "ADATE", "EDATE", "SDATE", "JDATE", "QYR", "MOYR", "WKYR", "WKDAY", "MONTH"].includes(variable.type)) {
                type = VariableType.Date;
            } else if (["DATETIME", "TIME", "DTIME"].includes(variable.type)) {
                type = VariableType.DateTime;
            } else {
                type = VariableType.Numeric;
            }

            let alignment: number;
            switch (variable.alignment.toLowerCase()) {
                case "left":
                    alignment = VariableAlignment.Left;
                    break;
                case "center":
                case "centre":
                    alignment = VariableAlignment.Centre;
                    break;
                default:
                    alignment = VariableAlignment.Right;
            }

            let measure: number;
            switch (variable.measure.toLowerCase()) {
                case "nominal":
                    measure = VariableMeasure.Nominal;
                    break;
                case "ordinal":
                    measure = VariableMeasure.Ordinal;
                    break;
                default:
                    measure = VariableMeasure.Continuous;
            }

            const valueLabels = Array.isArray(variable.valueLabels) ?
                variable.valueLabels.map((vl: any) => {
                    let value: string | number;
                    let label: string;

                    if (vl.label === null || vl.label === undefined) {
                        label = "";
                    } else {
                        label = String(vl.label);
                    }

                    if (type === VariableType.String) {
                        value = vl.value === null || vl.value === undefined ?
                            "" : String(vl.value);
                    } else {
                        if (vl.value === null || vl.value === undefined) {
                            value = 0;
                        } else {
                            const numValue = Number(vl.value);
                            value = isNaN(numValue) ? 0 : numValue;
                        }
                    }

                    return { value, label };
                }) : [];

            return {
                name: String(variable.name),
                label: String(variable.label || ""),
                type,
                width: Number(variable.width),
                decimal: Number(variable.decimal || 0),
                alignment,
                measure,
                columns: Math.max(1, Math.floor(Number(variable.columns || 8) / 20)),
                valueLabels
            };
        });

        const transformedData = data.map((record: any) => {
            const result: Record<string, any> = {};

            for (const varName of Object.keys(record)) {
                const variable = transformedVariables.find((v: any) => v.name === varName);
                if (!variable) continue;

                const rawValue = record[varName];

                if (rawValue === null || rawValue === undefined || rawValue === "") {
                    result[varName] = null;
                    continue;
                }

                if (variable.type === VariableType.String) {
                    result[varName] = String(rawValue || '');
                } else {
                    // For numeric types
                    const numValue = Number(rawValue);
                    if (!isNaN(numValue)) {
                        result[varName] = numValue;
                    } else {
                        result[varName] = null;
                    }
                }
            }

            return result;
        });

        const outputDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const filePath = path.join(outputDir, `output-${Date.now()}.sav`);

        console.log('Transformed variables:', JSON.stringify(transformedVariables, null, 2));

        if (transformedVariables.length > 0) {
            const firstVar = transformedVariables[0];
            console.log('First variable:', {
                name: firstVar.name,
                type: firstVar.type,
                valueLabels: firstVar.valueLabels
            });

            if (firstVar.valueLabels && firstVar.valueLabels.length > 0) {
                console.log('First value label:', {
                    value: firstVar.valueLabels[0].value,
                    valueType: typeof firstVar.valueLabels[0].value,
                    label: firstVar.valueLabels[0].label,
                    labelType: typeof firstVar.valueLabels[0].label
                });
            }
        }

        saveToFile(filePath, transformedData, transformedVariables);

        res.download(filePath, "data.sav", (err) => {
            if (err) {
                console.error("Download error:", err);
                return res.status(500).send("Terjadi kesalahan saat mengunduh file.");
            }

            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Error menghapus file sementara:", unlinkErr);
                }
            });
        });
    } catch (error: any) {
        console.error("Error creating SAV file:", error);

        if (error.message && error.message.includes("invalid variable name")) {
            return res.status(400).json({
                error: "Nama variabel tidak valid. Nama variabel harus dimulai dengan huruf dan hanya berisi huruf, angka, atau garis bawah."
            });
        }

        const errorMessage = error.stack || error.message || String(error);
        res.status(500).json({
            error: "Gagal membuat file .sav",
            details: errorMessage,
            message: error.message
        });
    }
};

export const cleanupTempFiles = () => {
    const outputDir = path.join(__dirname, '../../temp');
    if (fs.existsSync(outputDir)) {
        const files = fs.readdirSync(outputDir);
        const now = Date.now();

        files.forEach(file => {
            const filePath = path.join(outputDir, file);
            const stats = fs.statSync(filePath);
            const fileAge = now - stats.mtimeMs;

            if (fileAge > 3600000) {
                fs.unlinkSync(filePath);
            }
        });
    }
};
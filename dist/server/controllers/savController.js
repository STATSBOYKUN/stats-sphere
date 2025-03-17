"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupTempFiles = exports.createSavFile = exports.uploadSavFile = void 0;
const formidable_1 = __importDefault(require("formidable"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sav_reader_1 = require("sav-reader");
const sav_writer_1 = require("sav-writer");
const uploadSavFile = (req, res) => {
    const form = (0, formidable_1.default)({ multiples: false });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing form:', err);
            res.status(500).send('Error parsing form');
            return;
        }
        const uploadedFile = files.file;
        if (!uploadedFile) {
            res.status(400).send('No file uploaded');
            return;
        }
        const filePath = Array.isArray(uploadedFile)
            ? uploadedFile[0]?.filepath || uploadedFile[0]?.path
            : uploadedFile?.filepath || uploadedFile?.path;
        if (!filePath) {
            res.status(400).send('Invalid file path');
            return;
        }
        try {
            const fileData = fs_1.default.readFileSync(filePath);
            const sav = new sav_reader_1.SavBufferReader(fileData);
            await sav.open();
            const meta = sav.meta;
            const rows = await sav.readAllRows();
            res.json({ meta, rows });
        }
        catch (error) {
            console.error('Error processing SAV file:', error);
            res.status(500).send('Error processing SAV file');
        }
    });
};
exports.uploadSavFile = uploadSavFile;
const createSavFile = (req, res) => {
    const { data, variables } = req.body;
    if (!data || !variables) {
        res.status(400).json({ error: "Parameter data dan variables wajib disediakan." });
        return;
    }
    try {
        const filteredVariables = variables.filter((variable) => {
            if (variable.type === "DATE") {
                if (variable.width !== 11) {
                    console.warn(`Variabel ${variable.name} dengan tipe DATE diabaikan: width harus 11 (format: dd-mmm-yyyy).`);
                    return false;
                }
                return true;
            }
            else if (variable.type === "DATETIME") {
                if (variable.width !== 20) {
                    console.warn(`Variabel ${variable.name} dengan tipe DATETIME diabaikan: width harus 20 (format: dd-mmm-yyyy hh:mm:ss).`);
                    return false;
                }
                return true;
            }
            else if (["ADATE", "EDATE", "SDATE", "JDATE", "QYR", "MOYR", "WKYR", "WKDAY", "MONTH", "TIME", "DTIME"].includes(variable.type)) {
                console.warn(`Variabel ${variable.name} dengan tipe ${variable.type} diabaikan: format tidak didukung. Hanya DATE dan DATETIME yang didukung.`);
                return false;
            }
            return true;
        });
        if (filteredVariables.length === 0) {
            res.status(400).json({
                error: "Tidak ada variabel yang valid untuk diproses setelah filtering."
            });
            return;
        }
        const transformedVariables = filteredVariables.map((variable) => {
            let type;
            if (variable.type === "STRING") {
                type = sav_writer_1.VariableType.String;
            }
            else if (["DATE", "ADATE", "EDATE", "SDATE", "JDATE", "QYR", "MOYR", "WKYR", "WKDAY", "MONTH"].includes(variable.type)) {
                type = sav_writer_1.VariableType.Date;
            }
            else if (["DATETIME", "TIME", "DTIME"].includes(variable.type)) {
                type = sav_writer_1.VariableType.DateTime;
            }
            else {
                type = sav_writer_1.VariableType.Numeric;
            }
            let alignment;
            switch (variable.alignment.toLowerCase()) {
                case "left":
                    alignment = sav_writer_1.VariableAlignment.Left;
                    break;
                case "center":
                case "centre":
                    alignment = sav_writer_1.VariableAlignment.Centre;
                    break;
                default:
                    alignment = sav_writer_1.VariableAlignment.Right;
            }
            let measure;
            switch (variable.measure.toLowerCase()) {
                case "nominal":
                    measure = sav_writer_1.VariableMeasure.Nominal;
                    break;
                case "ordinal":
                    measure = sav_writer_1.VariableMeasure.Ordinal;
                    break;
                default:
                    measure = sav_writer_1.VariableMeasure.Continuous;
            }
            const valueLabels = Array.isArray(variable.valueLabels) ?
                variable.valueLabels.map((vl) => {
                    let value;
                    let label;
                    if (vl.label === null || vl.label === undefined) {
                        label = "";
                    }
                    else {
                        label = String(vl.label);
                    }
                    if (type === sav_writer_1.VariableType.String) {
                        value = vl.value === null || vl.value === undefined ?
                            "" : String(vl.value);
                    }
                    else {
                        if (vl.value === null || vl.value === undefined) {
                            value = 0;
                        }
                        else {
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
        const transformedData = data.map((record) => {
            const result = {};
            for (const varName of Object.keys(record)) {
                const variable = transformedVariables.find((v) => v.name === varName);
                if (!variable)
                    continue;
                const rawValue = record[varName];
                if (rawValue === null || rawValue === undefined || rawValue === "") {
                    result[varName] = null;
                    continue;
                }
                if (variable.type === sav_writer_1.VariableType.String) {
                    result[varName] = String(rawValue || '');
                }
                else {
                    // For numeric types
                    const numValue = Number(rawValue);
                    if (!isNaN(numValue)) {
                        result[varName] = numValue;
                    }
                    else {
                        result[varName] = null;
                    }
                }
            }
            return result;
        });
        const outputDir = path_1.default.join(__dirname, '../../temp');
        if (!fs_1.default.existsSync(outputDir)) {
            fs_1.default.mkdirSync(outputDir, { recursive: true });
        }
        const filePath = path_1.default.join(outputDir, `output-${Date.now()}.sav`);
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
        (0, sav_writer_1.saveToFile)(filePath, transformedData, transformedVariables);
        res.download(filePath, "data.sav", (err) => {
            if (err) {
                console.error("Download error:", err);
                res.status(500).send("Terjadi kesalahan saat mengunduh file.");
                return;
            }
            fs_1.default.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Error menghapus file sementara:", unlinkErr);
                }
            });
        });
    }
    catch (error) {
        console.error("Error creating SAV file:", error);
        if (error.message && error.message.includes("invalid variable name")) {
            res.status(400).json({
                error: "Nama variabel tidak valid. Nama variabel harus dimulai dengan huruf dan hanya berisi huruf, angka, atau garis bawah."
            });
            return;
        }
        const errorMessage = error.stack || error.message || String(error);
        res.status(500).json({
            error: "Gagal membuat file .sav",
            details: errorMessage,
            message: error.message
        });
    }
};
exports.createSavFile = createSavFile;
const cleanupTempFiles = () => {
    const outputDir = path_1.default.join(__dirname, '../../temp');
    if (fs_1.default.existsSync(outputDir)) {
        const files = fs_1.default.readdirSync(outputDir);
        const now = Date.now();
        files.forEach(file => {
            const filePath = path_1.default.join(outputDir, file);
            const stats = fs_1.default.statSync(filePath);
            const fileAge = now - stats.mtimeMs;
            if (fileAge > 3600000) {
                fs_1.default.unlinkSync(filePath);
            }
        });
    }
};
exports.cleanupTempFiles = cleanupTempFiles;
//# sourceMappingURL=savController.js.map
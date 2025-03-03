import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
const { SavBufferReader } = require('sav-reader');
const { saveToFile, VariableType, VariableAlignment, VariableMeasure } = require('sav-writer');

const app = express();

app.use(cors());
app.use(express.json())

app.post('/upload', (req, res) => {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing form:', err);
            return res.status(500).send('Error parsing form');
        }

        const uploadedFile = files.file;
        if (!uploadedFile) {
            return res.status(400).send('No file uploaded');
        }

        const filePath = Array.isArray(uploadedFile)
            ? uploadedFile[0].filepath || uploadedFile[0].path
            : uploadedFile.filepath || uploadedFile.path;

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
});

app.post("/create-sav", (req, res) => {
    const { data, variables } = req.body;

    if (!data || !variables) {
        return res
            .status(400)
            .json({ error: "Parameter data dan variables wajib disediakan." });
    }

    // Transformasi variabel dari string ke enum sav-writer
    const transformedVariables = variables.map((variable: any) => {
        // Mapping tipe variabel
        const type =
            variable.type === "NUMERIC" ? VariableType.Numeric : VariableType.String;

        // Mapping alignment
        let alignment: VariableAlignment;
        switch (variable.alignment.toLowerCase()) {
            case "left":
                alignment = VariableAlignment.Left;
                break;
            case "centre":
            case "center":
                alignment = VariableAlignment.Centre;
                break;
            default:
                alignment = VariableAlignment.Right;
        }

        // Mapping measure
        const measure =
            variable.measure.toLowerCase() === "nominal"
                ? VariableMeasure.Nominal
                : VariableMeasure.Continuous;

        //logging
        console.log(variable);


        return {
            name: variable.name,
            label: variable.label,
            type,
            width: variable.width,
            decimal: variable.decimal,
            alignment,
            measure,
            columns: Math.floor(Number(variable.columns) / 20),
        };
    });

    // Tentukan path file sementara
    const filePath = path.join(__dirname, "output.sav");

    try {
        // Panggil sav-writer untuk membuat file .sav
        saveToFile(filePath, data, transformedVariables);

        // Setelah file dibuat, kirim file tersebut sebagai response
        res.download(filePath, "data.sav", (err: Error) => {
            if (err) {
                console.error("Download error:", err);
                return res
                    .status(500)
                    .send("Terjadi kesalahan saat mengunduh file.");
            }
            // Hapus file sementara setelah di-download
            fs.unlink(filePath, unlinkErr => {
                if (unlinkErr) {
                    console.error("Error menghapus file sementara:", unlinkErr);
                }
            });
        });
    } catch (error: any) {
        console.error("Error creating SAV file:", error);
        res.status(500).json({ error: "Gagal membuat file .sav: " + error.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server berjalan pada http://localhost:${PORT}`);
});

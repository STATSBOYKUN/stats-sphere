import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import cors from 'cors';  // Import CORS
const { SavBufferReader } = require('sav-reader');

const app = express();

app.use(cors());

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

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

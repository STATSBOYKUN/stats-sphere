import express from 'express';
import cors from 'cors';
import savRoutes from './routes/savRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/sav', savRoutes);

app.listen(PORT, () => {
    console.log(`Server berjalan pada http://localhost:${PORT}`);
});
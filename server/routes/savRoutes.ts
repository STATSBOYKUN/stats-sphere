import { Router } from 'express';
import { uploadSavFile, createSavFile } from '../controllers/savController';

const router = Router();

router.post('/upload', uploadSavFile);
router.post('/create', createSavFile);

export default router;
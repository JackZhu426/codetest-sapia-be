import { Router } from 'express';
import registerRouter from './userRegister';

const router = Router();
router.use('/register', registerRouter);

export default router;

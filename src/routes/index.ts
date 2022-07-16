/**
 * @author: Jack Zhu
 * @created : 2022/7/15
 * @lastModified : 2022/7/16
 */
import { Router } from 'express';
import registerRouter from './userRegister';
import loginRouter from './userLogin';

const router = Router();
router.use('/register', registerRouter);
router.use('/login', loginRouter);

export default router;

/**
 * @author: Jack Zhu
 * @created : 2022/7/16
 * @lastModified : 2022/7/16
 */
import { Router } from 'express';
import { login } from '../controllers/userLogin';

const loginRouter = Router();

loginRouter.post('', login);

export default loginRouter;

/**
 * @author: Jack Zhu
 * @created : 2022/7/15
 * @lastModified : 2022/7/15
 */
import { Router } from 'express';
import { register } from '../controllers/userRegister';

const registerRouter = Router();

registerRouter.post('', register);

export default registerRouter;

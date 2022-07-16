/**
 * @author: Jack Zhu
 * @created : 2022/7/15
 * @lastModified : 2022/7/15
 */
import { verifyToken } from '../utils/jwt';
import { Request, Response, NextFunction } from 'express';
import { getResponseData } from '../utils/responseData';

/**
 * validate JWT token string middleware
 */
const authGuard = (req: Request, res: Response, next: NextFunction) => {
  // NOTE: can also use req.headers.authorization
  const authorizationHeader = req.header('Authorization');
  console.log('authorizationHeader:', authorizationHeader);
  // token missing
  if (!authorizationHeader) return res.status(401).json(getResponseData(false, 'failed'));

  // Bearer xxx - 1) not even started with 'Bearer ' 2) array's length !== 2
  const tokenArr = authorizationHeader.split(' ');
  if (tokenArr.length !== 2 || tokenArr[0] !== 'Bearer') {
    return res.status(401).json(getResponseData(false, 'failed'));
  }

  // Bearer xxxx
  const decodedPayload = verifyToken(tokenArr[1]);
  console.log('decodedPayload:', decodedPayload);
  // token invalid (wrong signature, expired, etc.)
  if (!decodedPayload) return res.status(401).json(getResponseData(false, 'failed'));

  // right token, go next
  return next();
};

export default authGuard;

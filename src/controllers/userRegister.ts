/**
 * @author: Jack Zhu
 * @created : 2022/7/15
 * @lastModified : 2022/7/16
 */
// Request is replaced by interface: RequestWithBodyType
import { Response } from 'express';
import { hash } from 'bcrypt';

import { UserAccountsModel } from '../models/userAccounts';
import { generateToken } from '../utils/jwt';
import { getResponseData } from '../utils/responseData';
import { RequestWithBodyType } from '../types';

// export this controller function for routes (i.e. routes/userRegister.ts) to use
export const register = async (req: RequestWithBodyType, res: Response) => {
  const { username, password } = req.body;
  // 1. check if the username already exists
  const userAccounts = await UserAccountsModel.findOne({ username });
  if (userAccounts) return res.status(409).json(getResponseData(false, 'username already exists!'));

  // 2. if not, register
  // 2.1 'hash' & 'salt' the password before saving
  const hashedPassword = await hash(password, 10);
  // !Attention!: password is hashed, need to write the key instead of 'Object Literal Property Value Shorthand'
  const newUserAccounts = new UserAccountsModel({ username: username, password: hashedPassword });

  await newUserAccounts.save();

  // 3. jwt, generate token (payload: object)
  const token = generateToken({ username });
  return res.status(201).json(getResponseData({ token, username }));
};

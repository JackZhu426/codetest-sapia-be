/**
 * @author: Jack Zhu
 * @created : 2022/7/16
 * @lastModified : 2022/7/16
 */
// Request is replaced by interface: RequestWithBodyType
import { Response } from 'express';
import { compare } from 'bcrypt';

import { UserAccountsModel } from '../models/userAccounts';
import { generateToken } from '../utils/jwt';
import { getResponseData } from '../utils/responseData';
import { RequestWithBodyType } from '../types';

// export this controller function for routes (i.e. routes/userLogin.ts) to use
export const login = async (req: RequestWithBodyType, res: Response) => {
  const { username, password } = req.body;
  // 1. find the user by 'username'
  const exsitingUser = await UserAccountsModel.findOne({ username }).exec();

  // 2. if user does NOT exist, return 'failed'
  if (!exsitingUser) {
    return res.status(401).json(getResponseData('failed', 'username does not exist!'));
  }
  if (
    exsitingUser.lockedTime &&
    new Date().getTime() - exsitingUser.lockedTime.getTime() > 1000 * 60 * 5
  ) {
    // TODO: unlock the user
  }

  // 3. user exists, but password is wrong, return 'failed'
  // !Attention!: this func returns Promise<boolean>, here must use 'await'
  const isPasswordCorrect = await compare(password, exsitingUser.password);
  if (!isPasswordCorrect) {
    if (exsitingUser.faildAttempts == 3) {
      return res.status(401).json(getResponseData('failed', 'account is locked!'));
    }
    if (exsitingUser.faildAttempts < 3) {
      if (exsitingUser.faildAttempts == 2) {
        exsitingUser.lockedTime = new Date();
      }
      exsitingUser.faildAttempts += 1;
      await exsitingUser.save();
      return res.status(401).json(getResponseData('failed', 'password is wrong!'));
    }
    // TODO: db: field 'failedAttempts' should be incremented
    UserAccountsModel.updateOne({ username }, { $inc: { faildAttempts: 1 } }).exec();
    return res.status(401).json(getResponseData('failed', 'password is wrong!'));
  }
  // 4. user exists & password is correct,
  // return token (for front-end to save to 'localStorage' -> then put it to header: { Authorization: Bearer xxx} ), and username
  const token = generateToken({ username });
  return res.status(201).json(getResponseData({ token, username }));
};

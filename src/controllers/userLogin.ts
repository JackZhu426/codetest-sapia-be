/**
 * @author: Jack Zhu
 * @created : 2022/7/16
 * @lastModified : 2022/7/17
 */
// Request is replaced by interface: RequestWithBodyType
import { Response } from 'express';
import { compare } from 'bcrypt';

import { UserAccountsModel } from '../models/userAccounts';
import { generateToken } from '../utils/jwt';
import { getResponseData } from '../utils/responseData';
import { getTimeLapse } from '../utils/getTimeLapse';
import { RequestWithBodyType } from '../types';

// export this controller function for routes (i.e. routes/userLogin.ts) to use
export const login = async (req: RequestWithBodyType, res: Response) => {
  const { username, password } = req.body;
  // 1. find the user by 'username'
  const exsitingUser = await UserAccountsModel.findOne({ username }).exec();
  console.log('exsitingUser: ', exsitingUser);
  // 2. if user does NOT exist, return 'failed'
  if (!exsitingUser) {
    console.log('existingUser has been called');
    return res.status(401).json(getResponseData('failed', 'username does not exist!'));
  }
  // 3. lockedTime exists and > 5min, unlock the user
  console.log('curLockedTime:', exsitingUser.lockedTime?.getTime());
  console.log('exsitingUser.failedAttempts out of compare:', exsitingUser.failedAttempts);
  // still locked (i.e. failedAttempts 3 times in 5 minutes) - return 'failed',
  // even if you enter the right username & password
  if (exsitingUser.lockedTime && getTimeLapse(exsitingUser.lockedTime) <= 1000 * 60 * 3) {
    return res
      .status(401)
      .json(
        getResponseData(
          'failed',
          `account is locked! Please try again after ${Math.ceil(
            (1000 * 60 * 3 - getTimeLapse(exsitingUser.lockedTime)) / 60000,
          )} min`,
        ),
      );
  }

  // 3. user exists, but password is wrong, return 'failed'
  // !Attention!: this func returns Promise<boolean>, here must use 'await'
  const isPasswordCorrect = await compare(password, exsitingUser.password);
  if (!isPasswordCorrect) {
    exsitingUser.failedAttempts += 1;

    // tried 2 time, but still wrong password, lock the user
    // 1) add the lockedTime  2) add the failedAttempts
    if (exsitingUser.failedAttempts >= 3) {
      console.log('add the lockedTime');
      exsitingUser.lockedTime = new Date();
    }
    // db: field 'failedAttempts' is incremented by 1
    console.log('exsisting user failed attempts:', exsitingUser.failedAttempts);
    await exsitingUser.save();

    return res.status(401).json(getResponseData('failed', 'password is wrong!'));
  }

  exsitingUser.lockedTime = undefined;
  exsitingUser.failedAttempts = 0;
  await exsitingUser.save();
  // 4. user exists & password is correct
  const token = generateToken({ username });
  return res.status(201).json(getResponseData({ token, username }));
};

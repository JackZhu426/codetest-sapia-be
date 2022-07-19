/**
 * @author: Jack Zhu
 * @created : 2022/7/16
 * @lastModified : 2022/7/19
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

  // 2. if user does NOT exist, return 'failed'
  if (!exsitingUser) {
    return res.status(401).json(getResponseData('failed', 'username does not exist!'));
  }

  // 3. lockedTime exists and <= 5min, still locked - return 'failed'
  // even if the user enters the right username & password
  if (exsitingUser.lockedTime && getTimeLapse(exsitingUser.lockedTime) <= 1000 * 60 * 5) {
    return res
      .status(401)
      .json(
        getResponseData(
          'failed',
          `account is locked! Please try again after ${Math.ceil(
            (1000 * 60 * 5 - getTimeLapse(exsitingUser.lockedTime)) / 60000,
          )} min`,
        ),
      );
  }

  // 4. user exists, check the password
  const isPasswordCorrect = await compare(password, exsitingUser.password);

  // 5. more than 5 min (unlock the user)
  exsitingUser.lockedTime = undefined;

  // 6. if the password is wrong
  if (!isPasswordCorrect) {
    // field 'failedAttempts' is incremented by 1
    exsitingUser.failedAttempts += 1;

    // tried 2 time, but still wrong password, lock the user
    // 1) add the lockedTime  2) reset the failedAttempts (tweaked the logic)
    if (exsitingUser.failedAttempts === 3) {
      exsitingUser.lockedTime = new Date();
      exsitingUser.failedAttempts = 0;
    }
    await exsitingUser.save();

    return res.status(401).json(getResponseData('failed', 'password is wrong!'));
  }

  await exsitingUser.save();
  // 4. user exists & password is correct
  const token = generateToken({ username });
  return res.status(201).json(getResponseData({ token, username }));
};

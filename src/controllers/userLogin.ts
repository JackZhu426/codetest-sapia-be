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

  // 2. if user does NOT exist, return 'failed'
  if (!exsitingUser) {
    return res.status(401).json(getResponseData('failed', 'username does not exist!'));
  }

  // 3. lockedTime exists and <= 5min, still locked - return 'failed'
  // even if the user enters the right username & password
  // Note: used to put the logic 5. (some logic, diff code) before it to save some chunks of the code, but here follow the 'fail fast' rule
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

  // 5. conditions: more than 5 min (unlock the user) || (if not locked) username & password are right , reset db fields
  if (
    (exsitingUser.lockedTime && getTimeLapse(exsitingUser.lockedTime) > 1000 * 60 * 5) ||
    isPasswordCorrect
  ) {
    exsitingUser.lockedTime = undefined;
    exsitingUser.failedAttempts = 0;
  }

  // 6. if the password is wrong
  if (!isPasswordCorrect) {
    exsitingUser.failedAttempts += 1;

    // tried 2 time, but still wrong password, lock the user
    // 1) add the lockedTime  2) add the failedAttempts
    if (exsitingUser.failedAttempts === 3) {
      exsitingUser.lockedTime = new Date();
    }
    // db: field 'failedAttempts' is incremented by 1
    console.log('exsisting user failed attempts:', exsitingUser.failedAttempts);
    await exsitingUser.save();

    return res.status(401).json(getResponseData('failed', 'password is wrong!'));
  }

  await exsitingUser.save();
  // 4. user exists & password is correct
  const token = generateToken({ username });
  return res.status(201).json(getResponseData({ token, username }));
};

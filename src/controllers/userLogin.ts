/**
 * @author: Jack Zhu
 * @created : 2022/7/16
 * @lastModified : 2022/7/22
 */
// down below {Request} is replaced by custom interface: RequestWithBodyType
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
  if (
    exsitingUser.failedTime &&
    getTimeLapse(exsitingUser.failedTime) <= 1000 * 60 * 5 &&
    exsitingUser.failedAttempts === 3
  ) {
    return res
      .status(401)
      .json(
        getResponseData(
          'failed',
          `account is locked! Please try again after ${Math.ceil(
            (1000 * 60 * 5 - getTimeLapse(exsitingUser.failedTime)) / 60000,
          )} min`,
        ),
      );
  }

  // 4. user exists, check the password
  const isPasswordCorrect = await compare(password, exsitingUser.password);

  // 5. reset 'failedAttempts' and 'failedTime' under 2 circumstances:
  // a. user enters the right username & password
  // b. 5 min after last wrong password entered
  if (
    isPasswordCorrect ||
    (exsitingUser.failedTime && getTimeLapse(exsitingUser.failedTime) > 1000 * 60 * 5)
  ) {
    exsitingUser.failedAttempts = 0;
    exsitingUser.failedTime = undefined;
  }

  // 6. if the password is wrong, return 'failed' (fail fast)
  if (!isPasswordCorrect) {
    // field 'failedAttempts' is incremented by 1
    exsitingUser.failedAttempts += 1;
    // field 'failedTime' is updated
    exsitingUser.failedTime = new Date();
    await exsitingUser.save();

    // 3rd time try, but still wrong password, lock the user
    if (exsitingUser.failedAttempts === 3) {
      return res
        .status(401)
        .json(getResponseData('failed', 'You have failed to try 3 times! Account is locked!'));
    }
    return res.status(401).json(getResponseData('failed', 'Password is wrong! Please try again!'));
  }

  // 7. user exists & password is correct (reset logic is hoisted above)
  await exsitingUser.save();
  const token = generateToken({ username });
  return res.status(201).json(getResponseData({ token, username }));
};

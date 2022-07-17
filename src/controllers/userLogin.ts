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
  // 3. lockedTime exists and > 5min, unlock the user

  console.log('curLockedTime:', exsitingUser.lockedTime?.getTime());
  console.log('exsitingUser.failedAttempts out of compare:', exsitingUser.failedAttempts);
  if (
    exsitingUser.lockedTime &&
    new Date().getTime() - exsitingUser.lockedTime.getTime() > 1000 * 60
  ) {
    // unlock the user
    console.log('unlock the user');
    exsitingUser.lockedTime = undefined;
    exsitingUser.failedAttempts = 0;
    await exsitingUser.save();
  }

  // 3. user exists, but password is wrong, return 'failed'
  // !Attention!: this func returns Promise<boolean>, here must use 'await'
  const isPasswordCorrect = await compare(password, exsitingUser.password);
  if (!isPasswordCorrect) {
    // still has to fetch from db once again, coz it's async
    const curUser = await UserAccountsModel.findOne({ username }).exec();
    console.log('curUser.failedAttempts in compare:', curUser?.failedAttempts);

    if (curUser?.failedAttempts === 3) {
      console.log('lock the user');
      const curUserLockedTime = curUser.lockedTime?.getTime() || new Date().getTime();
      return res
        .status(401)
        .json(
          getResponseData(
            'failed',
            `account is locked! Please try again after ${Math.ceil(
              (1000 * 60 - (new Date().getTime() - curUserLockedTime)) / 60000,
            )} min`,
          ),
        );
    }

    if (curUser?.failedAttempts == 2) {
      console.log('add the lockedTime');
      const lockedTimeUser = await UserAccountsModel.findOneAndUpdate(
        { username },
        { lockedTime: new Date() },
        { new: true },
      ).exec();
      console.log('lockedTimeUser:', lockedTimeUser?.lockedTime);
    }
    // db: field 'failedAttempts' should be incremented
    const incAttemptUser = await UserAccountsModel.findOneAndUpdate(
      { username },
      { $inc: { failedAttempts: 1 } },
      { new: true },
    ).exec();
    console.log('IncAttemptUser:', incAttemptUser?.failedAttempts);

    return res.status(401).json(getResponseData('failed', 'password is wrong!'));
  }
  // 4. user exists & password is correct,
  // return token (for front-end to save to 'localStorage' -> then put it to header: { Authorization: Bearer xxx} ), and username
  const token = generateToken({ username });
  return res.status(201).json(getResponseData({ token, username }));
};

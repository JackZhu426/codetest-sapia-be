/**
 * @author: Jack Zhu
 * @created : 2022/7/18
 * @lastModified : 2022/7/22
 */
import { jest } from '@jest/globals';
import { login } from '../../controllers/userLogin';
import { getMockReq, getMockRes } from '@jest-mock/express';
import { UserAccountsModel } from '../../models/userAccounts';
const mockingoose = require('mockingoose');

import brcypt from 'bcrypt';
// import { generateToken } from '../../utils/jwt';
const { generateToken } = require('../../utils/jwt');
jest.mock('../../utils/jwt');

describe('test user login logic', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  test('if the user is NOT existed', async () => {
    const req = getMockReq({ body: { username: 'jack', password: '1234' } });
    const { res } = getMockRes();
    mockingoose(UserAccountsModel).toReturn(undefined, 'findOne');

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: 'failed',
        errMsg: 'username does not exist!',
        success: false,
      }),
    );
  });

  test('if the account is locked', async () => {
    const req = getMockReq({ body: { username: 'jack', password: '1234' } });
    const { res } = getMockRes();
    const _doc = { failedTime: new Date(), failedAttempts: 3 };
    mockingoose(UserAccountsModel).toReturn(_doc, 'findOne');

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: 'failed',
        errMsg: 'account is locked! Please try again after 5 min',
        success: false,
      }),
    );
  });

  test('if the password is wrong, but less than 3 times in 5 min', async () => {
    const req = getMockReq({ body: { username: 'jack', password: '1234' } });
    const { res } = getMockRes();
    const _doc = { username: 'jack', password: '1234', failedAttempts: 0 };
    mockingoose(UserAccountsModel).toReturn(_doc, 'findOne');
    jest.spyOn(brcypt, 'compare').mockImplementation(() => false);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: 'failed',
        errMsg: 'Password is wrong! Please try again!',
        success: false,
      }),
    );
  });

  test('if it is over 5 min after user entered the wrong password, but user still enters the wrong password', async () => {
    const req = getMockReq({ body: { username: 'jack', password: '1234' } });
    const { res } = getMockRes();
    const _doc = { username: 'jack', password: '1234', failedTime: new Date(2000, 1, 1) };
    mockingoose(UserAccountsModel).toReturn(_doc, 'findOne');
    jest.spyOn(brcypt, 'compare').mockImplementation(() => false);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: 'failed',
        errMsg: 'Password is wrong! Please try again!',
        success: false,
      }),
    );
  });

  test('if the password is wrong, and hits 3 times in 5 min', async () => {
    const req = getMockReq({ body: { username: 'jack', password: '1234' } });
    const { res } = getMockRes();
    const _doc = { username: 'jack', password: '1234', failedAttempts: 2 };
    mockingoose(UserAccountsModel).toReturn(_doc, 'findOne');

    jest.spyOn(brcypt, 'compare').mockImplementation(() => false);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: 'failed',
        errMsg: 'You have failed to try 3 times! Account is locked!',
        success: false,
      }),
    );
  });

  test('if the password is right', async () => {
    const req = getMockReq({ body: { username: 'jack', password: '123' } });
    const { res } = getMockRes();
    const _doc = { username: 'jack', password: '123' };
    mockingoose(UserAccountsModel).toReturn(_doc, 'findOne');
    jest.spyOn(brcypt, 'compare').mockImplementation(() => true);
    generateToken.mockImplementation(() => 'token');

    await login(req, res);

    expect(generateToken).toHaveBeenCalledWith({ username: req.body.username });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          token: 'token',
          username: 'jack',
        },
        success: true,
      }),
    );
  });
});

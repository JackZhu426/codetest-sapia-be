import { jest } from '@jest/globals';
import { login } from '../../controllers/userLogin';
import { getMockReq, getMockRes } from '@jest-mock/express';
import { UserAccountsModel } from '../../models/userAccounts';
const mockingoose = require('mockingoose');
const { compare } = require('bcrypt');
// import { compare } from 'bcrypt';
jest.mock('bcrypt');
const { generateToken } = require('../../utils/jwt');
jest.mock('../../utils/jwt', () => {
  return {
    generateToken: jest.fn().mockImplementation(() => 'token'),
  };
});
// import { generateToken } from '../../utils/jwt';

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
    mockingoose(UserAccountsModel).toReturn({ lockedTime: new Date() }, 'findOne');
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
    const returnUserMock = jest.fn().mockReturnValue({ username: 'jack', password: '1234' });
    mockingoose(UserAccountsModel).toReturn(returnUserMock, 'findOne');
    const user = await UserAccountsModel.findOne({ username: 'jack' });
    compare.mockReturnValue(false);
    // 1. more than 5 min
    await login(req, res);
    expect(user).toBeDefined();
    expect(user?.save).toHaveBeenCalled();
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
    const user = await UserAccountsModel.findOne({ username: 'jack' });
    compare.mockReturnValue(false);
    // 1. more than 5 min
    await login(req, res);
    expect(user).toBeDefined();
    expect(user?.save).toHaveBeenCalled();
    // console.log('user is: ', await UserAccountsModel.findOne({ username: 'jack' }));
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
    console.log('req body:', req.body.username);
    const { res } = getMockRes();
    const _doc = { username: 'jack', password: '123' };
    mockingoose(UserAccountsModel).toReturn(_doc, 'findOne');
    const user = await UserAccountsModel.findOne({ username: 'jack' });
    compare.mockReturnValue(true);
    // 1. more than 5 min
    await login(req, res);
    expect(user).toBeDefined();
    expect(user?.save).toHaveBeenCalled();
    expect(generateToken).toHaveBeenCalledWith({ username: req.body.username });
    // generateToken.mockImplementation(() => 'token');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          token: 'token',
          username: 'jack',
        },
        errMsg: undefined,
        success: true,
      }),
    );
  });
});

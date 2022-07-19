import { login } from '../../controllers/userLogin';
import { getMockReq, getMockRes } from '@jest-mock/express';
import { UserAccountsModel } from '../../models/userAccounts';
const mockingoose = require('mockingoose');
const { compare } = require('bcrypt');
jest.mock('bcrypt');
// import { compare } from 'bcrypt';

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
    // console.log('user is:', user);
    compare.mockReturnValue(false);
    // 1. more than 5 min
    await login(req, res);
    expect(user).toBeDefined();
    expect(user?.failedAttempts).toBe(user?.failedAttempts ? user?.failedAttempts : 0);
    expect(user?.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: 'failed',
        errMsg: 'password is wrong!',
        success: false,
      }),
    );
  });

  test('if the password is wrong, and hits 3 times in 5 min', async () => {
    const req = getMockReq({ body: { username: 'jack', password: '1234' } });
    const { res } = getMockRes();
    const returnUserMock = jest
      .fn()
      .mockReturnValue({ username: 'jack', password: '1234', failedAttempts: 2 });
    mockingoose(UserAccountsModel).toReturn(returnUserMock, 'findOne');
    const user = await UserAccountsModel.findOne({ username: 'jack' });
    compare.mockReturnValue(false);
    // 1. more than 5 min
    await login(req, res);
    expect(user).toBeDefined();
    console.log('user is:', user);
    // TODO: check 'failedAttempts' and 'lockedTime' values
    expect(user?.failedAttempts).toBe(2);
    expect(user?.lockedTime).toBe(undefined);

    expect(user?.save).toHaveBeenCalled();
    // const user2 = await UserAccountsModel.findOne({ username: 'jack' }).exec();
    // expect(user2?.failedAttempts).toBe(0);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: 'failed',
        errMsg: 'password is wrong!',
        success: false,
      }),
    );
  });
});

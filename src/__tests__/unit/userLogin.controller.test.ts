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

  test('reset db fields after 5 min, or put the right login info', async () => {
    const req = getMockReq({ body: { username: 'jack', password: '123' } });
    const { res } = getMockRes();
    mockingoose(UserAccountsModel).toReturn(
      { username: 'jack', password: '123', lockedTime: new Date(2000, 1, 1) },
      'findOne',
    );
    const user = await UserAccountsModel.findOne();
    console.log('user is:', user);
    compare.mockReturnValue(true);
    // 1. more than 5 min
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      data: {
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImphY2siLCJpYXQiOjE2NTgyMjU1OTYsImV4cCI6MTY1ODIyOTE5Nn0.-djTfU_YM0bt5MZIG9FaAgmAP7Q_GoS9A1TQQcq3n8o',
        username: 'jack',
      },
      errMsg: undefined,
      success: true,
    });
  });
});

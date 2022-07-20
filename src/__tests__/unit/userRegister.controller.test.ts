/**
 * @author: Jack Zhu
 * @created : 2022/7/20
 * @lastModified : 2022/7/20
 */
import { jest } from '@jest/globals';
import { register } from '../../controllers/userRegister';
import { getMockReq, getMockRes } from '@jest-mock/express';
import { UserAccountsModel } from '../../models/userAccounts';
const mockingoose = require('mockingoose');
const { hash } = require('bcrypt');
jest.mock('bcrypt');
const { generateToken } = require('../../utils/jwt');
jest.mock('../../utils/jwt', () => {
  return {
    generateToken: jest.fn().mockImplementation(() => 'token'),
  };
});

describe('test user register logic', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  test('if the username already exists', async () => {
    const req = getMockReq({ body: { username: 'jack', password: '123' } });
    const { res } = getMockRes();
    mockingoose(UserAccountsModel).toReturn({ username: 'jack' }, 'findOne');
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: 'failed',
        errMsg: 'username already exists!',
        success: false,
      }),
    );
  });

  test('if successfully registered a user', async () => {
    const req = getMockReq({ body: { username: 'jack', password: '123' } });
    const { res } = getMockRes();
    mockingoose(UserAccountsModel).toReturn(undefined, 'findOne');
    hash.mockImplementation(() => 'hashedPassword');
    await register(req, res);
    expect(hash).toHaveBeenCalledWith(req.body.password, 10);
    const user = new UserAccountsModel({
      username: req.body.username,
      password: 'hashedPassword',
    });
    console.log('register user:', user);
    expect(user).toBeDefined();
    expect(user?.save).toHaveBeenCalled();
    expect(generateToken).toHaveBeenCalledWith({ username: req.body.username });
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

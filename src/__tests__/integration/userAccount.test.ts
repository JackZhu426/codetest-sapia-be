/**
 * @author: Jack Zhu
 * @created : 2022/7/20
 * @lastModified : 2022/7/20
 */
const mongoose = require('mongoose');
import request from 'supertest';
import { hash } from 'bcrypt';

import app from '../../app';
import { UserAccountsModel } from '../../models/userAccounts';

describe('/login', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // 1) clear the db before each test  2) insert a new user account
  beforeEach(async () => {
    await UserAccountsModel.deleteMany({}).exec();
    const hashedPassword = await hash('123', 10);
    const user = new UserAccountsModel({
      username: 'jack',
      password: hashedPassword,
    });
    await user.save();
  });

  it('should return success and JWT token when user put the right username and password when login', async () => {
    const body = {
      username: 'jack',
      password: '123',
    };
    const res = await request(app).post('/login').send(body);
    // console.log('find one:', await UserAccountsModel.findOne({ username: 'jack' }));
    // console.log('res:', res.body.data.token);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        data: {
          token: res.body.data.token,
          username: res.body.data.username,
        },
        success: true,
      }),
    );
  });

  it('should return fail if username and password are not matched', async () => {
    const body = {
      username: 'jack',
      password: '1234',
    };
    const res = await request(app).post('/login').send(body);
    const user = await UserAccountsModel.findOne({ username: body.username });
    expect(user).toBeDefined();
    // expect(user?.save).toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        data: 'failed',
        errMsg: 'Password is wrong! Please try again!',
        success: false,
      }),
    );
  });

  it('should return fail and lock the account if user has failed to try 3 times in 5 min', async () => {
    const body = {
      username: 'jack',
      password: '1234',
    };
    // mock a user who has failed to try 2 times already
    const user = await UserAccountsModel.findOneAndUpdate(
      { username: body.username },
      { failedAttempts: 2 },
      { new: true },
    ).exec();

    const res = await request(app).post('/login').send(body);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        data: 'failed',
        errMsg: 'You have failed to try 3 times! Account is locked!',
        success: false,
      }),
    );
  });

  it('should return fail if the user account has been locked', async () => {
    const body = {
      username: 'jack',
      password: '123',
    };
    // mock a user who has failed to try 3 times in 5 min and has been locked
    const user = await UserAccountsModel.findOneAndUpdate(
      { username: body.username },
      { lockedTime: new Date() },
      { new: true },
    ).exec();
    // console.log('new user:', user);
    const res = await request(app).post('/login').send(body);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        data: 'failed',
        errMsg: 'account is locked! Please try again after 5 min',
        success: false,
      }),
    );
  });
});

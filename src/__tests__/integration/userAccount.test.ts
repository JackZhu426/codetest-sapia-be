/**
 * @author: Jack Zhu
 * @created : 2022/7/20
 * @lastModified : 2022/7/20
 */
// const mongoose = require('mongoose');
import mongoose from 'mongoose';
import request from 'supertest';
import { hash } from 'bcrypt';

import app from '../../app';
import { UserAccountsModel } from '../../models/userAccounts';

describe('/login', () => {
  beforeAll(async () => {
    await mongoose.connect((global as any).__MONGO_URI__);
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
    console.log('find one:', await UserAccountsModel.findOne({ username: 'jack' }));
    // console.log('res:', res.body.data.token);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.username).toBe(body.username);
  });

  it('should return fail if username and password are not matched', async () => {
    const body = {
      username: 'jack',
      password: '1234',
    };
    const res = await request(app).post('/login').send(body);
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
    // create a user who has failed to try 2 times already
    await UserAccountsModel.findOneAndUpdate(
      { username: body.username },
      { failedAttempts: 2 },
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
    // create a user who has failed to try 3 times in 5 min and has been locked
    await UserAccountsModel.findOneAndUpdate(
      { username: body.username },
      { lockedTime: new Date() },
    ).exec();

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

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
    console.log('find one:', await UserAccountsModel.findOne({ username: 'jack' }));
    console.log('res:', res.body.data.token);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        data: {
          token: res.body.data.token,
          username: 'jack',
        },
        success: true,
      }),
    );
  });
});

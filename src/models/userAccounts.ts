/**
 * @author: Jack Zhu
 * @created : 2022/7/15
 * @lastModified : 2022/7/15
 */
import { Schema, model } from 'mongoose';
import { hash, compare } from 'bcrypt';

const userAccountsSchema = new Schema({
  username: {
    type: String,
    required: [true, 'username is required'],
  },
  password: {
    type: String,
    required: [true, 'password is required'],
  },
  failedAttempts: {
    type: Number,
    default: 0,
  },
  lockedTime: {
    type: Date,
  },
});

// export the model for controller (i.e. controllers/userLogin.ts and controllers/userRegister.ts) to use
export const UserAccountsModel = model('UserAccounts', userAccountsSchema);

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
});

// 'hash' & 'salt' the password before saving
userAccountsSchema.method('hashPassword', async function () {
  this.password = await hash(this.password, 10);
});

userAccountsSchema.methods.comparePassword = async function (pwdByUser: string) {
  return await compare(pwdByUser, this.password);
};

// export the model for controller (i.e. controllers/userLogin.ts and controllers/userRegister.ts) to use
export const UserAccountsModel = model('UserAccounts', userAccountsSchema);

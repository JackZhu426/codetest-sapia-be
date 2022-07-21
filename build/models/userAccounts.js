"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAccountsModel = void 0;
/**
 * @author: Jack Zhu
 * @created : 2022/7/15
 * @lastModified : 2022/7/15
 */
const mongoose_1 = require("mongoose");
const userAccountsSchema = new mongoose_1.Schema({
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
    failedTime: {
        type: Date,
    },
});
// export the model for controller (i.e. controllers/userLogin.ts and controllers/userRegister.ts) to use
exports.UserAccountsModel = (0, mongoose_1.model)('UserAccounts', userAccountsSchema);

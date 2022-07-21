"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcrypt_1 = require("bcrypt");
const userAccounts_1 = require("../models/userAccounts");
const jwt_1 = require("../utils/jwt");
const responseData_1 = require("../utils/responseData");
const getTimeLapse_1 = require("../utils/getTimeLapse");
// export this controller function for routes (i.e. routes/userLogin.ts) to use
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // 1. find the user by 'username'
    const exsitingUser = yield userAccounts_1.UserAccountsModel.findOne({ username }).exec();
    // 2. if user does NOT exist, return 'failed'
    if (!exsitingUser) {
        return res.status(401).json((0, responseData_1.getResponseData)('failed', 'username does not exist!'));
    }
    // 3. lockedTime exists and <= 5min, still locked - return 'failed'
    // even if the user enters the right username & password
    if (exsitingUser.failedTime &&
        (0, getTimeLapse_1.getTimeLapse)(exsitingUser.failedTime) <= 1000 * 60 * 5 &&
        exsitingUser.failedAttempts === 3) {
        return res
            .status(401)
            .json((0, responseData_1.getResponseData)('failed', `account is locked! Please try again after ${Math.ceil((1000 * 60 * 5 - (0, getTimeLapse_1.getTimeLapse)(exsitingUser.failedTime)) / 60000)} min`));
    }
    // 4. user exists, check the password
    const isPasswordCorrect = yield (0, bcrypt_1.compare)(password, exsitingUser.password);
    // 5. reset 'failedAttempts' and 'failedTime' under 2 circumstances:
    // a. user enters the right username & password
    // b. 5 min after last wrong password entered
    if (isPasswordCorrect ||
        (exsitingUser.failedTime && (0, getTimeLapse_1.getTimeLapse)(exsitingUser.failedTime) > 1000 * 60 * 5)) {
        exsitingUser.failedAttempts = 0;
        exsitingUser.failedTime = undefined;
    }
    // 6. if the password is wrong, return 'failed' (fail fast)
    if (!isPasswordCorrect) {
        // field 'failedAttempts' is incremented by 1
        exsitingUser.failedAttempts += 1;
        // field 'failedTime' is updated
        exsitingUser.failedTime = new Date();
        yield exsitingUser.save();
        // 3rd time try, but still wrong password, lock the user
        if (exsitingUser.failedAttempts === 3) {
            return res
                .status(401)
                .json((0, responseData_1.getResponseData)('failed', 'You have failed to try 3 times! Account is locked!'));
        }
        return res.status(401).json((0, responseData_1.getResponseData)('failed', 'Password is wrong! Please try again!'));
    }
    // 7. user exists & password is correct (reset logic is hoisted above)
    yield exsitingUser.save();
    const token = (0, jwt_1.generateToken)({ username });
    return res.status(201).json((0, responseData_1.getResponseData)({ token, username }));
});
exports.login = login;

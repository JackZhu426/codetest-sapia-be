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
    // Note: used to put the logic 5. (some logic, diff code) before it to save some chunks of the code, but here follow the 'fail fast' rule
    if (exsitingUser.lockedTime && (0, getTimeLapse_1.getTimeLapse)(exsitingUser.lockedTime) <= 1000 * 60 * 5) {
        return res
            .status(401)
            .json((0, responseData_1.getResponseData)('failed', `account is locked! Please try again after ${Math.ceil((1000 * 60 * 5 - (0, getTimeLapse_1.getTimeLapse)(exsitingUser.lockedTime)) / 60000)} min`));
    }
    // 4. user exists, check the password
    const isPasswordCorrect = yield (0, bcrypt_1.compare)(password, exsitingUser.password);
    // 5. conditions: more than 5 min (unlock the user) || (if not locked) username & password are right , reset db fields
    if ((exsitingUser.lockedTime && (0, getTimeLapse_1.getTimeLapse)(exsitingUser.lockedTime) > 1000 * 60 * 5) ||
        isPasswordCorrect) {
        exsitingUser.lockedTime = undefined;
        exsitingUser.failedAttempts = 0;
    }
    // 6. if the password is wrong
    if (!isPasswordCorrect) {
        exsitingUser.failedAttempts += 1;
        // tried 2 time, but still wrong password, lock the user
        // 1) add the lockedTime  2) add the failedAttempts
        if (exsitingUser.failedAttempts === 3) {
            exsitingUser.lockedTime = new Date();
        }
        // db: field 'failedAttempts' is incremented by 1
        console.log('exsisting user failed attempts:', exsitingUser.failedAttempts);
        yield exsitingUser.save();
        return res.status(401).json((0, responseData_1.getResponseData)('failed', 'password is wrong!'));
    }
    yield exsitingUser.save();
    // 4. user exists & password is correct
    const token = (0, jwt_1.generateToken)({ username });
    return res.status(201).json((0, responseData_1.getResponseData)({ token, username }));
});
exports.login = login;

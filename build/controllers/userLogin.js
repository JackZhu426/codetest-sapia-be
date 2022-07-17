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
// export this controller function for routes (i.e. routes/userLogin.ts) to use
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { username, password } = req.body;
    // 1. find the user by 'username'
    const exsitingUser = yield userAccounts_1.UserAccountsModel.findOne({ username }).exec();
    // 2. if user does NOT exist, return 'failed'
    if (!exsitingUser) {
        return res.status(401).json((0, responseData_1.getResponseData)('failed', 'username does not exist!'));
    }
    // 3. lockedTime exists and > 5min, unlock the user
    console.log('curLockedTime:', (_a = exsitingUser.lockedTime) === null || _a === void 0 ? void 0 : _a.getTime());
    console.log('exsitingUser.failedAttempts out of compare:', exsitingUser.failedAttempts);
    if (exsitingUser.lockedTime &&
        new Date().getTime() - exsitingUser.lockedTime.getTime() > 1000 * 60) {
        // unlock the user
        console.log('unlock the user');
        exsitingUser.lockedTime = undefined;
        exsitingUser.failedAttempts = 0;
        yield exsitingUser.save();
    }
    // 3. user exists, but password is wrong, return 'failed'
    // !Attention!: this func returns Promise<boolean>, here must use 'await'
    const isPasswordCorrect = yield (0, bcrypt_1.compare)(password, exsitingUser.password);
    if (!isPasswordCorrect) {
        // still has to fetch from db once again, coz it's async
        const curUser = yield userAccounts_1.UserAccountsModel.findOne({ username }).exec();
        console.log('curUser.failedAttempts in compare:', curUser === null || curUser === void 0 ? void 0 : curUser.failedAttempts);
        if ((curUser === null || curUser === void 0 ? void 0 : curUser.failedAttempts) === 3) {
            console.log('lock the user');
            const curUserLockedTime = ((_b = curUser.lockedTime) === null || _b === void 0 ? void 0 : _b.getTime()) || new Date().getTime();
            return res
                .status(401)
                .json((0, responseData_1.getResponseData)('failed', `account is locked! Please try again after ${Math.ceil((1000 * 60 - (new Date().getTime() - curUserLockedTime)) / 60000)} min`));
        }
        if ((curUser === null || curUser === void 0 ? void 0 : curUser.failedAttempts) == 2) {
            console.log('add the lockedTime');
            const lockedTimeUser = yield userAccounts_1.UserAccountsModel.findOneAndUpdate({ username }, { lockedTime: new Date() }, { new: true }).exec();
            console.log('lockedTimeUser:', lockedTimeUser === null || lockedTimeUser === void 0 ? void 0 : lockedTimeUser.lockedTime);
        }
        // db: field 'failedAttempts' should be incremented
        const incAttemptUser = yield userAccounts_1.UserAccountsModel.findOneAndUpdate({ username }, { $inc: { failedAttempts: 1 } }, { new: true }).exec();
        console.log('IncAttemptUser:', incAttemptUser === null || incAttemptUser === void 0 ? void 0 : incAttemptUser.failedAttempts);
        return res.status(401).json((0, responseData_1.getResponseData)('failed', 'password is wrong!'));
    }
    // 4. user exists & password is correct,
    // return token (for front-end to save to 'localStorage' -> then put it to header: { Authorization: Bearer xxx} ), and username
    const token = (0, jwt_1.generateToken)({ username });
    return res.status(201).json((0, responseData_1.getResponseData)({ token, username }));
});
exports.login = login;

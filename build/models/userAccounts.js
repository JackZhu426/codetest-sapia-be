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
exports.UserAccountsModel = void 0;
/**
 * @author: Jack Zhu
 * @created : 2022/7/15
 * @lastModified : 2022/7/15
 */
const mongoose_1 = require("mongoose");
const bcrypt_1 = require("bcrypt");
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
    lockedTime: {
        type: Date,
    },
});
// 'hash' & 'salt' the password before saving
userAccountsSchema.method('hashPassword', function () {
    return __awaiter(this, void 0, void 0, function* () {
        this.password = yield (0, bcrypt_1.hash)(this.password, 10);
    });
});
userAccountsSchema.methods.comparePassword = function (pwdByUser) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, bcrypt_1.compare)(pwdByUser, this.password);
    });
};
// export the model for controller (i.e. controllers/userLogin.ts and controllers/userRegister.ts) to use
exports.UserAccountsModel = (0, mongoose_1.model)('UserAccounts', userAccountsSchema);

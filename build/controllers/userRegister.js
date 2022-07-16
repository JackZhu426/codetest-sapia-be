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
exports.register = void 0;
const bcrypt_1 = require("bcrypt");
const userAccounts_1 = require("../models/userAccounts");
const jwt_1 = require("../utils/jwt");
const responseData_1 = require("../utils/responseData");
// export this controller function for routes (i.e. routes/userRegister.ts) to use
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // 1. check if the username already exists
    const userAccounts = yield userAccounts_1.UserAccountsModel.findOne({ username });
    if (userAccounts)
        return res.status(409).json((0, responseData_1.getResponseData)(false, 'username already exists!'));
    // 2. if not, register
    // 2.1 'hash' & 'salt' the password before saving
    const hashedPassword = yield (0, bcrypt_1.hash)(password, 10);
    // !Attention!: password is hashed, need to write the key instead of 'Object Literal Property Value Shorthand'
    const newUserAccounts = new userAccounts_1.UserAccountsModel({ username: username, password: hashedPassword });
    yield newUserAccounts.save();
    // 3. jwt, generate token (payload: object)
    const token = (0, jwt_1.generateToken)({ username });
    return res.status(201).json((0, responseData_1.getResponseData)({ token, username }));
});
exports.register = register;

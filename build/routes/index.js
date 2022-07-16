"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author: Jack Zhu
 * @created : 2022/7/15
 * @lastModified : 2022/7/16
 */
const express_1 = require("express");
const userRegister_1 = __importDefault(require("./userRegister"));
const userLogin_1 = __importDefault(require("./userLogin"));
const router = (0, express_1.Router)();
router.use('/register', userRegister_1.default);
router.use('/login', userLogin_1.default);
exports.default = router;

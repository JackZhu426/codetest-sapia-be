"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author: Jack Zhu
 * @created : 2022/7/16
 * @lastModified : 2022/7/16
 */
const express_1 = require("express");
const userLogin_1 = require("../controllers/userLogin");
const loginRouter = (0, express_1.Router)();
loginRouter.post('', userLogin_1.login);
exports.default = loginRouter;

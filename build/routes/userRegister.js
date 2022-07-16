"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author: Jack Zhu
 * @created : 2022/7/15
 * @lastModified : 2022/7/15
 */
const express_1 = require("express");
const userRegister_1 = require("../controllers/userRegister");
const registerRouter = (0, express_1.Router)();
registerRouter.post('', userRegister_1.register);
exports.default = registerRouter;

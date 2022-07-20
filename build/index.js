"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author: Jack Zhu
 * @created : 2022/7/15
 * @lastModified : 2022/7/20
 */
require("dotenv/config");
const db_1 = require("./utils/db");
const app_1 = __importDefault(require("./app"));
// value from '.env'
const PORT = process.env.PORT || 3001;
// connect to MongoDB
(0, db_1.connectToDB)();
// start the server
app_1.default.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

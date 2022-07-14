"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author: Jack Zhu
 * Date: 2022/7/15
 */
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./routes");
// .env
const PORT = process.env.PORT || 3001;
// 1. Create an express application
const app = (0, express_1.default)();
// 2. Add middleware to parse incoming requests
// 2.1 parse application/json
app.use(body_parser_1.default.json());
// 2.2 parse application/x-www-form-urlencoded
app.use(body_parser_1.default.urlencoded({ extended: true }));
// 3. cors middleware
app.use((0, cors_1.default)());
// 4. router registration
// TODO: version control - e.g. '/v1' in the first param
app.use(routes_1.router);
// 5. start the server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

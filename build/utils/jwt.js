"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_KEY = process.env.JWT_KEY || 'secret';
// return generated JWT string ↓, containing username and expiry date in the payload
// HEADER + PAYLOAD + SIGNATURE
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_KEY, { expiresIn: '1h' });
};
exports.generateToken = generateToken;
// veryfy the JWT string and return the 1) decoded payload (if valid), 2) null (if invalid)
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_KEY);
    }
    catch (err) {
        return null;
    }
};
exports.verifyToken = verifyToken;

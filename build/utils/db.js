"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDB = void 0;
/**
 * @author: Jack Zhu
 * @created : 2022/7/15
 * @lastModified : 2022/7/15
 */
const mongoose_1 = require("mongoose");
// return the Promise<typeof import('mongoose')> of the connection
const connectToDB = () => {
    const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || '';
    if (!DB_CONNECTION_STRING) {
        console.error('DB_CONNECTION_STRING is not defined');
        process.exit(1);
    }
    /**
     * 1st param: connection string ref ↓
     * 0 = disconnected
     * 1 = connected
     * 2 = connecting
     * 3 = disconnecting
     *
     * 2nd param: callback fn - listen for connection
     */
    // 'connected': everything is just fine :)
    mongoose_1.connection.on('connected', () => {
        console.log('DB connected successfully:', DB_CONNECTION_STRING);
    });
    // 'error' -> then exit
    mongoose_1.connection.on('error', (err) => {
        console.error('DB error:', err);
        process.exit(2);
    });
    // 'disconnected'
    mongoose_1.connection.on('disconnected', () => {
        console.log('DB disconnected');
    });
    return (0, mongoose_1.connect)(DB_CONNECTION_STRING);
};
exports.connectToDB = connectToDB;

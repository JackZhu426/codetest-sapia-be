"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResponseData = void 0;
const getResponseData = (data, errMsg) => {
    // if there is any 'errMsg'，success: false
    if (errMsg) {
        return {
            success: false,
            errMsg: errMsg,
            data: data,
        };
    }
    return {
        success: true,
        errMsg: errMsg,
        data: data,
    };
};
exports.getResponseData = getResponseData;

/**
 * @author: Jack Zhu
 * @created : 2022/7/16
 * @lastModified : 2022/7/16
 */
import { ResponseType } from 'types';

export const getResponseData = (data: any, errMsg?: string): ResponseType => {
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

/**
 * @author: Jack Zhu
 * @created : 2022/7/17
 * @lastModified : 2022/7/17
 * @return: type: number - milliseconds (date in db to current time)
 */
export const getTimeLapse = (date: Date): number => {
  // if db value is undefined (default), return -1
  // just for safe code, coz field 'lockedTime' type check in the model is 'Date' or 'undefined'
  // if (!date) return -1;
  return Date.now() - date.getTime();
};

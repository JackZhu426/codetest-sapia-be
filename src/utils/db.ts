/**
 * @author: Jack Zhu
 * @created : 2022/7/15
 * @lastModified : 2022/7/15
 */
import { connection, connect } from 'mongoose';

// return the Promise<typeof import('mongoose')> of the connection
export const connectToDB = () => {
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
   */
  // 2nd param: listen for connection
  // 'connected', everything is just fine :)
  connection.on('connected', () => {
    console.log('DB connected successfully:', DB_CONNECTION_STRING);
  });
  // 'error' -> then exit
  connection.on('error', (err) => {
    console.error('DB error:', err);
    process.exit(2);
  });
  // 'disconnected'
  connection.on('disconnected', () => {
    console.log('DB disconnected');
  });
  return connect(DB_CONNECTION_STRING);
};

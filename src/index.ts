/**
 * @author: Jack Zhu
 * @created : 2022/7/15
 * @lastModified : 2022/7/20
 */
import 'dotenv/config';
import { connectToDB } from './utils/db';
import app from './app';

// value from '.env'
const PORT = process.env.PORT || 3001;

// connect to MongoDB
connectToDB();

// start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

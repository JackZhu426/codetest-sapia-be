/**
 * @author: Jack Zhu
 * @created : 2022/7/15
 * @lastModified : 2022/7/15
 */
import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import router from './routes';
import { connectToDB } from './utils/db';

// value(s) from '.env'
const PORT = process.env.PORT || 3001;

// 1. Create an express application
const app = express();

// 2. Add middleware to parse incoming requests
// 2.1 parse application/json
app.use(bodyParser.json());
// 2.2 parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// 3. cors middleware
app.use(cors());

// 4. router registration
// TODO: version control - e.g. '/v1' in the first param
app.use(router);

// 5. connect to MongoDB
connectToDB();

// 6. start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

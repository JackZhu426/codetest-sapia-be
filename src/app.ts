/**
 * @author: Jack Zhu
 * @created : 2022/7/20
 * @lastModified : 2022/7/20
 */
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import router from './routes';

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
app.use(router);

export default app;

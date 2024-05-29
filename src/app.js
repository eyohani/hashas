import express from 'express';
import dotenv from 'dotenv';

import { connectPrisma } from './utils/prisma.util.js';
import { router as usersRouter } from './routers/users.router.js';
import { router as resumeRouter } from './routers/resumes.router.js';
import { errorMiddleware } from './middlewares/error-handler.middleware.js';
import { logMiddleware } from './middlewares/log.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.set('port', PORT || 3100);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', usersRouter);
app.use('/resume', resumeRouter);

app.use(logMiddleware);
app.use(errorMiddleware);

app.get('/', (req, res) => {
  res.send('Hello world!!');
});

connectPrisma();

app.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}`);
});
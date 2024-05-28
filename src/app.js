import express from 'express';
import { router } from './routers/index';
import { errorHandler } from './middlewares/error-handler.middleware';
import { prisma } from './utils/prisma.util';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(router);

// Middleware to handle errors
app.use(errorHandler);

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log('DB 연결에 성공했습니다.');
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error('DB 연결에 실패했습니다.', error);
  }
});

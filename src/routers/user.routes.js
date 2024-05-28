// routes/user.routes.js

import express from 'express';
import { prisma } from '../src/utils/prisma.util';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// 내 정보 조회 API
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: '인증 정보와 일치하는 사용자가 없습니다.' });
    }

    res.json(user);
  } catch (error) {
    console.error('내 정보 조회에 실패했습니다.', error);
    res.status(500).json({ message: '내 정보 조회에 실패했습니다.' });
  }
});

export default router;

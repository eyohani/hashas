import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.util';
import { JWT_SECRET } from '../constants/env.constant';

export const requireAccessToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('인증 정보가 없습니다.');

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).send('인증 정보가 없습니다.');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) return res.status(401).send('인증 정보와 일치하는 사용자가 없습니다.');

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).send('인증 정보가 만료되었습니다.');
    }
    return res.status(401).send('인증 정보가 유효하지 않습니다.');
  }
};

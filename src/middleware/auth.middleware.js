// middleware/auth.middleware.js

import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '인증 정보가 없습니다.' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: '인증 정보가 만료되었습니다.' });
      }
      return res.status(403).json({ message: '인증 정보가 유효하지 않습니다.' });
    }
    req.user = user;
    next();
  });
};

// authRoutes.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

module.exports = (prisma) => {
  // 회원가입 API
  router.post('/signup', async (req, res) => {
    const { email, password, confirmPassword, name } = req.body;

    // 유효성 검사
    if (!email || !password || !confirmPassword || !name) {
      return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // 사용자 생성
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'APPLICANT', // 기본 역할
        },
      });

      res.status(201).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: '서버 오류' });
    }
  });

  // 로그인 API
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // 유효성 검사
    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
    }

    try {
      // 사용자 조회
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: '인증 정보가 유효하지 않습니다.' });
      }

      // 비밀번호 일치 확인
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: '인증 정보가 유효하지 않습니다.' });
      }

      // Access Token 생성
      const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '12h',
      });

      res.status(200).json({ accessToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: '서버 오류' });
    }
  });

  return router;
};

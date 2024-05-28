import { prisma } from '../utils/prisma.util';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// 회원가입 핸들러
export const signupHandler = async (req, res, next) => {
  const { email, password, confirmPassword, name } = req.body;

  try {
    // 요청 정보 유효성 검사
    if (!email || !password || !confirmPassword || !name) {
      return res.status(400).json({ message: 'OOO을 입력해 주세요.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: '입력 한 두 비밀번호가 일치하지 않습니다.' });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'APPLICANT', // 기본 역할 설정
      },
    });

    res.status(201).json({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

// 로그인 핸들러
export const loginHandler = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 요청 정보 유효성 검사
    if (!email || !password) {
      return res.status(400).json({ message: 'OOO을 입력해 주세요.' });
    }

    // 이메일로 사용자 조회
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'OOO을 입력해 주세요.' });
    }

    // 비밀번호 확인
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'OOO을 입력해 주세요.' });
    }

    // AccessToken 생성
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '12h',
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

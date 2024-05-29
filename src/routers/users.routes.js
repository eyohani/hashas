import express from 'express';
import bcrypt from 'bcrypt';

import { prisma } from '../utils/prisma.util.js';
import { signupValidation, loginValidation } from '../middlewares/joi-handler.middleware.js';
import { generateAccessToken, verifyAccessToken } from '../middlewares/require-access-token.middleware.js';

const router = express.Router();
const saltRounds = 10;

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, passwordCheck } = await signupValidation.validateAsync(req.body);

    const isExistUser = await prisma.users.findFirst({
      where: { OR: [{ name }, { email }] },
    });
    if (isExistUser) {
      return res.status(409).json({ message: 'This email or name are already exist.' });
    }

    if (!passwordCheck) {
      return res.status(400).json({ message: "You Should have to enter the passwordCheck." })
    }

    if (password !== passwordCheck) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const hashedPW = await bcrypt.hash(password, saltRounds);

    const usersCreate = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPW
      }
    });

    return res.status(201).json({
      id: usersCreate.userId,
      email: usersCreate.email,
      name: usersCreate.name,
      role: usersCreate.role,
      createdAt: usersCreate.createdAt,
      updatedAt: usersCreate.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = await loginValidation.validateAsync(req.body);

    const registeredUser = await prisma.users.findFirst({ where: { email } });
    if (!registeredUser) {
      return res.status(401).json({ message: 'This email does not exist.' });
    }

    const matchPW = await bcrypt.compare(password, registeredUser.password);
    if (!matchPW) {
      return res.status(401).json({ message: 'Password does not match.' });
    }

    // Generate JWT and return it in the response.
    const signedToken = generateAccessToken(registeredUser.userId);

    return res.status(200).json({ accessToken: signedToken });

  } catch (error) {
    next(error);
  }
});

router.get('/profile', verifyAccessToken, async (req, res, next) => {
  try {
    const authenticatedUser = await prisma.users.findUnique({
      where: { userId: req.userId },
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!authenticatedUser) {
      return res.status(404).json({ error: 'Not found user' });
    }

    res.status(200).json(authenticatedUser);
  } catch (error) {
    next(error);
  }
});

export { router };
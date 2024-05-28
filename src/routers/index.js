import { Router } from 'express';
import { authRouter } from './auth.router';
import { usersRouter } from './users.router';
import { resumesRouter } from './resumes.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/resumes', resumesRouter);

export { router };

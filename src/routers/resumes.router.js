import express from 'express';
import { prisma } from '../utils/prisma.util.js';
import { verifyAccessToken } from '../middlewares/require-access-token.middleware.js';
import { resumeCreateValidation, resumeUpdateValidation } from '../middlewares/joi-handler.middleware.js';

const router = express.Router();

router.post('/post', verifyAccessToken, async (req, res, next) => {
  try {
    const UserId = req.userId;

    const { title, introduce } = await resumeCreateValidation.validateAsync(req.body);

    if (!UserId) {
      return res.status(400).json({ error: 'User ID not provided' });
    }

    const resumeCreate = await prisma.resume.create({
      data: {
        UserId,
        title,
        introduce,
      },
    });

    return res.status(201).json({
      UserId: resumeCreate.UserId,
      resumeId: resumeCreate.resumeId,
      title: resumeCreate.title,
      introduce: resumeCreate.introduce,
      applicationStatus: resumeCreate.applicationStatus,
      createdAt: resumeCreate.createdAt,
      updatedAt: resumeCreate.updatedAt,
    });
  } catch (error) {
    if (error.isJoi) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next(error);
  }
});

router.get('/', verifyAccessToken, async (req, res, next) => {
  try {
    const UserId = req.userId;

    if (!UserId) {
      return res.status(400).json({ error: 'User ID not provided' });
    }

    const sort = req.query.sort && req.query.sort.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const resumeRead = await prisma.resume.findMany({
      select: {
        resumeId: true,
        title: true,
        introduce: true,
        applicationStatus: true,
        createdAt: true,
        updatedAt: true,
        Users: { select: { name: true } },
      },
      where: { UserId: UserId },
      orderBy: { createdAt: sort },
    });

    if (resumeRead.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json({ resumeRead });
  } catch (error) {
    next(error);
  }
});

router.get('/:resumeId', verifyAccessToken, async (req, res, next) => {
  try {
    const UserId = req.userId;
    const resumeId = Number(req.params.resumeId);

    const resumeReadDetail = await prisma.resume.findFirst({
      where: { UserId: UserId, resumeId: +resumeId },
      select: {
        resumeId: true,
        title: true,
        introduce: true,
        applicationStatus: true,
        createdAt: true,
        updatedAt: true,
        Users: { select: { name: true } },
      },
    });

    if (!resumeReadDetail) {
      res.status(404).json({ meassge: 'This resume does not exist.' });
    }

    return res.status(200).json({ resumeReadDetail });
  } catch (error) {
    next(error);
  }
});

router.patch('/update/:resumeId', verifyAccessToken, async (req, res, next) => {
  try {
    const UserId = req.userId;
    const resumeId = Number(req.params.resumeId);

    const { title, introduce } = await resumeUpdateValidation.validateAsync(req.body);

    if (!title && !introduce) {
      return res.status(400).json({ message: 'You have to enter information for update.' });
    }

    const getResumeDate = await prisma.resume.findFirst({
      where: { UserId: UserId, resumeId: resumeId },
    });

    if (!getResumeDate) {
      return res.status(404).json({ message: 'Resume is not exist.' });
    }

    const resumeUpdate = await prisma.resume.update({
      where: { UserId: UserId, resumeId: resumeId },
      data: {
        title: title || getResumeDate.title,
        introduce: introduce || getResumeDate.introduce,
      },
      select: {
        UserId: true,
        resumeId: true,
        title: true,
        introduce: true,
        applicationStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({ resumeUpdate });
  } catch (error) {
    next(error);
  }
});

router.delete('/delete/:resumeId', async (req, res, next) => {
  try {
    const UserId = req.userId;
    const resumeId = Number(req.params.resumeId);

    const getResumeDate = await prisma.resume.findFirst({
      where: { UserId: UserId, resumeId: resumeId },
    });

    if (!getResumeDate) {
      return res.status(404).json({ message: 'Resume is not exist.' });
    }

    const resumeDelete = await prisma.resume.delete({
      where: { resumeId: resumeId },
    });

    return res.status(200).json({ resumeDelete });
  } catch (error) {
    next(error);
  }
});

export { router };
const { Router } = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('./middleware');

const router = Router();
const prisma = new PrismaClient();

const ratingSchema = z.object({
  storeId: z.string(),
  score: z.number().int().min(1).max(5)
});

router.post('/', authenticate, authorize(['NORMAL']), async (req, res) => {
  try {
    const data = ratingSchema.parse(req.body);
    const userId = req.user.id;

    const existing = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId: data.storeId
        }
      }
    });

    if (existing) {
      const updated = await prisma.rating.update({
        where: { id: existing.id },
        data: { score: data.score }
      });
      return res.json({ message: 'Rating updated', rating: updated });
    } else {
      const created = await prisma.rating.create({
        data: {
          score: data.score,
          userId,
          storeId: data.storeId
        }
      });
      return res.status(201).json({ message: 'Rating submitted', rating: created });
    }
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

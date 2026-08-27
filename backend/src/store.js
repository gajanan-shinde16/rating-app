const { Router } = require('express');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('./middleware');

const router = Router();
const prisma = new PrismaClient();

const storeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  address: z.string().max(400),
  ownerId: z.string().optional()
});

router.post('/', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const data = storeSchema.parse(req.body);
    const existing = await prisma.store.findUnique({ where: { email: data.email } });
    if (existing) return res.status(400).json({ error: 'Store email already exists' });

    const store = await prisma.store.create({
      data: {
        name: data.name,
        email: data.email,
        address: data.address,
        ownerId: data.ownerId || null
      }
    });
    res.status(201).json(store);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const { name, address, sortField, sortOrder } = req.query;
    
    let whereClause = {};
    if (name) whereClause.name = { contains: String(name) };
    if (address) whereClause.address = { contains: String(address) };

    let orderBy = { createdAt: 'desc' };
    if (sortField && sortOrder) {
      if (sortField !== 'rating') {
        orderBy = { [String(sortField)]: sortOrder === 'asc' ? 'asc' : 'desc' };
      }
    }

    const stores = await prisma.store.findMany({
      where: whereClause,
      orderBy,
      include: {
        ratings: true
      }
    });

    const storesWithRating = stores.map(store => {
      const avgRating = store.ratings.length > 0 
        ? store.ratings.reduce((sum, r) => sum + r.score, 0) / store.ratings.length 
        : 0;
      
      let userRating = null;
      if (req.user) {
        const ur = store.ratings.find(r => r.userId === req.user.id);
        if (ur) userRating = ur.score;
      }
      
      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: avgRating,
        userRating
      };
    });
    
    if (sortField === 'rating') {
      storesWithRating.sort((a, b) => 
        sortOrder === 'asc' ? a.averageRating - b.averageRating : b.averageRating - a.averageRating
      );
    }

    res.json(storesWithRating);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/dashboard', authenticate, authorize(['STORE_OWNER']), async (req, res) => {
  try {
    const store = await prisma.store.findUnique({
      where: { ownerId: req.user.id },
      include: {
        ratings: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'No store assigned to this owner' });
    }

    const avgRating = store.ratings.length > 0 
      ? store.ratings.reduce((sum, r) => sum + r.score, 0) / store.ratings.length 
      : 0;

    res.json({
      storeName: store.name,
      averageRating: avgRating,
      ratings: store.ratings.map(r => ({
        score: r.score,
        userName: r.user.name,
        userEmail: r.user.email,
        createdAt: r.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

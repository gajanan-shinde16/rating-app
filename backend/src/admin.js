const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('./middleware');

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate, authorize(['ADMIN']));

const passwordSchema = z.string().min(8).max(16).regex(/[A-Z]/).regex(/[^a-zA-Z0-9]/);

const createUserSchema = z.object({
  name: z.string().min(20).max(60),
  email: z.string().email(),
  password: passwordSchema,
  address: z.string().max(400),
  role: z.enum(['ADMIN', 'NORMAL', 'STORE_OWNER']).optional()
});

router.post('/users', async (req, res) => {
  try {
    const data = createUserSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        address: data.address,
        role: data.role || 'NORMAL'
      }
    });
    res.status(201).json({ id: user.id });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { name, email, address, role, sortField, sortOrder } = req.query;
    
    let whereClause = {};
    if (name) whereClause.name = { contains: String(name) };
    if (email) whereClause.email = { contains: String(email) };
    if (address) whereClause.address = { contains: String(address) };
    if (role) whereClause.role = role;

    let orderBy = { createdAt: 'desc' };
    if (sortField && sortOrder) {
      orderBy = { [String(sortField)]: sortOrder === 'asc' ? 'asc' : 'desc' };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy,
      select: {
        id: true, name: true, email: true, address: true, role: true
      }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        ownedStore: {
          include: {
            ratings: true
          }
        }
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    let storeRating = null;
    if (user.role === 'STORE_OWNER' && user.ownedStore) {
      const ratings = user.ownedStore.ratings;
      storeRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length 
        : 0;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      storeRating
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    const totalRatings = await prisma.rating.count();
    res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

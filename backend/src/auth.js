const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('./middleware');

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

const passwordSchema = z.string()
  .min(8)
  .max(16)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

const registerSchema = z.object({
  name: z.string().min(20).max(60),
  email: z.string().email(),
  password: passwordSchema,
  address: z.string().max(400),
});

router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        address: data.address,
        role: 'NORMAL'
      }
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/update-password', authenticate, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const parsedPassword = passwordSchema.parse(newPassword);
    const passwordHash = await bcrypt.hash(parsedPassword, 10);
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash }
    });
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

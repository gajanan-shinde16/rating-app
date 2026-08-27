const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const storeRoutes = require('./store');
const ratingRoutes = require('./rating');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

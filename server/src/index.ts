import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rfpRoutes from './routes/rfpRoutes';
import vendorRoutes from './routes/vendorRoutes'

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/rfps', rfpRoutes);
app.use('/api/vendors',vendorRoutes)

// DB Connection
const MONGO_URI = process.env.MONGO_URI || '';
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ DB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
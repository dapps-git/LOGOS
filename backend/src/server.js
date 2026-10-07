require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const referralRoutes = require('./routes/referralRoutes');
const couponRoutes = require('./routes/couponRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Connect Database
connectDB();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  'https://logos-chi-ten.vercel.app',
  'https://logos-4n4d.vercel.app',
  'https://logos-2nkc.vercel.app',
  'https://logos-delta-eight.vercel.app',
  'https://tweaki.pw',
  'https://www.tweaki.pw',
  process.env.CLIENT_URL,
  process.env.ADMIN_URL
].filter(Boolean).map(url => url.replace(/\/$/, ''));

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith('.vercel.app') ||
      process.env.NODE_ENV === 'development'
    ) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'x-guest-id',
    'x-guest-session-id',
    'X-Guest-Id',
    'X-Guest-Session-Id'
  ]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check (support root, /logos, /api/health, /logos/api/health)
const healthHandler = (req, res) => {
  res.json({
    status: 'ok',
    app: 'LOGOS Book E-Commerce API',
    timestamp: new Date().toISOString()
  });
};

app.get(['/', '/logos', '/api/health', '/logos/api/health'], healthHandler);

// API Routes - mount on both /api and /logos/api for cPanel subpath compatibility
const routeList = [
  ['/auth', authRoutes],
  ['/books', bookRoutes],
  ['/banners', bannerRoutes],
  ['/referrals', referralRoutes],
  ['/coupons', couponRoutes],
  ['/orders', orderRoutes],
  ['/cart', cartRoutes],
  ['/wishlist', wishlistRoutes],
  ['/reviews', reviewRoutes]
];

routeList.forEach(([path, router]) => {
  app.use(`/api${path}`, router);
  app.use(`/logos/api${path}`, router);
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[LOGOS Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');

const app = express();

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));

// ─── Body Parsing & Sanitization ────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  // Skip sanitization for auth routes — passwords must remain as-is
  if (req.path.startsWith('/api/auth')) return next();
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (req.body[key] === '') {
        req.body[key] = null;
      }
    }
  }
  next();
});

// ─── Request Logging ────────────────────────────────────────────────────────
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'EEC Transport PMS API is running.', timestamp: new Date().toISOString() });
});

// ─── API Routes ─────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');
const projectRoutes   = require('./routes/projectRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const apiRoutes       = require('./routes/index');

app.use('/api/auth',      authRoutes);
app.use('/api/projects',  projectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api',           apiRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found.` });
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const status  = err.status  || 500;
  const message = err.message || 'Internal Server Error';
  if (config.env !== 'production') {
    console.error(`[${status}] ${message}`, err.stack || '');
  }
  res.status(status).json({ success: false, message });
});

module.exports = app;

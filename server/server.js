require('dotenv').config();
const express = require('express');
const cors = require('cors');
const summitsRouter = require('./routes/summits');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'file://'],
    methods: ['GET'],
    credentials: false
  }));
}

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'WOTA Mapping API Server',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/summits', summitsRouter);

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal server error. Please try again later.'
  });
});

app.listen(PORT, () => {
  console.log(`WOTA Mapping API server listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the other server or change the PORT in .env`);
  } else {
    console.error('Server startup error:', err.message);
  }
  process.exit(1);
});

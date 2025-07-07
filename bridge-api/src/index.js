const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const redis = require('redis');

// 導入路由
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const categoryRoutes = require('./routes/categories');

// 載入環境變數
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 資料庫連接
let db;
let redisClient;

async function initDatabase() {
  try {
    // MySQL連接
    db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'dujiaoka',
      charset: 'utf8mb4'
    });

    // Redis連接
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || ''
    });

    await redisClient.connect();
    
    console.log('數據庫連接成功');
  } catch (error) {
    console.error('數據庫連接失敗:', error);
    process.exit(1);
  }
}

// 將資料庫連接添加到req對象
app.use((req, res, next) => {
  req.db = db;
  req.redis = redisClient;
  next();
});

// 路由
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/categories', categoryRoutes);

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'dujiaoka-medusa-bridge'
  });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: '服務器內部錯誤',
    message: process.env.NODE_ENV === 'development' ? err.message : '請稍後再試'
  });
});

// 404處理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 啟動服務器
async function startServer() {
  await initDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 API橋接服務啟動成功！`);
    console.log(`📡 服務地址: http://localhost:${PORT}`);
    console.log(`🔗 健康檢查: http://localhost:${PORT}/health`);
  });
}

// 優雅關閉
process.on('SIGTERM', async () => {
  console.log('正在關閉服務器...');
  if (db) await db.end();
  if (redisClient) await redisClient.quit();
  process.exit(0);
});

startServer().catch(console.error); 
// server.js
const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// 用 Render 提供的 DATABASE_URL 建立連線池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// 健康檢查路由：只檢查伺服器是否活著
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'web' });
});

// 資料庫健康檢查路由：實際連 PostgreSQL
app.get('/db-health', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW() AS db_time, current_database() AS db_name');
    const row = result.rows[0];

    res.json({
      status: 'ok',
      db_connected: true,
      db_time: row.db_time,
      db_name: row.db_name,
      message: 'Web Service 成功連到 PostgreSQL',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      db_connected: false,
      message: err.message,
    });
  } finally {
    await client.release();
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
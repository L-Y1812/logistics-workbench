// ============================================================
//  物流应收应付工作台 — 后端服务 v2
//  数据存储：PostgreSQL（Neon 等云数据库）
//  前端通过 REST 接口读写，所有访问者共享同一份实时数据
// ============================================================

const express = require('express');
const path = require('path');
const { Pool } = require('pg');

// 零依赖 .env 自加载：仅在未被外部注入时读取同目录 .env
(function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const fs = require('fs');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
})();

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL || '';

if (!DATABASE_URL) {
  console.error('[启动失败] 未配置 DATABASE_URL 环境变量');
  process.exit(1);
}

// 云数据库（Neon 等）要求 SSL；本地库不需要
const useSsl = !/@(localhost|127\.0\.0\.1)/.test(DATABASE_URL);
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  max: 5,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000
});

pool.on('error', (err) => {
  console.error('[数据库] 空闲连接异常:', err.message);
});

// 合法数据类型（对应前端 4 张表）
const VALID_TYPES = ['ar', 'ap', 'ar-flow', 'ap-flow'];

// ---- 中间件 ----
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..')));

// ---- 工具 ----
function rowToRecord(row) {
  return Object.assign({ record_id: row.record_id }, row.data);
}

// ---- 数据库初始化 ----
async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS records (
      type       TEXT NOT NULL,
      record_id  TEXT NOT NULL,
      data       JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (type, record_id)
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_records_type ON records (type)
  `);
  console.log('[数据库] 表结构已就绪');
}

// ---- API 路由 ----

// 检查数据库连接状态
app.get('/api/status', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, message: '数据库连接正常', authType: 'database' });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// 获取某张表的全部记录（新数据在前）
app.get('/api/:type', async (req, res) => {
  const { type } = req.params;
  if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: '未知数据类型' });
  try {
    const result = await pool.query(
      `SELECT record_id, data FROM records
       WHERE type = $1
       ORDER BY data->>'createdAt' DESC NULLS LAST, updated_at DESC`,
      [type]
    );
    res.json({ ok: true, data: result.rows.map(rowToRecord) });
  } catch (e) {
    console.error(`[GET /api/${type}]`, e.message);
    res.status(500).json({ error: e.message });
  }
});

// 新增记录（record_id 即业务 id，冲突时覆盖）
app.post('/api/:type', async (req, res) => {
  const { type } = req.params;
  if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: '未知数据类型' });
  const body = req.body || {};
  if (!body.id) return res.status(400).json({ error: '缺少记录 id' });
  try {
    const result = await pool.query(
      `INSERT INTO records (type, record_id, data, updated_at)
       VALUES ($1, $2, $3::jsonb, now())
       ON CONFLICT (type, record_id)
       DO UPDATE SET data = EXCLUDED.data, updated_at = now()
       RETURNING record_id, data`,
      [type, String(body.id), JSON.stringify(body)]
    );
    res.json({ ok: true, data: rowToRecord(result.rows[0]) });
  } catch (e) {
    console.error(`[POST /api/${type}]`, e.message);
    res.status(500).json({ error: e.message });
  }
});

// 清空整张表（必须注册在 /:recordId 之前，避免 "all" 被当成 recordId）
app.delete('/api/:type/all', async (req, res) => {
  const { type } = req.params;
  if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: '未知数据类型' });
  try {
    const result = await pool.query('DELETE FROM records WHERE type = $1', [type]);
    res.json({ ok: true, deleted: result.rowCount });
  } catch (e) {
    console.error(`[DELETE /api/${type}/all]`, e.message);
    res.status(500).json({ error: e.message });
  }
});

// 更新记录（部分字段合并，保留未提交的字段）
app.put('/api/:type/:recordId', async (req, res) => {
  const { type, recordId } = req.params;
  if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: '未知数据类型' });
  try {
    const result = await pool.query(
      `UPDATE records
       SET data = data || $3::jsonb, updated_at = now()
       WHERE type = $1 AND record_id = $2
       RETURNING record_id, data`,
      [type, recordId, JSON.stringify(Object.assign({}, req.body, { id: recordId }))]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: '记录不存在' });
    res.json({ ok: true, data: rowToRecord(result.rows[0]) });
  } catch (e) {
    console.error(`[PUT /api/${type}/${recordId}]`, e.message);
    res.status(500).json({ error: e.message });
  }
});

// 删除单条记录
app.delete('/api/:type/:recordId', async (req, res) => {
  const { type, recordId } = req.params;
  if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: '未知数据类型' });
  try {
    const result = await pool.query(
      'DELETE FROM records WHERE type = $1 AND record_id = $2',
      [type, recordId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: '记录不存在' });
    res.json({ ok: true });
  } catch (e) {
    console.error(`[DELETE /api/${type}/${recordId}]`, e.message);
    res.status(500).json({ error: e.message });
  }
});

// 批量新增（冲突时覆盖）
app.post('/api/:type/bulk', async (req, res) => {
  const { type } = req.params;
  if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: '未知数据类型' });
  const records = (req.body && req.body.records) || [];
  const valid = records.filter(r => r && r.id);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const saved = [];
    for (const r of valid) {
      const result = await client.query(
        `INSERT INTO records (type, record_id, data, updated_at)
         VALUES ($1, $2, $3::jsonb, now())
         ON CONFLICT (type, record_id)
         DO UPDATE SET data = EXCLUDED.data, updated_at = now()
         RETURNING record_id, data`,
        [type, String(r.id), JSON.stringify(r)]
      );
      saved.push(rowToRecord(result.rows[0]));
    }
    await client.query('COMMIT');
    res.json({ ok: true, data: saved, count: saved.length });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(`[POST /api/${type}/bulk]`, e.message);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// 批量删除
app.post('/api/:type/bulk-delete', async (req, res) => {
  const { type } = req.params;
  if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: '未知数据类型' });
  const recordIds = ((req.body && req.body.recordIds) || []).map(String);
  if (recordIds.length === 0) return res.json({ ok: true, count: 0 });
  try {
    const result = await pool.query(
      'DELETE FROM records WHERE type = $1 AND record_id = ANY($2::text[])',
      [type, recordIds]
    );
    res.json({ ok: true, count: result.rowCount });
  } catch (e) {
    console.error(`[POST /api/${type}/bulk-delete]`, e.message);
    res.status(500).json({ error: e.message });
  }
});

// ---- 启动服务 ----
ensureSchema()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log('============================================');
      console.log('  物流应收应付工作台服务已启动（数据库模式）');
      console.log(`  地址: http://localhost:${PORT}`);
      console.log('  存储: PostgreSQL');
      console.log('============================================');
    });
  })
  .catch((e) => {
    console.error('[启动失败] 数据库初始化失败:', e.message);
    process.exit(1);
  });

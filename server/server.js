// ============================================================
//  物流应收应付工作台 — 后端服务
//  功能：代理飞书多维表格 API，提供 REST 接口供前端调用
//  数据自动同步到飞书 Base，多人共享实时同步
// ============================================================

const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const { HttpsProxyAgent } = require('https-proxy-agent');

// 零依赖 .env 自加载：仅在未被外部注入时读取同目录 .env
// （Docker 模式由 docker compose 的 env_file 注入，不受影响）
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

// ---- 代理配置（沙箱环境需要） ----
const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy || '';
const proxyAgent = PROXY_URL ? new HttpsProxyAgent(PROXY_URL) : null;
if (proxyAgent) {
  console.log(`[代理] 使用代理: ${PROXY_URL}`);
}

// ---- 飞书配置 ----
const FEISHU_APP_ID = process.env.FEISHU_APP_ID || process.env.LARKSUITE_CLI_APP_ID || '';
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET || '';
const FEISHU_BASE_URL = 'https://open.feishu.cn/open-apis';

// 用户访问令牌（TRAE 环境自动注入，无需 App Secret）
const USER_ACCESS_TOKEN = process.env.LARKSUITE_CLI_USER_ACCESS_TOKEN || '';

// Base Token（多维表格 ID）
const BASE_TOKEN = process.env.FEISHU_BASE_TOKEN || 'JOKzbxJdlaKGz0sUlsnckcb76Fi';

// 数据类型 → 飞书表 ID 映射
const TABLE_MAP = {
  'ar':       'tbl5sMMGRt9x1jlJ',  // 应收账款
  'ap':       'tblHbFh7oNeFgzGy',  // 应付账款
  'ar-flow':  'tblOmM3ZCR19y0ep',  // 客户流水
  'ap-flow':  'tblJvrO0SMjCwMEj'   // 承运商流水
};

// 数据类型 → 字段映射（JS字段名 → 飞书字段名）
const FIELD_MAP = {
  'ar': {
    'id': '记录ID', 'date': '日期', 'waybillNumber': '运单号',
    'customerName': '客户名称', 'origin': '发站', 'destination': '到站',
    'expenseCategory': '费用种类', 'amount': '金额', 'remarks': '备注',
    'createdAt': '创建时间'
  },
  'ap': {
    'id': '记录ID', 'date': '日期', 'waybillNumber': '运单号',
    'supplierName': '承运商名称', 'origin': '发站', 'destination': '到站',
    'expenseCategory': '费用种类', 'amount': '金额', 'remarks': '备注',
    'createdAt': '创建时间'
  },
  'ar-flow': {
    'id': '记录ID', 'date': '日期', 'waybillNumber': '运单号',
    'customerName': '客户名称', 'paymentMethod': '付款方式',
    'amount': '金额', 'remarks': '备注', 'createdAt': '创建时间'
  },
  'ap-flow': {
    'id': '记录ID', 'date': '日期', 'waybillNumber': '运单号',
    'supplierName': '承运商名称', 'paymentMethod': '付款方式',
    'amount': '金额', 'remarks': '备注', 'createdAt': '创建时间'
  }
};

// ---- 飞书 API fetch 封装（自动携带代理） ----
async function feishuFetch(url, options = {}) {
  if (proxyAgent) {
    options.agent = proxyAgent;
  }
  return fetch(url, options);
}

// ---- Token 获取 ----
// 优先使用用户访问令牌（TRAE 环境注入），其次用 App ID/Secret 药取 tenant_access_token
let tokenCache = { token: '', expiresAt: 0 };
async function getAccessToken() {
  // 方式1: 使用环境中的用户访问令牌
  if (USER_ACCESS_TOKEN) {
    return { token: USER_ACCESS_TOKEN, type: 'user' };
  }

  // 方式2: 使用 App ID + App Secret 获取 tenant_access_token
  if (FEISHU_APP_ID && FEISHU_APP_SECRET) {
    const now = Date.now();
    if (tokenCache.token && now < tokenCache.expiresAt - 60000) {
      return { token: tokenCache.token, type: 'tenant' };
    }

    const resp = await feishuFetch(`${FEISHU_BASE_URL}/auth/v3/tenant_access_token/internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: FEISHU_APP_ID,
        app_secret: FEISHU_APP_SECRET
      })
    });
    const data = await resp.json();

    if (data.code !== 0) {
      throw new Error(`获取token失败: ${data.msg}`);
    }

    tokenCache = {
      token: data.tenant_access_token,
      expiresAt: now + (data.expire * 1000)
    };
    console.log('[飞书] Tenant Token 已刷新，有效期', data.expire, '秒');
    return { token: tokenCache.token, type: 'tenant' };
  }

  throw new Error('未配置飞书凭证（需要 USER_ACCESS_TOKEN 或 APP_ID+APP_SECRET）');
}

// ---- 工具函数 ----
function toFeishuFields(type, record) {
  const mapping = FIELD_MAP[type];
  if (!mapping) throw new Error(`未知数据类型: ${type}`);
  const result = {};
  for (const [jsField, feishuField] of Object.entries(mapping)) {
    if (record[jsField] !== undefined && record[jsField] !== null) {
      let val = record[jsField];
      // 金额转为数字
      if (jsField === 'amount') val = Number(val) || 0;
      // 创建时间转为时间戳（毫秒）
      if (jsField === 'createdAt' && typeof val === 'string') {
        const d = new Date(val);
        if (!isNaN(d.getTime())) val = d.getTime();
      }
      result[feishuField] = val;
    }
  }
  return result;
}

function fromFeishuFields(type, fields) {
  const mapping = FIELD_MAP[type];
  if (!mapping) throw new Error(`未知数据类型: ${type}`);
  const result = {};
  for (const [jsField, feishuField] of Object.entries(mapping)) {
    if (fields[feishuField] !== undefined) {
      let val = fields[feishuField];
      // 金额取数字
      if (jsField === 'amount') val = Number(val) || 0;
      // 创建时间从时间戳转回字符串
      if (jsField === 'createdAt' && typeof val === 'number') {
        val = new Date(val).toISOString();
      }
      result[jsField] = val;
    }
  }
  return result;
}

// ---- 中间件 ----
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..')));

// ---- API 路由 ----

// 检查连接状态
app.get('/api/status', async (req, res) => {
  try {
    if (!USER_ACCESS_TOKEN && (!FEISHU_APP_ID || !FEISHU_APP_SECRET)) {
      return res.json({ ok: false, error: '未配置飞书凭证' });
    }
    const { token, type } = await getAccessToken();
    res.json({ ok: true, message: '飞书API连接正常', authType: type });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// 获取所有记录
app.get('/api/:type', async (req, res) => {
  const { type } = req.params;
  if (!TABLE_MAP[type]) return res.status(400).json({ error: '未知数据类型' });

  try {
    const { token } = await getAccessToken();
    const tableId = TABLE_MAP[type];
    let allRecords = [];
    let pageToken = '';
    let hasMore = true;

    while (hasMore) {
      let url = `${FEISHU_BASE_URL}/bitable/v1/apps/${BASE_TOKEN}/tables/${tableId}/records?page_size=500`;
      if (pageToken) url += `&page_token=${pageToken}`;

      const resp = await feishuFetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();

      if (data.code !== 0) throw new Error(data.msg);

      if (data.data.items) {
        allRecords = allRecords.concat(
          data.data.items.map(item => ({
            record_id: item.record_id,
            ...fromFeishuFields(type, item.fields)
          }))
        );
      }
      hasMore = data.data.has_more;
      pageToken = data.data.page_token;
    }

    res.json({ ok: true, data: allRecords });
  } catch (e) {
    console.error(`[GET /api/${type}]`, e.message);
    res.status(500).json({ error: e.message });
  }
});

// 新增记录
app.post('/api/:type', async (req, res) => {
  const { type } = req.params;
  if (!TABLE_MAP[type]) return res.status(400).json({ error: '未知数据类型' });

  try {
    const { token } = await getAccessToken();
    const tableId = TABLE_MAP[type];
    const fields = toFeishuFields(type, req.body);

    const resp = await feishuFetch(
      `${FEISHU_BASE_URL}/bitable/v1/apps/${BASE_TOKEN}/tables/${tableId}/records`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      }
    );
    const data = await resp.json();

    if (data.code !== 0) throw new Error(data.msg);

    const record = {
      record_id: data.data.record.record_id,
      ...fromFeishuFields(type, data.data.record.fields)
    };
    res.json({ ok: true, data: record });
  } catch (e) {
    console.error(`[POST /api/${type}]`, e.message);
    res.status(500).json({ error: e.message });
  }
});

// 更新记录
app.put('/api/:type/:recordId', async (req, res) => {
  const { type, recordId } = req.params;
  if (!TABLE_MAP[type]) return res.status(400).json({ error: '未知数据类型' });

  try {
    const { token } = await getAccessToken();
    const tableId = TABLE_MAP[type];
    const fields = toFeishuFields(type, req.body);

    const resp = await feishuFetch(
      `${FEISHU_BASE_URL}/bitable/v1/apps/${BASE_TOKEN}/tables/${tableId}/records/${recordId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      }
    );
    const data = await resp.json();

    if (data.code !== 0) throw new Error(data.msg);

    const record = {
      record_id: data.data.record.record_id,
      ...fromFeishuFields(type, data.data.record.fields)
    };
    res.json({ ok: true, data: record });
  } catch (e) {
    console.error(`[PUT /api/${type}/${recordId}]`, e.message);
    res.status(500).json({ error: e.message });
  }
});

// 清空整张表（必须注册在 /:recordId 之前，避免 "all" 被当成 recordId）
app.delete('/api/:type/all', async (req, res) => {
  const { type } = req.params;
  if (!TABLE_MAP[type]) return res.status(400).json({ error: '未知数据类型' });

  try {
    const { token } = await getAccessToken();
    const tableId = TABLE_MAP[type];

    // 先分页拉取全部 record_id
    const recordIds = [];
    let pageToken = '';
    let hasMore = true;
    while (hasMore) {
      let url = `${FEISHU_BASE_URL}/bitable/v1/apps/${BASE_TOKEN}/tables/${tableId}/records?page_size=500`;
      if (pageToken) url += `&page_token=${pageToken}`;

      const resp = await feishuFetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      if (data.code !== 0) throw new Error(data.msg);

      if (data.data.items) {
        data.data.items.forEach(item => recordIds.push(item.record_id));
      }
      hasMore = data.data.has_more;
      pageToken = data.data.page_token;
    }

    // 分批删除（每批最多 500 条）
    const batchSize = 500;
    for (let i = 0; i < recordIds.length; i += batchSize) {
      const batch = recordIds.slice(i, i + batchSize);
      const resp = await feishuFetch(
        `${FEISHU_BASE_URL}/bitable/v1/apps/${BASE_TOKEN}/tables/${tableId}/records/batch_delete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ records: batch })
        }
      );
      const data = await resp.json();
      if (data.code !== 0) throw new Error(data.msg);
    }

    res.json({ ok: true, count: recordIds.length });
  } catch (e) {
    console.error(`[DELETE /api/${type}/all]`, e.message);
    res.status(500).json({ error: e.message });
  }
});

// 删除记录
app.delete('/api/:type/:recordId', async (req, res) => {
  const { type, recordId } = req.params;
  if (!TABLE_MAP[type]) return res.status(400).json({ error: '未知数据类型' });

  try {
    const { token } = await getAccessToken();
    const tableId = TABLE_MAP[type];

    const resp = await feishuFetch(
      `${FEISHU_BASE_URL}/bitable/v1/apps/${BASE_TOKEN}/tables/${tableId}/records/${recordId}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const data = await resp.json();

    if (data.code !== 0) throw new Error(data.msg);

    res.json({ ok: true });
  } catch (e) {
    console.error(`[DELETE /api/${type}/${recordId}]`, e.message);
    res.status(500).json({ error: e.message });
  }
});

// 批量新增
app.post('/api/:type/bulk', async (req, res) => {
  const { type } = req.params;
  if (!TABLE_MAP[type]) return res.status(400).json({ error: '未知数据类型' });

  try {
    const { token } = await getAccessToken();
    const tableId = TABLE_MAP[type];
    const records = req.body.records || [];

    // 分批处理（每批最多 500 条）
    const batchSize = 500;
    const results = [];

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const fieldsList = batch.map(r => ({ fields: toFeishuFields(type, r) }));

      const resp = await feishuFetch(
        `${FEISHU_BASE_URL}/bitable/v1/apps/${BASE_TOKEN}/tables/${tableId}/records/batch_create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ records: fieldsList })
        }
      );
      const data = await resp.json();

      if (data.code !== 0) throw new Error(data.msg);

      if (data.data.records) {
        data.data.records.forEach(r => {
          results.push({
            record_id: r.record_id,
            ...fromFeishuFields(type, r.fields)
          });
        });
      }
    }

    res.json({ ok: true, data: results, count: results.length });
  } catch (e) {
    console.error(`[POST /api/${type}/bulk]`, e.message);
    res.status(500).json({ error: e.message });
  }
});

// 批量删除
app.post('/api/:type/bulk-delete', async (req, res) => {
  const { type } = req.params;
  if (!TABLE_MAP[type]) return res.status(400).json({ error: '未知数据类型' });

  try {
    const { token } = await getAccessToken();
    const tableId = TABLE_MAP[type];
    const recordIds = req.body.recordIds || [];

    // 分批处理（每批最多 500 条）
    const batchSize = 500;

    for (let i = 0; i < recordIds.length; i += batchSize) {
      const batch = recordIds.slice(i, i + batchSize);

      const resp = await feishuFetch(
        `${FEISHU_BASE_URL}/bitable/v1/apps/${BASE_TOKEN}/tables/${tableId}/records/batch_delete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ records: batch })
        }
      );
      const data = await resp.json();

      if (data.code !== 0) throw new Error(data.msg);
    }

    res.json({ ok: true, count: recordIds.length });
  } catch (e) {
    console.error(`[POST /api/${type}/bulk-delete]`, e.message);
    res.status(500).json({ error: e.message });
  }
});

// 清空表（读取所有 record_id 后批量删除）
app.delete('/api/:type/all', async (req, res) => {
  const { type } = req.params;
  if (!TABLE_MAP[type]) return res.status(400).json({ error: '未知数据类型' });

  try {
    const { token } = await getAccessToken();
    const tableId = TABLE_MAP[type];
    let allIds = [];
    let pageToken = '';
    let hasMore = true;

    while (hasMore) {
      let url = `${FEISHU_BASE_URL}/bitable/v1/apps/${BASE_TOKEN}/tables/${tableId}/records?page_size=500&field_names=记录ID`;
      if (pageToken) url += `&page_token=${pageToken}`;

      const resp = await feishuFetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();

      if (data.code !== 0) throw new Error(data.msg);

      if (data.data.items) {
        allIds = allIds.concat(data.data.items.map(item => item.record_id));
      }
      hasMore = data.data.has_more;
      pageToken = data.data.page_token;
    }

    // 批量删除
    for (let i = 0; i < allIds.length; i += 500) {
      const batch = allIds.slice(i, i + 500);
      await feishuFetch(
        `${FEISHU_BASE_URL}/bitable/v1/apps/${BASE_TOKEN}/tables/${tableId}/records/batch_delete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ records: batch })
        }
      );
    }

    res.json({ ok: true, deleted: allIds.length });
  } catch (e) {
    console.error(`[DELETE /api/${type}/all]`, e.message);
    res.status(500).json({ error: e.message });
  }
});

// ---- 启动服务 ----
app.listen(PORT, '0.0.0.0', () => {
  const authMode = USER_ACCESS_TOKEN ? '用户令牌' : (FEISHU_APP_SECRET ? '应用凭证' : '未配置');
  console.log('============================================');
  console.log('  物流应收应付工作台服务已启动');
  console.log(`  地址: http://localhost:${PORT}`);
  console.log(`  飞书Base: ${BASE_TOKEN}`);
  console.log(`  认证方式: ${authMode}`);
  console.log(`  API状态: ${authMode === '未配置' ? '未配置凭证' : '已就绪'}`);
  console.log('============================================');
});

/* ============================================================
   Logistics AR/AP Workbench — Application Logic
   ============================================================ */

/* ===== Configuration ===== */

const CITIES = ['\u4E0A\u6D77','\u5317\u4EAC','\u5E7F\u5DDE','\u6DF1\u5733','\u6210\u90FD','\u6B66\u6C49','\u5357\u4EAC','\u676D\u5DDE','\u9752\u5C9B','\u897F\u5B89','\u91CD\u5E86','\u5929\u6D25','\u5B81\u6CE2','\u82CF\u5DDE','\u90D1\u5DDE','\u957F\u6C99','\u6C88\u9633','\u6D4E\u5357','\u5408\u80A5','\u798F\u5DDE'];

const CATEGORIES = [
  '\u516C\u8DEF\u8FD0\u8D39', '\u96F6\u62C5\u8FD0\u8F93\u8D39', '\u6574\u8F66\u8FD0\u8F93\u8D39', '\u5FEB\u9012\u914D\u9001\u8D39', '\u94C1\u8DEF\u8FD0\u8D39',
  '\u4ED3\u50A8\u8D39', '\u88C5\u5378\u8D39', '\u5206\u62E3\u5305\u88C5\u8D39', '\u62A5\u5173\u8D39', '\u7A0E\u91D1',
  '\u4FDD\u9669\u8D39', '\u71C3\u6CB9\u9644\u52A0\u8D39', '\u8FC7\u8DEF\u8FC7\u6865\u8D39', '\u6587\u4EF6\u8D39', '\u5176\u4ED6'
];

const PAYMENT_METHODS = [
  '\u5BF9\u516C\u8F6C\u8D26', '\u94F6\u884C\u7535\u6C47', '\u5FAE\u4FE1\u652F\u4ED8', '\u652F\u4ED8\u5B9D',
  '\u6708\u7ED3(Net30)', '\u6708\u7ED3(Net45)', '\u6708\u7ED3(Net60)', '\u9884\u4ED8\u6B3E',
  '\u94F6\u884C\u627F\u5151\u6C47\u7968', '\u5546\u4E1A\u627F\u5151\u6C47\u7968', '\u73B0\u91D1'
];

const CHART_COLORS = ['#0969DA', '#8250DF', '#06B6D4', '#BF3989', '#FAAD14', '#16A34A', '#FF7A45', '#64748B'];

const VERIFICATION_STATUSES = ['\u672A\u6838\u9500', '\u5DF2\u6838\u9500', '\u90E8\u5206\u6838\u9500'];

function normalizeVerificationStatus(raw) {
  if (!raw) return '\u672A\u6838\u9500';
  const s = String(raw).trim();
  const lower = s.toLowerCase();
  if (s.includes('\u5DF2\u6838') || s.includes('\u5168\u6838') || lower === 'verified' || lower === 'paid' || s === '\u5DF2\u4ED8') return '\u5DF2\u6838\u9500';
  if (s.includes('\u90E8\u5206') || lower === 'partial' || s === '\u90E8\u5206\u4ED8') return '\u90E8\u5206\u6838\u9500';
  if (s.includes('\u672A') || lower === 'unpaid' || lower === 'pending' || s === '\u672A\u4ED8') return '\u672A\u6838\u9500';
  if (VERIFICATION_STATUSES.includes(s)) return s;
  return '\u672A\u6838\u9500';
}

const MODULES = {
  ar: {
    title: '\u5E94\u6536\u8D26\u6B3E', reportTitle: '\u5E94\u6536\u62A5\u8868',
    entityLabel: '\u5BA2\u6237', entityField: 'customerName',
    storageKey: 'lm_ar_data', type: 'ar', icon: '\u25B2'
  },
  ap: {
    title: '\u5E94\u4ED8\u8D26\u6B3E', reportTitle: '\u5E94\u4ED8\u62A5\u8868',
    entityLabel: '\u627F\u8FD0\u5546', entityField: 'supplierName',
    storageKey: 'lm_ap_data', type: 'ap', icon: '\u25BC'
  },
  'ar-flow': {
    title: '\u5BA2\u6237\u6D41\u6C34',
    entityLabel: '\u5BA2\u6237', entityField: 'customerName',
    storageKey: 'lm_ar_flow_data', type: 'ar-flow', icon: '\u25C8'
  },
  'ap-flow': {
    title: '\u627F\u8FD0\u5546\u6D41\u6C34',
    entityLabel: '\u627F\u8FD0\u5546', entityField: 'supplierName',
    storageKey: 'lm_ap_flow_data', type: 'ap-flow', icon: '\u25C8'
  }
};

const SAMPLE_CUSTOMERS = [
  '\u4E0A\u6D77\u8FDC\u6210\u7269\u6D41\u6709\u9650\u516C\u53F8', '\u6DF1\u5733\u987A\u4E30\u901F\u8FD0\u96C6\u56E2', '\u5317\u4EAC\u534E\u8D38\u7269\u6D41\u80A1\u4EFD',
  '\u5E7F\u5DDE\u5FB7\u90A6\u5FEB\u9012', '\u676D\u5DDE\u83DC\u9E1F\u7F51\u7EDC\u79D1\u6280', '\u4E0A\u6D77\u4E2D\u901A\u5FEB\u8FD0',
  '\u6210\u90FD\u4EAC\u4E1C\u7269\u6D41', '\u6B66\u6C49\u5929\u5730\u534E\u5B87\u7269\u6D41', '\u5357\u4EAC\u5B89\u80FD\u7269\u6D41', '\u82CF\u5DDE\u4F73\u5409\u5FEB\u8FD0',
  '\u5B81\u6CE2\u5706\u901A\u901F\u9012', '\u9752\u5C9B\u767E\u4E16\u7269\u6D41', '\u5929\u6D25\u7533\u901A\u5FEB\u9012', '\u91CD\u5E86\u97F5\u8FBE\u5FEB\u8FD0', '\u897F\u5B89\u4E2D\u94C1\u7269\u6D41'
];

const SAMPLE_SUPPLIERS = [
  '\u4E0A\u6D77\u6377\u8FD0\u8FD0\u8F93\u8F66\u961F', '\u6DF1\u5733\u9E4F\u7A0B\u7269\u6D41\u6709\u9650\u516C\u53F8', '\u5E7F\u5DDE\u987A\u8FBE\u8D27\u8FD0\u516C\u53F8',
  '\u5317\u4EAC\u534E\u901A\u62A5\u5173\u884C', '\u4E0A\u6D77\u4E34\u6E2F\u4ED3\u50A8\u4E2D\u5FC3', '\u6210\u90FD\u5DDD\u6E1D\u8FD0\u8F93\u961F',
  '\u6B66\u6C49\u957F\u6C5F\u7269\u6D41\u8F66\u961F', '\u676D\u5DDE\u6D59\u5317\u5FEB\u8FD0', '\u5357\u4EAC\u5B81\u82CF\u8FD0\u8F93\u516C\u53F8',
  '\u9752\u5C9B\u6E2F\u6377\u62A5\u5173\u884C', '\u897F\u5B89\u897F\u5317\u8D27\u8FD0', '\u91CD\u5E86\u5C71\u57CE\u4ED3\u50A8',
  '\u5929\u6D25\u6EE8\u6D77\u8FD0\u8F93\u961F', '\u5B81\u6CE2\u752C\u57CE\u5FEB\u8FD0', '\u82CF\u5DDE\u82CF\u9521\u5E38\u914D\u9001'
];

/* ===== State ===== */

const listState = {
  ar: { page: 1, pageSize: 20, search: '', month: '', category: '', verificationStatus: '', selectedIds: new Set() },
  ap: { page: 1, pageSize: 20, search: '', month: '', category: '', verificationStatus: '', selectedIds: new Set() },
  'ar-flow': { page: 1, pageSize: 20, search: '', month: '', payment: '', selectedIds: new Set() },
  'ap-flow': { page: 1, pageSize: 20, search: '', month: '', payment: '', selectedIds: new Set() }
};

const reportState = {
  ar: { month: '', entity: '', payStatus: '' },
  ap: { month: '', entity: '' },
  waybill: { page: 1, pageSize: 20, search: '', month: '', profitFilter: '', route: '', sortField: 'date', sortDir: 'desc', colFilters: {}, activeFilterCol: '' }
};

/* ===== Utilities ===== */

const Util = {
  fmt(n) {
    if (n == null || isNaN(n)) return '\u00A50.00';
    return '\u00A5' + Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },
  fmtNum(n) {
    if (n == null || isNaN(n)) return '0';
    return Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },
  fmtDate(d) {
    if (!d) return '';
    return d;
  },
  monthKey(d) {
    return d ? d.substring(0, 7) : '';
  },
  monthLabel(k) {
    if (!k) return '';
    const [y, m] = k.split('-');
    return y + '\u5E74' + parseInt(m) + '\u6708';
  },
  todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },
  currentMonth() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  },
  daysSince(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    return Math.floor((now - d) / 86400000);
  },
  esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },
  uid(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
  },
  debounce(fn, ms) {
    let t;
    return function() {
      clearTimeout(t);
      const args = arguments;
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }
};

/* ===== Encoding Detection ===== */

function decodeFileText(buf) {
  if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    return new TextDecoder('utf-8').decode(buf.slice(3));
  }
  if (buf.length >= 2 && buf[0] === 0xFF && buf[1] === 0xFE) {
    return new TextDecoder('utf-16le').decode(buf.slice(2));
  }
  if (buf.length >= 2 && buf[0] === 0xFE && buf[1] === 0xFF) {
    return new TextDecoder('utf-16be').decode(buf.slice(2));
  }
  const utf8Text = new TextDecoder('utf-8', { fatal: false }).decode(buf);
  if (!/\uFFFD/.test(utf8Text) && /[\u4e00-\u9fff]/.test(utf8Text)) {
    return utf8Text;
  }
  try {
    const gbkText = new TextDecoder('gbk', { fatal: false }).decode(buf);
    if (/[\u4e00-\u9fff]/.test(gbkText) && !/\uFFFD/.test(gbkText)) {
      return gbkText;
    }
    return gbkText;
  } catch(e) {
    return utf8Text;
  }
}

function verificationBadge(status) {
  const s = status || '\u672A\u6838\u9500';
  const cls = s === '\u5DF2\u6838\u9500' ? 'tag--success' : s === '\u90E8\u5206\u6838\u9500' ? 'tag--warning' : 'tag--neutral';
  return `<span class="tag ${cls}">${s}</span>`;
}

/* ===== CSV ===== */

function detectDelimiter(line) {
  const counts = { ',': 0, ';': 0, '\t': 0, '|': 0 };
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; continue; }
    if (!inQ && counts[c] !== undefined) counts[c]++;
  }
  let best = ',', max = counts[','];
  for (const d of [';', '\t', '|']) {
    if (counts[d] > max) { max = counts[d]; best = d; }
  }
  return best;
}

function parseCSVLine(line, delim) {
  if (!delim) delim = ',';
  const result = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === delim && !inQ) {
      result.push(cur); cur = '';
    } else cur += c;
    }
  result.push(cur);
  return result;
}

function parseCSV(text) {
  text = text.replace(/^\uFEFF/, '');
  text = text.replace(/^[\uFFFE\uFEFF]/, '');
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const delim = detectDelimiter(lines[0]);
  const headers = parseCSVLine(lines[0], delim).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i], delim);
    const row = {};
    headers.forEach((h, j) => { row[h] = (vals[j] || '').trim(); });
    rows.push(row);
  }
  return rows;
}

const HEADER_MAP = {
  '\u65E5\u671F': 'date', 'date': 'date', '\u65F6\u95F4': 'date', 'time': 'date',
  '\u8FD0\u5355\u53F7': 'waybillNumber', 'waybill': 'waybillNumber', '\u8FD0\u5355\u7F16\u53F7': 'waybillNumber', '\u7F51\u5355\u53F7': 'waybillNumber', 'order': 'waybillNumber', 'orderNo': 'waybillNumber', '\u8BA2\u5355\u53F7': 'waybillNumber', '\u5355\u53F7': 'waybillNumber',
  '\u5BA2\u6237\u540D\u79F0': 'entityName', 'customer': 'entityName', '\u5BA2\u6237': 'entityName', '\u5BA2\u6237\u540D': 'entityName', 'client': 'entityName', '\u53D1\u8D27\u4EBA': 'entityName', '\u59D3\u540D': 'entityName',
  '\u627F\u8FD0\u5546\u540D\u79F0': 'entityName', 'supplier': 'entityName', '\u627F\u8FD0\u5546': 'entityName', '\u4F9B\u5E94\u5546': 'entityName', '\u8F66\u961F': 'entityName', '\u627F\u8FD0\u65B9': 'entityName', '\u8F66\u4E3B': 'entityName',
  '\u53D1\u7AD9': 'origin', 'origin': 'origin', '\u53D1\u8D27\u5730': 'origin', '\u59CB\u53D1\u7AD9': 'origin', '\u51FA\u53D1\u5730': 'origin', 'from': 'origin', '\u8D77\u70B9': 'origin',
  '\u5230\u7AD9': 'destination', 'destination': 'destination', '\u76EE\u7684\u5730': 'destination', '\u7EC8\u70B9': 'destination', '\u5230\u8FBE\u7AD9': 'destination', 'to': 'destination', '\u7EC8\u70B9\u7AD9': 'destination', '\u5230\u8FBE\u5730': 'destination',
  '\u8D39\u7528\u79CD\u7C7B': 'expenseCategory', 'category': 'expenseCategory', '\u8D39\u7528\u7C7B\u578B': 'expenseCategory', '\u8D39\u7528\u7C7B': 'expenseCategory', '\u8D39\u7528\u7C7B\u578B(\u53EF\u9009)': 'expenseCategory', '\u8D39\u7528\u540D\u79F0': 'expenseCategory', '\u8D39\u7528\u9879\u76EE': 'expenseCategory', '\u8D39\u7528\u660E\u7EC6': 'expenseCategory', '\u8D39\u7528': 'expenseCategory', '\u8D39\u7528\u540D': 'expenseCategory', '\u8D39\u7528\u9879': 'expenseCategory',
  '\u91D1\u989D': 'amount', 'amount': 'amount', '\u4ED8\u6B3E\u91D1\u989D': 'amount', '\u8D39\u7528\u91D1\u989D': 'amount', '\u4EF7\u683C': 'amount', 'price': 'amount', 'money': 'amount',
  '\u4ED8\u6B3E\u65B9\u5F0F': 'paymentMethod', 'payment': 'paymentMethod', '\u7ED3\u7B97\u65B9\u5F0F': 'paymentMethod', '\u652F\u4ED8\u65B9\u5F0F': 'paymentMethod',
  '\u6838\u9500\u72B6\u6001': 'verificationStatus', '\u6838\u9500': 'verificationStatus', 'status': 'verificationStatus', '\u72B6\u6001': 'verificationStatus', '\u5BA1\u6838\u72B6\u6001': 'verificationStatus', '\u5BF9\u8D26\u72B6\u6001': 'verificationStatus',
  '\u5907\u6CE8': 'remarks', 'remark': 'remarks', 'note': 'remarks', '\u5907\u6CE8\u4FE1\u606F': 'remarks', '\u8BF4\u660E': 'remarks'
};

function mapImportRow(row, type) {
  const mapped = {};
  const keys = Object.keys(row);
  let matched = 0;
  for (const key of keys) {
    const field = HEADER_MAP[key] || HEADER_MAP[key.toLowerCase()];
    if (field) { mapped[field] = row[key]; matched++; }
  }
  if (matched === 0 && keys.length >= 4) {
    keys.forEach((k, i) => {
      const col = IMPORT_COLS[type];
      if (col && col[i]) mapped[col[i]] = row[k];
    });
  }
  return {
    date: mapped.date || '',
    waybillNumber: mapped.waybillNumber || '',
    [MODULES[type].entityField]: mapped.entityName || '',
    origin: mapped.origin || '',
    destination: mapped.destination || '',
    expenseCategory: mapped.expenseCategory || (type === 'ar' ? '\u5176\u4ED6' : ''),
    amount: parseFloat(String(mapped.amount || '0').replace(/[,\u00A5\s]/g, '')) || 0,
    remarks: mapped.remarks || ''
  };
}

function mapFlowImportRow(row, type) {
  const mapped = {};
  const keys = Object.keys(row);
  let matched = 0;
  for (const key of keys) {
    const field = HEADER_MAP[key] || HEADER_MAP[key.toLowerCase()];
    if (field) { mapped[field] = row[key]; matched++; }
  }
  if (matched === 0 && keys.length >= 3) {
    const cols = type === 'ar-flow'
      ? ['date', 'waybillNumber', 'entityName', 'paymentMethod', 'amount', 'remarks']
      : ['date', 'waybillNumber', 'entityName', 'paymentMethod', 'amount', 'remarks'];
    keys.forEach((k, i) => {
      if (cols[i]) mapped[cols[i]] = row[k];
    });
  }
  return {
    date: mapped.date || '',
    waybillNumber: mapped.waybillNumber || '',
    [MODULES[type].entityField]: mapped.entityName || '',
    paymentMethod: mapped.paymentMethod || '',
    amount: parseFloat(String(mapped.amount || '0').replace(/[,\u00A5\s]/g, '')) || 0,
    remarks: mapped.remarks || ''
  };
}

const IMPORT_COLS = {
  ar: ['date', 'waybillNumber', 'entityName', 'origin', 'destination', 'expenseCategory', 'amount', 'remarks'],
  ap: ['date', 'waybillNumber', 'entityName', 'origin', 'destination', 'expenseCategory', 'amount', 'remarks']
};

/* ===== API Sync Module (飞书Base远程同步) ===== */

const ApiSync = {
  enabled: false,
  loading: false,
  recordIdMap: {},  // type -> { id: record_id }

  // 统一处理响应：非 2xx 或业务 ok=false 时抛错，避免静默失败
  async _handle(resp, action) {
    let data = null;
    try { data = await resp.json(); } catch (e) { /* 忽略 JSON 解析失败 */ }
    if (!resp.ok || (data && data.ok === false)) {
      const msg = (data && (data.error || data.message)) || ('HTTP ' + resp.status);
      throw new Error(action + '失败: ' + msg);
    }
    return data || {};
  },

  async checkStatus() {
    try {
      const resp = await fetch('/api/status');
      const data = await resp.json();
      this.enabled = data.ok;
      return data.ok;
    } catch (e) {
      this.enabled = false;
      return false;
    }
  },

  async loadAll() {
    const types = ['ar', 'ap', 'ar-flow', 'ap-flow'];
    const result = {};
    for (const type of types) {
      try {
        const resp = await fetch(`/api/${type}`);
        const data = await this._handle(resp, `加载${type}`);
        if (data.data) {
          this.recordIdMap[type] = {};
          result[type] = data.data.map(r => {
            if (r.record_id) {
              this.recordIdMap[type][r.id] = r.record_id;
              delete r.record_id;
            }
            return r;
          });
        }
      } catch (e) {
        console.error(`[API] 加载${type}失败:`, e);
      }
    }
    return result;
  },

  async create(type, record) {
    const resp = await fetch(`/api/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    const data = await this._handle(resp, '新增');
    if (data.data && data.data.record_id) {
      this.recordIdMap[type] = this.recordIdMap[type] || {};
      this.recordIdMap[type][record.id] = data.data.record_id;
    }
  },

  async update(type, id, updates) {
    const rid = (this.recordIdMap[type] || {})[id] || id;
    const resp = await fetch(`/api/${type}/${rid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    await this._handle(resp, '更新');
  },

  async delete(type, id) {
    const rid = (this.recordIdMap[type] || {})[id] || id;
    const resp = await fetch(`/api/${type}/${rid}`, { method: 'DELETE' });
    await this._handle(resp, '删除');
  },

  async bulkAdd(type, records) {
    const resp = await fetch(`/api/${type}/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records })
    });
    const data = await this._handle(resp, '批量新增');
    if (data.data) {
      this.recordIdMap[type] = this.recordIdMap[type] || {};
      data.data.forEach((r, i) => {
        if (r.record_id && records[i]) {
          this.recordIdMap[type][records[i].id] = r.record_id;
        }
      });
    }
  },

  async bulkDelete(type, ids) {
    const map = this.recordIdMap[type] || {};
    const rids = ids.map(id => map[id] || id);
    if (rids.length === 0) return;
    const resp = await fetch(`/api/${type}/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordIds: rids })
    });
    await this._handle(resp, '批量删除');
  },

  async clear(type) {
    const resp = await fetch(`/api/${type}/all`, { method: 'DELETE' });
    await this._handle(resp, '清空');
  }
};

/* ===== Data Store ===== */

const Store = {
  _cache: {},

  init() {
    let ar = this._load('ar');
    let ap = this._load('ap');
    let arf = this._load('ar-flow');
    let apf = this._load('ap-flow');

    let dirty = false;

    if (ar && ar.length) {
      const before = JSON.stringify(ar);
      ar = ar.map(r => this._migrate(r));
      if (JSON.stringify(ar) !== before) dirty = true;
    }
    if (ap && ap.length) {
      const before = JSON.stringify(ap);
      ap = ap.map(r => this._migrate(r));
      if (JSON.stringify(ap) !== before) dirty = true;
    }

    if (dirty) {
      this._save('ar', ar || []);
      this._save('ap', ap || []);
      this._save('ar-flow', arf || []);
      this._save('ap-flow', apf || []);
    }

    // 先确认后端状态：云端数据库是数据的唯一权威来源
    // 在线时以云端数据为准（空库即空表），仅离线首次使用时生成本地示例数据
    ApiSync.checkStatus().then(ok => {
      if (!ok) {
        console.log('[同步] 数据库未连接，使用本地数据');
        this._updateSyncBadge('offline');
        this._seedLocalIfFirstRun();
        return;
      }
      console.log('[同步] 数据库已连接，正在加载云端数据...');
      this._updateSyncBadge('syncing');
      ApiSync.loadAll().then(data => {
        for (const type of ['ar', 'ap', 'ar-flow', 'ap-flow']) {
          if (Array.isArray(data[type])) {
            this._save(type, data[type]);
          }
        }
        if (typeof App !== 'undefined' && App.renderCurrentPage) {
          App.renderCurrentPage();
        }
        this._updateSyncBadge('online');
        console.log('[同步] 云端数据加载完成');
      }).catch(e => {
        console.error('[同步] 加载云端数据失败:', e);
        this._updateSyncBadge('error');
      });
    });
  },

  _seedLocalIfFirstRun() {
    const initFlag = localStorage.getItem('lm_initialized');
    if (initFlag === '1') return;
    if (this._load('ar').length === 0) this._save('ar', this._generate('ar'));
    if (this._load('ap').length === 0) this._save('ap', this._generate('ap'));
    if (this._load('ar-flow').length === 0) this._save('ar-flow', this._generate('ar-flow'));
    if (this._load('ap-flow').length === 0) this._save('ap-flow', this._generate('ap-flow'));
    localStorage.setItem('lm_initialized', '1');
    if (typeof App !== 'undefined' && App.renderCurrentPage) App.renderCurrentPage();
  },

  _updateSyncBadge(status) {
    const badge = document.getElementById('syncBadge');
    if (!badge) return;
    const map = {
      'online':  { text: '已同步', cls: 'sync-badge--online' },
      'offline': { text: '本地模式', cls: 'sync-badge--offline' },
      'syncing': { text: '同步中...', cls: 'sync-badge--syncing' },
      'error':   { text: '同步失败', cls: 'sync-badge--error' }
    };
    const m = map[status] || map['offline'];
    badge.textContent = m.text;
    badge.className = 'sync-badge ' + m.cls;
  },

  _migrate(r) {
    const cleaned = Object.assign({}, r);
    delete cleaned.paymentMethod;
    delete cleaned.verifiedAmount;
    delete cleaned.payments;
    if (!('origin' in cleaned) || cleaned.origin == null) cleaned.origin = '';
    if (!('destination' in cleaned) || cleaned.destination == null) cleaned.destination = '';
    if (!('expenseCategory' in cleaned) || !cleaned.expenseCategory) cleaned.expenseCategory = '\u5176\u4ED6';
    return cleaned;
  },

  _load(type) {
    if (this._cache[type]) return [...this._cache[type]];
    try {
      const data = JSON.parse(localStorage.getItem(MODULES[type].storageKey) || '[]');
      this._cache[type] = data;
      return [...data];
    } catch(e) { return []; }
  },
  _save(type, data) {
    localStorage.setItem(MODULES[type].storageKey, JSON.stringify(data));
    this._cache[type] = data;
  },
  get(type) { return this._load(type); },
  getById(type, id) {
    return this._load(type).find(r => r.id === id);
  },
  // Cloud write failure: log + red badge instead of silent fake success
  _syncFail(e) {
    console.error('[API] write failed:', e);
    this._updateSyncBadge('error');
  },

  add(type, record) {
    const data = this._load(type);
    record.id = Util.uid(type.toUpperCase().replace('-', ''));
    record.createdAt = new Date().toISOString();
    data.unshift(record);
    this._save(type, data);
    if (ApiSync.enabled) ApiSync.create(type, record).catch(e => this._syncFail(e));
    return record;
  },
  update(type, id, updates) {
    const data = this._load(type);
    const idx = data.findIndex(r => r.id === id);
    if (idx >= 0) {
      Object.assign(data[idx], updates);
      this._save(type, data);
      if (ApiSync.enabled) ApiSync.update(type, id, updates).catch(e => this._syncFail(e));
    }
  },
  delete(type, id) {
    const data = this._load(type).filter(r => r.id !== id);
    this._save(type, data);
    if (ApiSync.enabled) ApiSync.delete(type, id).catch(e => this._syncFail(e));
  },
  bulkDelete(type, ids) {
    const idSet = new Set(ids);
    const data = this._load(type).filter(r => !idSet.has(r.id));
    this._save(type, data);
    if (ApiSync.enabled) ApiSync.bulkDelete(type, ids).catch(e => this._syncFail(e));
  },
  bulkAdd(type, records) {
    const data = this._load(type);
    records.forEach(r => {
      r.id = Util.uid(type.toUpperCase().replace('-', ''));
      r.createdAt = new Date().toISOString();
      data.unshift(r);
    });
    this._save(type, data);
    if (ApiSync.enabled) ApiSync.bulkAdd(type, records).catch(e => this._syncFail(e));
    return records.length;
  },
  clear(type) {
    this._save(type, []);
    if (ApiSync.enabled) ApiSync.clear(type).catch(e => this._syncFail(e));
  },
  reset() {
    this._save('ar', this._generate('ar'));
    this._save('ap', this._generate('ap'));
    this._save('ar-flow', this._generate('ar-flow'));
    this._save('ap-flow', this._generate('ap-flow'));
  },
  _generate(type) {
    if (type === 'ar-flow' || type === 'ap-flow') return this._generateFlow(type);
    const entities = type === 'ar' ? SAMPLE_CUSTOMERS : SAMPLE_SUPPLIERS;
    const prefix = type === 'ar' ? 'AR' : 'AP';
    const records = [];
    const now = new Date();

    const catWeights = [
      { cat: '\u516C\u8DEF\u8FD0\u8D39', weight: 25, minAmt: 2000, maxAmt: 35000 },
      { cat: '\u96F6\u62C5\u8FD0\u8F93\u8D39', weight: 18, minAmt: 500, maxAmt: 15000 },
      { cat: '\u6574\u8F66\u8FD0\u8F93\u8D39', weight: 15, minAmt: 5000, maxAmt: 50000 },
      { cat: '\u5FEB\u9012\u914D\u9001\u8D39', weight: 10, minAmt: 50, maxAmt: 2000 },
      { cat: '\u94C1\u8DEF\u8FD0\u8D39', weight: 8, minAmt: 3000, maxAmt: 40000 },
      { cat: '\u4ED3\u50A8\u8D39', weight: 7, minAmt: 800, maxAmt: 20000 },
      { cat: '\u88C5\u5378\u8D39', weight: 5, minAmt: 200, maxAmt: 5000 },
      { cat: '\u5206\u62E3\u5305\u88C5\u8D39', weight: 4, minAmt: 100, maxAmt: 3000 },
      { cat: '\u71C3\u6CB9\u9644\u52A0\u8D39', weight: 3, minAmt: 100, maxAmt: 3000 },
      { cat: '\u8FC7\u8DEF\u8FC7\u6865\u8D39', weight: 2, minAmt: 50, maxAmt: 2000 },
      { cat: '\u4FDD\u9669\u8D39', weight: 1, minAmt: 50, maxAmt: 2000 },
      { cat: '\u6587\u4EF6\u8D39', weight: 1, minAmt: 30, maxAmt: 500 },
      { cat: '\u62A5\u5173\u8D39', weight: 1, minAmt: 200, maxAmt: 5000 },
      { cat: '\u7A0E\u91D1', weight: 0.5, minAmt: 500, maxAmt: 20000 },
      { cat: '\u5176\u4ED6', weight: 0.5, minAmt: 50, maxAmt: 3000 }
    ];
    const totalWeight = catWeights.reduce((s, c) => s + c.weight, 0);

    function randomCategory() {
      let r = Math.random() * totalWeight;
      for (const c of catWeights) {
        r -= c.weight;
        if (r <= 0) return c;
      }
      return catWeights[0];
    }

    function randomCity() {
      return CITIES[Math.floor(Math.random() * CITIES.length)];
    }

    for (let i = 0; i < 250; i++) {
      const daysAgo = Math.floor(Math.random() * 170);
      const d = new Date(now); d.setDate(d.getDate() - daysAgo);
      const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const entity = entities[Math.floor(Math.random() * entities.length)];
      const catInfo = randomCategory();
      const amount = Math.round((catInfo.minAmt + Math.random() * (catInfo.maxAmt - catInfo.minAmt)) * 100) / 100;
      let origin = randomCity();
      let destination = randomCity();
      while (destination === origin) destination = randomCity();
      records.push({
        id: prefix + '-' + String(i + 1).padStart(5, '0'),
        date: dateStr,
        waybillNumber: 'WB' + dateStr.replace(/-/g, '') + String(i + 1).padStart(3, '0'),
        [MODULES[type].entityField]: entity,
        origin: origin,
        destination: destination,
        expenseCategory: catInfo.cat,
        amount: amount,
        remarks: '',
        createdAt: d.toISOString()
      });
    }
    return records;
  },

  _generateFlow(type) {
    const entities = type === 'ar-flow' ? SAMPLE_CUSTOMERS : SAMPLE_SUPPLIERS;
    const field = MODULES[type].entityField;
    const prefix = type === 'ar-flow' ? 'ARF' : 'APF';
    const records = [];
    const now = new Date();

    const pmWeights = [
      { pm: '\u6708\u7ED3(Net30)', weight: 25 },
      { pm: '\u6708\u7ED3(Net45)', weight: 15 },
      { pm: '\u5BF9\u516C\u8F6C\u8D26', weight: 20 },
      { pm: '\u94F6\u884C\u7535\u6C47', weight: 15 },
      { pm: '\u6708\u7ED3(Net60)', weight: 8 },
      { pm: '\u9884\u4ED8\u6B3E', weight: 5 },
      { pm: '\u94F6\u884C\u627F\u5151\u6C47\u7968', weight: 5 },
      { pm: '\u5546\u4E1A\u627F\u5151\u6C47\u7968', weight: 3 },
      { pm: '\u5FAE\u4FE1\u652F\u4ED8', weight: 2 },
      { pm: '\u652F\u4ED8\u5B9D', weight: 1 },
      { pm: '\u73B0\u91D1', weight: 1 }
    ];
    const pmTotal = pmWeights.reduce((s, p) => s + p.weight, 0);
    function randomPayment() {
      let r = Math.random() * pmTotal;
      for (const p of pmWeights) { r -= p.weight; if (r <= 0) return p.pm; }
      return pmWeights[0].pm;
    }

    for (let i = 0; i < 150; i++) {
      const daysAgo = Math.floor(Math.random() * 170);
      const d = new Date(now); d.setDate(d.getDate() - daysAgo);
      const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const entity = entities[Math.floor(Math.random() * entities.length)];
      const pm = randomPayment();
      const amount = Math.round((1000 + Math.random() * 40000) * 100) / 100;
      records.push({
        id: prefix + '-' + String(i + 1).padStart(5, '0'),
        date: dateStr,
        waybillNumber: '',
        [field]: entity,
        paymentMethod: pm,
        amount: amount,
        remarks: '',
        createdAt: d.toISOString()
      });
    }
    return records;
  }
};

/* ===== Modal & Toast ===== */

const Modal = {
  open(html) {
    document.getElementById('modalBox').innerHTML = html;
    document.getElementById('modalOverlay').classList.add('open');
  },
  close() {
    document.getElementById('modalOverlay').classList.remove('open');
  }
};

function showToast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast' + (type ? ' toast--' + type : '');
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => el.classList.remove('show'), 3000);
}

document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === this) Modal.close();
});

/* ===== Chart Manager ===== */

const ChartMgr = {
  _instances: {},
  render(id, option) {
    const el = document.getElementById(id);
    if (!el || typeof echarts === 'undefined') return;
    let chart = this._instances[id];
    if (chart) chart.dispose();
    chart = echarts.init(el, null, { renderer: 'svg' });
    chart.setOption(option);
    this._instances[id] = chart;
  },
  resizeAll() {
    Object.values(this._instances).forEach(c => { if (c && !c.isDisposed()) c.resize(); });
  },
  disposePage(prefix) {
    Object.keys(this._instances).forEach(id => {
      if (id.startsWith(prefix)) {
        this._instances[id].dispose();
        delete this._instances[id];
      }
    });
  }
};

window.addEventListener('resize', Util.debounce(() => ChartMgr.resizeAll(), 200));

/* ===== Aggregation Helpers ===== */

function getFlowTotal(type, entityName) {
  if (!entityName) return 0;
  const field = MODULES[type].entityField;
  return Store.get(type)
    .filter(r => r[field] === entityName)
    .reduce((s, r) => s + (r.amount || 0), 0);
}

function buildFlowMaps() {
  const arFlowMap = {};
  Store.get('ar-flow').forEach(r => { arFlowMap[r.customerName] = (arFlowMap[r.customerName] || 0) + (r.amount || 0); });
  const apFlowMap = {};
  Store.get('ap-flow').forEach(r => { apFlowMap[r.supplierName] = (apFlowMap[r.supplierName] || 0) + (r.amount || 0); });
  return { arFlowMap, apFlowMap };
}

/* Build map: waybillNumber -> total flow amount, keyed by flow type */
function buildWaybillFlowMap(flowType) {
  const map = {};
  Store.get(flowType).forEach(r => {
    const wb = r.waybillNumber;
    if (wb) map[wb] = (map[wb] || 0) + (r.amount || 0);
  });
  return map;
}

/* Calculate verification status for a single AR/AP record based on flow totals for its waybill */
function calcVerificationStatus(record, flowType) {
  const wb = record.waybillNumber;
  if (!wb) return '\u672A\u6838\u9500';
  const flowMap = buildWaybillFlowMap(flowType);
  const flowAmount = flowMap[wb] || 0;
  const arAmount = record.amount || 0;
  if (flowAmount >= arAmount && arAmount > 0) return '\u5DF2\u6838\u9500';
  if (flowAmount > 0) return '\u90E8\u5206\u6838\u9500';
  return '\u672A\u6838\u9500';
}

function calcSummary(records) {
  const total = records.reduce((s, r) => s + (r.amount || 0), 0);
  return { total, count: records.length };
}

function getMonthList(records) {
  const set = new Set(records.map(r => Util.monthKey(r.date)));
  return [...set].sort().reverse();
}

function getEntityList(records, field) {
  const set = new Set(records.map(r => r[field]).filter(Boolean));
  return [...set].sort();
}

function getFlowEntityList(type) {
  const sourceType = type === 'ar-flow' ? 'ar' : 'ap';
  const field = MODULES[type].entityField;
  const set = new Set();
  Store.get(sourceType).forEach(r => { if (r[field]) set.add(r[field]); });
  Store.get(type).forEach(r => { if (r[field]) set.add(r[field]); });
  return [...set].sort();
}

/* ===== Filter Helper ===== */

function filterRecords(records, state, field, flowType) {
  let filtered = [...records];
  if (state.search) {
    const terms = state.search.toLowerCase().split(/[\s,;，；]+/).filter(t => t);
    filtered = filtered.filter(r => {
      const wb = (r.waybillNumber || '').toLowerCase();
      const en = (r[field] || '').toLowerCase();
      return terms.some(term => wb.includes(term) || en.includes(term));
    });
  }
  if (state.month) filtered = filtered.filter(r => Util.monthKey(r.date) === state.month);
  if (state.category) filtered = filtered.filter(r => r.expenseCategory === state.category);
  if (state.verificationStatus) filtered = filtered.filter(r => calcVerificationStatus(r, flowType) === state.verificationStatus);
  return filtered.sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));
}

function filterFlowRecords(records, state, field) {
  let filtered = [...records];
  if (state.search) {
    const terms = state.search.toLowerCase().split(/[\s,;，；]+/).filter(t => t);
    filtered = filtered.filter(r => {
      const en = (r[field] || '').toLowerCase();
      const wb = (r.waybillNumber || '').toLowerCase();
      return terms.some(term => en.includes(term) || wb.includes(term));
    });
  }
  if (state.month) filtered = filtered.filter(r => Util.monthKey(r.date) === state.month);
  if (state.payment) filtered = filtered.filter(r => r.paymentMethod === state.payment);
  return filtered.sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));
}

/* ============================================================
   PAGE: List (AR / AP)
   ============================================================ */

function renderListPage(type) {
  const config = MODULES[type];
  const data = Store.get(type);
  const state = listState[type];
  const flowType = type === 'ar' ? 'ar-flow' : 'ap-flow';
  const filtered = filterRecords(data, state, config.entityField, flowType);
  const summary = calcSummary(filtered);
  const totalPages = Math.ceil(filtered.length / state.pageSize);
  if (state.page > totalPages && totalPages > 0) state.page = 1;
  const start = (state.page - 1) * state.pageSize;
  const pageData = filtered.slice(start, start + state.pageSize);

  const monthOpts = getMonthList(data);

  const html = `
    <div class="summary-bar">
      <div class="summary-item">
        <div class="summary-item__label">\u603B${config.title}</div>
        <div class="summary-item__value">${Util.fmt(summary.total)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-item__label">\u8BB0\u5F55\u6570</div>
        <div class="summary-item__value">${filtered.length}</div>
      </div>
    </div>

    <div class="card mb-24">
      <div class="card__body">
        <div class="toolbar">
          <div class="toolbar__left">
            <div class="search-box">
              <input type="text" placeholder="\u641C\u7D22\u8FD0\u5355\u53F7\u3001${config.entityLabel}\u540D\u79F0\uFF08\u591A\u4E2A\u7528\u7A7A\u683C/\u9017\u53F7\u5206\u9694\uFF09..." value="${Util.esc(state.search)}" oninput="App.onListSearch('${type}', this.value)">
            </div>
            <select class="form-control form-control--sm" onchange="App.onListFilter('${type}', 'month', this.value)">
              <option value="">\u5168\u90E8\u6708\u4EFD</option>
              ${monthOpts.map(m => `<option value="${m}" ${state.month === m ? 'selected' : ''}>${Util.monthLabel(m)}</option>`).join('')}
            </select>
            <select class="form-control form-control--sm" onchange="App.onListFilter('${type}', 'category', this.value)">
              <option value="">\u5168\u90E8\u8D39\u7528</option>
              ${[...new Set(Store.get(type).map(r => r.expenseCategory).filter(Boolean))].sort().map(c => `<option value="${c}" ${state.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
            <select class="form-control form-control--sm" onchange="App.onListFilter('${type}', 'verificationStatus', this.value)">
              <option value="">\u5168\u90E8\u72B6\u6001</option>
              ${VERIFICATION_STATUSES.map(s => `<option value="${s}" ${state.verificationStatus === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
            ${(state.search || state.month || state.category || state.verificationStatus) ? `
            <button class="btn btn--ghost btn--sm" onclick="App.clearListFilters('${type}')">\u6E05\u9664\u7B5B\u9009</button>
            ` : ''}
          </div>
          <div class="toolbar__right">
            ${App.canEdit() ? `
            <button class="btn btn--danger btn--sm" onclick="App.confirmBulkDelete('${type}')" ${listState[type].selectedIds.size === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>
              <span>\u2702</span> \u6279\u91CF\u5220\u9664${listState[type].selectedIds.size > 0 ? ` (${listState[type].selectedIds.size})` : ''}
            </button>
            ` : `
            <button class="btn btn--danger btn--sm" disabled style="opacity:0.5;cursor:not-allowed">
              <span>\u2702</span> \u6279\u91CF\u5220\u9664
            </button>
            `}
            <button class="btn btn--secondary btn--sm" onclick="ImportExport.showImportModal('${type}')" ${App.canEdit() ? '' : 'disabled style="opacity:0.5;cursor:not-allowed"'}>
              <span>\u2193</span> \u5BFC\u5165\u6570\u636E
            </button>
            <button class="btn btn--secondary btn--sm" onclick="ImportExport.downloadTemplate('${type}')">
              \u4E0B\u8F7D\u6A21\u677F
            </button>
            <button class="btn btn--secondary btn--sm" onclick="ImportExport.exportCSV('${type}')">
              <span>\u2191</span> \u5BFC\u51FA
            </button>
            ${App.canEdit() ? `
            <button class="btn btn--primary btn--sm" onclick="Forms.showAdd('${type}')">
              <span>+</span> \u65B0\u589E
            </button>
            ` : `
            <button class="btn btn--primary btn--sm" disabled style="opacity:0.5;cursor:not-allowed">
              <span>+</span> \u65B0\u589E
            </button>
            `}
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-24">
      <div class="card__body--flush">
        <div class="table-wrap">
          ${filtered.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state__icon">\u2634</div>
              <p>\u6682\u65E0\u7B26\u5408\u6761\u4EF6\u7684\u8BB0\u5F55\uFF0C\u8BF7\u8C03\u6574\u7B5B\u9009\u6761\u4EF6\u6216\u5BFC\u5165\u6570\u636E</p>
            </div>
          ` : `
            <table class="data-table">
              <thead>
                <tr>
                  ${App.canEdit() ? `<th style="width:36px"><input type="checkbox" id="cb-select-all" onchange="App.toggleSelectAll('${type}', this.checked)"></th>` : ''}
                  <th style="width:40px">\u5E8F\u53F7</th>
                  <th>\u65E5\u671F</th>
                  <th>\u8FD0\u5355\u53F7</th>
                  <th>${config.entityLabel}\u540D\u79F0</th>
                  <th>\u53D1\u8D27\u5730</th>
                  <th>\u76EE\u7684\u5730</th>
                  <th>\u8D39\u7528\u79CD\u7C7B</th>
                  <th class="text-right">\u91D1\u989D</th>
                  <th>\u6838\u9500\u72B6\u6001</th>
                  <th>\u5907\u6CE8</th>
                  <th class="text-center">\u64CD\u4F5C</th>
                </tr>
              </thead>
              <tbody>
                ${pageData.map((r, idx) => `
                  <tr>
                    ${App.canEdit() ? `<td class="text-center"><input type="checkbox" class="row-cb" data-id="${r.id}" ${listState[type].selectedIds.has(r.id) ? 'checked' : ''} onchange="App.toggleSelect('${type}', '${r.id}', this.checked)"></td>` : ''}
                    <td class="text-center">${start + idx + 1}</td>
                    <td>${r.date}</td>
                    <td>${Util.esc(r.waybillNumber)}</td>
                    <td>${Util.esc(r[config.entityField])}</td>
                    <td>${Util.esc(r.origin || '-')}</td>
                    <td>${Util.esc(r.destination || '-')}</td>
                    <td>${Util.esc(r.expenseCategory || '-')}</td>
                    <td class="text-right num">${Util.fmtNum(r.amount)}</td>
                    <td>${verificationBadge(calcVerificationStatus(r, flowType))}</td>
                    <td class="text-muted">${Util.esc(r.remarks || '-')}</td>
                    <td class="text-center">
                      ${App.canEdit() ? `
                      <button class="btn btn--ghost btn--sm" onclick="Forms.showEdit('${type}', '${r.id}')">\u7F16\u8F91</button>
                      <button class="btn btn--danger btn--sm" onclick="Forms.confirmDelete('${type}', '${r.id}')">\u5220\u9664</button>
                      ` : '<span class="text-muted" style="font-size:12px;">\u53EA\u8BFB</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      </div>
    </div>

    ${filtered.length > 0 ? `
      <div class="pagination">
        <span class="pagination__info">\u5171 ${filtered.length} \u6761\u8BB0\u5F55\uFF0C\u7B2C ${start + 1}-${Math.min(start + state.pageSize, filtered.length)} \u6761</span>
        <button onclick="App.changePage('${type}', 1)" ${state.page <= 1 ? 'disabled' : ''}>\u9996\u9875</button>
        <button onclick="App.changePage('${type}', ${state.page - 1})" ${state.page <= 1 ? 'disabled' : ''}>\u4E0A\u4E00\u9875</button>
        ${Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          let p = i + 1;
          if (totalPages > 7) {
            if (state.page > 4) p = state.page - 3 + i;
            if (state.page > totalPages - 3) p = totalPages - 6 + i;
          }
          return `<button class="${p === state.page ? 'active' : ''}" onclick="App.changePage('${type}', ${p})">${p}</button>`;
        }).join('')}
        <button onclick="App.changePage('${type}', ${state.page + 1})" ${state.page >= totalPages ? 'disabled' : ''}>\u4E0B\u4E00\u9875</button>
        <button onclick="App.changePage('${type}', ${totalPages})" ${state.page >= totalPages ? 'disabled' : ''}>\u5C3E\u9875</button>
      </div>
    ` : ''}
  `;

  document.getElementById('page-' + type + '-list').innerHTML = html;
}

/* ============================================================
   PAGE: Flow (ar-flow / ap-flow)
   ============================================================ */

function renderFlowPage(type) {
  const config = MODULES[type];
  const data = Store.get(type);
  const state = listState[type];
  const filtered = filterFlowRecords(data, state, config.entityField);
  const totalPages = Math.ceil(filtered.length / state.pageSize);
  if (state.page > totalPages && totalPages > 0) state.page = 1;
  const start = (state.page - 1) * state.pageSize;
  const pageData = filtered.slice(start, start + state.pageSize);

  const totalAmt = filtered.reduce((s, r) => s + (r.amount || 0), 0);
  const cm = Util.currentMonth();
  const monthFlow = filtered.filter(r => Util.monthKey(r.date) === cm).reduce((s, r) => s + (r.amount || 0), 0);
  const entityCount = new Set(filtered.map(r => r[config.entityField])).size;
  const monthOpts = getMonthList(data);

  const html = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--blue">\u25C8</div>
        <div class="kpi-card__label">\u6D41\u6C34\u603B\u989D</div>
        <div class="kpi-card__value">${Util.fmt(totalAmt)}</div>
        <div class="kpi-card__sub">${filtered.length} \u7B14\u8BB0\u5F55</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--green">\u2713</div>
        <div class="kpi-card__label">\u8BB0\u5F55\u6570</div>
        <div class="kpi-card__value">${filtered.length}</div>
        <div class="kpi-card__sub">\u5DF2\u5F55\u5165\u6D41\u6C34</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--purple">\u25D0</div>
        <div class="kpi-card__label">${config.entityLabel}\u6570\u91CF</div>
        <div class="kpi-card__value">${entityCount}</div>
        <div class="kpi-card__sub">\u4E0D\u540C${config.entityLabel}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--orange">\u00A5</div>
        <div class="kpi-card__label">\u672C\u6708\u6D41\u6C34</div>
        <div class="kpi-card__value">${Util.fmt(monthFlow)}</div>
        <div class="kpi-card__sub">${Util.monthLabel(cm)}</div>
      </div>
    </div>

    <div class="card mb-24">
      <div class="card__body">
        <div class="toolbar">
          <div class="toolbar__left">
            <div class="search-box">
              <input type="text" placeholder="\u641C\u7D22\u8FD0\u5355\u53F7\u3001${config.entityLabel}\u540D\u79F0\uFF08\u591A\u4E2A\u7528\u7A7A\u683C/\u9017\u53F7\u5206\u9694\uFF09..." value="${Util.esc(state.search)}" oninput="App.onFlowSearch('${type}', this.value)">
            </div>
            <select class="form-control form-control--sm" onchange="App.onListFilter('${type}', 'month', this.value)">
              <option value="">\u5168\u90E8\u6708\u4EFD</option>
              ${monthOpts.map(m => `<option value="${m}" ${state.month === m ? 'selected' : ''}>${Util.monthLabel(m)}</option>`).join('')}
            </select>
            <select class="form-control form-control--sm" onchange="App.onListFilter('${type}', 'payment', this.value)">
              <option value="">\u5168\u90E8\u4ED8\u6B3E\u65B9\u5F0F</option>
              ${[...new Set(data.map(r => r.paymentMethod).filter(Boolean))].sort().map(p => `<option value="${p}" ${state.payment === p ? 'selected' : ''}>${p}</option>`).join('')}
            </select>
            ${(state.search || state.month || state.payment) ? `
            <button class="btn btn--ghost btn--sm" onclick="App.clearFlowFilters('${type}')">\u6E05\u9664\u7B5B\u9009</button>
            ` : ''}
          </div>
          <div class="toolbar__right">
            ${App.canEdit() ? `
            <button class="btn btn--danger btn--sm" onclick="App.confirmFlowBulkDelete('${type}')" ${listState[type].selectedIds.size === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>
              <span>\u2702</span> \u6279\u91CF\u5220\u9664${listState[type].selectedIds.size > 0 ? ` (${listState[type].selectedIds.size})` : ''}
            </button>
            ` : `
            <button class="btn btn--danger btn--sm" disabled style="opacity:0.5;cursor:not-allowed">
              <span>\u2702</span> \u6279\u91CF\u5220\u9664
            </button>
            `}
            <button class="btn btn--secondary btn--sm" onclick="ImportExport.showImportModal('${type}')" ${App.canEdit() ? '' : 'disabled style="opacity:0.5;cursor:not-allowed"'}>
              <span>\u2193</span> \u5BFC\u5165\u6570\u636E
            </button>
            <button class="btn btn--secondary btn--sm" onclick="ImportExport.downloadFlowTemplate('${type}')">
              \u4E0B\u8F7D\u6A21\u677F
            </button>
            <button class="btn btn--secondary btn--sm" onclick="ImportExport.exportFlowCSV('${type}')">
              <span>\u2191</span> \u5BFC\u51FA
            </button>
            ${App.canEdit() ? `
            <button class="btn btn--primary btn--sm" onclick="Forms.showFlowAdd('${type}')">
              <span>+</span> \u65B0\u589E
            </button>
            ` : `
            <button class="btn btn--primary btn--sm" disabled style="opacity:0.5;cursor:not-allowed">
              <span>+</span> \u65B0\u589E
            </button>
            `}
          </div>
        </div>
      </div>
    </div>

    <div class="summary-bar">
      <div class="summary-item">
        <div class="summary-item__label">\u4ED8\u6B3E\u603B\u989D</div>
        <div class="summary-item__value">${Util.fmt(totalAmt)}</div>
      </div>
    </div>

    <div class="card mb-24">
      <div class="card__body--flush">
        <div class="table-wrap">
          ${filtered.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state__icon">\u2634</div>
              <p>\u6682\u65E0\u7B26\u5408\u6761\u4EF6\u7684\u8BB0\u5F55\uFF0C\u8BF7\u8C03\u6574\u7B5B\u9009\u6761\u4EF6\u6216\u5BFC\u5165\u6570\u636E</p>
            </div>
          ` : `
            <table class="data-table">
              <thead>
                <tr>
                  ${App.canEdit() ? `<th style="width:36px"><input type="checkbox" id="cb-flow-select-all" onchange="App.toggleFlowSelectAll('${type}', this.checked)"></th>` : ''}
                  <th style="width:40px">\u5E8F\u53F7</th>
                  <th>\u65E5\u671F</th>
                  <th>\u8FD0\u5355\u53F7</th>
                  <th>${config.entityLabel}\u540D\u79F0</th>
                  <th>\u4ED8\u6B3E\u65B9\u5F0F</th>
                  <th class="text-right">\u4ED8\u6B3E\u91D1\u989D</th>
                  <th>\u5907\u6CE8</th>
                  <th class="text-center">\u64CD\u4F5C</th>
                </tr>
              </thead>
              <tbody>
                ${pageData.map((r, idx) => `
                  <tr>
                    ${App.canEdit() ? `<td class="text-center"><input type="checkbox" class="row-cb" data-id="${r.id}" ${listState[type].selectedIds.has(r.id) ? 'checked' : ''} onchange="App.toggleFlowSelect('${type}', '${r.id}', this.checked)"></td>` : ''}
                    <td class="text-center">${start + idx + 1}</td>
                    <td>${r.date}</td>
                    <td>${Util.esc(r.waybillNumber || '-')}</td>
                    <td>${Util.esc(r[config.entityField])}</td>
                    <td>${Util.esc(r.paymentMethod || '-')}</td>
                    <td class="text-right num">${Util.fmtNum(r.amount)}</td>
                    <td class="text-muted">${Util.esc(r.remarks || '-')}</td>
                    <td class="text-center">
                      ${App.canEdit() ? `
                      <button class="btn btn--ghost btn--sm" onclick="Forms.showFlowEdit('${type}', '${r.id}')">\u7F16\u8F91</button>
                      <button class="btn btn--danger btn--sm" onclick="Forms.confirmFlowDelete('${type}', '${r.id}')">\u5220\u9664</button>
                      ` : '<span class="text-muted" style="font-size:12px;">\u53EA\u8BFB</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      </div>
    </div>

    ${filtered.length > 0 ? `
      <div class="pagination">
        <span class="pagination__info">\u5171 ${filtered.length} \u6761\u8BB0\u5F55\uFF0C\u7B2C ${start + 1}-${Math.min(start + state.pageSize, filtered.length)} \u6761</span>
        <button onclick="App.changeFlowPage('${type}', 1)" ${state.page <= 1 ? 'disabled' : ''}>\u9996\u9875</button>
        <button onclick="App.changeFlowPage('${type}', ${state.page - 1})" ${state.page <= 1 ? 'disabled' : ''}>\u4E0A\u4E00\u9875</button>
        ${Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          let p = i + 1;
          if (totalPages > 7) {
            if (state.page > 4) p = state.page - 3 + i;
            if (state.page > totalPages - 3) p = totalPages - 6 + i;
          }
          return `<button class="${p === state.page ? 'active' : ''}" onclick="App.changeFlowPage('${type}', ${p})">${p}</button>`;
        }).join('')}
        <button onclick="App.changeFlowPage('${type}', ${state.page + 1})" ${state.page >= totalPages ? 'disabled' : ''}>\u4E0B\u4E00\u9875</button>
        <button onclick="App.changeFlowPage('${type}', ${totalPages})" ${state.page >= totalPages ? 'disabled' : ''}>\u5C3E\u9875</button>
      </div>
    ` : ''}
  `;

  document.getElementById('page-' + type).innerHTML = html;
}

/* ============================================================
   PAGE: Waybill
   ============================================================ */

function renderWaybillPage() {
  ChartMgr.disposePage('waybill');
  const arData = Store.get('ar');
  const apData = Store.get('ap');
  const arWbFlow = buildWaybillFlowMap('ar-flow');
  const apWbFlow = buildWaybillFlowMap('ap-flow');
  const { arFlowMap, apFlowMap } = buildFlowMaps();
  const state = reportState.waybill;

  const waybillMap = {};
  arData.forEach(r => {
    if (!waybillMap[r.waybillNumber]) {
      waybillMap[r.waybillNumber] = {
        waybillNumber: r.waybillNumber,
        date: r.date,
        customerName: r.customerName,
        origin: r.origin,
        destination: r.destination,
        arTotal: 0, arPaid: 0,
        apTotal: 0, apPaid: 0,
        arCount: 0, apCount: 0,
        arCats: {}, apCats: {},
        suppliers: new Set()
      };
    }
    const w = waybillMap[r.waybillNumber];
    w.arTotal += r.amount;
    w.arCount += 1;
    w.arCats[r.expenseCategory] = (w.arCats[r.expenseCategory] || 0) + r.amount;
    if (r.date < w.date) w.date = r.date;
    if (r.origin && !w.origin) w.origin = r.origin;
    if (r.destination && !w.destination) w.destination = r.destination;
  });

  apData.forEach(r => {
    if (!waybillMap[r.waybillNumber]) {
      waybillMap[r.waybillNumber] = {
        waybillNumber: r.waybillNumber,
        date: r.date,
        customerName: '',
        origin: r.origin,
        destination: r.destination,
        arTotal: 0, arPaid: 0,
        apTotal: 0, apPaid: 0,
        arCount: 0, apCount: 0,
        arCats: {}, apCats: {},
        suppliers: new Set()
      };
    }
    const w = waybillMap[r.waybillNumber];
    w.apTotal += r.amount;
    w.apCount += 1;
    w.apCats[r.expenseCategory] = (w.apCats[r.expenseCategory] || 0) + r.amount;
    w.suppliers.add(r.supplierName);
    if (!w.date || r.date < w.date) w.date = r.date;
    if (r.origin && !w.origin) w.origin = r.origin;
    if (r.destination && !w.destination) w.destination = r.destination;
  });

  let rows = Object.values(waybillMap).map(w => {
    w.arPaid = arWbFlow[w.waybillNumber] || 0;
    w.apPaid = apWbFlow[w.waybillNumber] || 0;
    return {
      ...w,
      grossProfit: w.arTotal - w.apTotal,
      profitRate: w.arTotal ? (w.arTotal - w.apTotal) / w.arTotal : 0,
      supplierNames: [...w.suppliers]
    };
  });

  if (state.search) {
    const terms = state.search.toLowerCase().split(/[\s,;，；]+/).filter(t => t);
    rows = rows.filter(r => {
      const wb = r.waybillNumber.toLowerCase();
      const cn = (r.customerName || '').toLowerCase();
      return terms.some(term => wb.includes(term) || cn.includes(term));
    });
  }
  if (state.month) {
    rows = rows.filter(r => Util.monthKey(r.date) === state.month);
  }
  if (state.profitFilter === 'profit') {
    rows = rows.filter(r => r.grossProfit > 0);
  } else if (state.profitFilter === 'loss') {
    rows = rows.filter(r => r.grossProfit < 0);
  }
  if (state.route) {
    const [o, d] = state.route.split(' \u2192 ');
    rows = rows.filter(r => (!o || r.origin === o) && (!d || r.destination === d));
  }

  // Column-level filters (Excel-style: checked values)
  const filterableCols = ['waybillNumber', 'date', 'customerName', 'origin', 'destination'];
  filterableCols.forEach(col => {
    const selected = state.colFilters[col];
    if (selected && selected.length > 0) {
      rows = rows.filter(r => selected.includes(r[col] || ''));
    }
  });

  // Sorting
  const sf = state.sortField, sd = state.sortDir === 'asc' ? 1 : -1;
  rows.sort((a, b) => {
    let av, bv;
    switch (sf) {
      case 'waybillNumber': av = a.waybillNumber || ''; bv = b.waybillNumber || ''; break;
      case 'date': av = a.date || ''; bv = b.date || ''; break;
      case 'customerName': av = a.customerName || ''; bv = b.customerName || ''; break;
      case 'origin': av = a.origin || ''; bv = b.origin || ''; break;
      case 'destination': av = a.destination || ''; bv = b.destination || ''; break;
      case 'arTotal': av = a.arTotal; bv = b.arTotal; break;
      case 'apTotal': av = a.apTotal; bv = b.apTotal; break;
      case 'grossProfit': av = a.grossProfit; bv = b.grossProfit; break;
      case 'profitRate': av = a.profitRate; bv = b.profitRate; break;
      case 'arCount': av = a.arCount; bv = b.arCount; break;
      case 'apCount': av = a.apCount; bv = b.apCount; break;
      default: av = a.date || ''; bv = b.date || '';
    }
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sd;
    return String(av).localeCompare(String(bv)) * sd;
  });

  const totalAR = rows.reduce((s, r) => s + r.arTotal, 0);
  const totalAP = rows.reduce((s, r) => s + r.apTotal, 0);
  const totalGP = totalAR - totalAP;
  const avgGP = rows.length ? totalGP / rows.length : 0;
  const profitCount = rows.filter(r => r.grossProfit > 0).length;
  const lossCount = rows.filter(r => r.grossProfit < 0).length;

  const uniqueCustomers = new Set(rows.map(r => r.customerName).filter(Boolean));
  const uniqueSuppliers = new Set();
  rows.forEach(r => r.supplierNames.forEach(s => uniqueSuppliers.add(s)));
  const totalArPaid = [...uniqueCustomers].reduce((s, c) => s + (arFlowMap[c] || 0), 0);
  const totalApPaid = [...uniqueSuppliers].reduce((s, sp) => s + (apFlowMap[sp] || 0), 0);

  const allDates = rows.map(r => r.date).filter(d => d);
  const monthSet = new Set(allDates.map(d => Util.monthKey(d)));
  const months = [...monthSet].sort().reverse();

  const routeSet = new Set();
  Object.values(waybillMap).forEach(w => {
    if (w.origin && w.destination) routeSet.add(w.origin + ' \u2192 ' + w.destination);
  });
  const routes = [...routeSet].sort();

  const totalPages = Math.ceil(rows.length / state.pageSize);
  if (state.page > totalPages && totalPages > 0) state.page = 1;
  const start = (state.page - 1) * state.pageSize;
  const pageRows = rows.slice(start, start + state.pageSize);

  const html = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--blue">&#9645;</div>
        <div class="kpi-card__label">\u8FD0\u5355\u603B\u6570</div>
        <div class="kpi-card__value">${rows.length}</div>
        <div class="kpi-card__sub">\u76C8\u5229 ${profitCount} \u5355 \u00B7 \u4E8F\u635F ${lossCount} \u5355</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--green">&#9650;</div>
        <div class="kpi-card__label">\u5E94\u6536\u603B\u989D</div>
        <div class="kpi-card__value">${Util.fmt(totalAR)}</div>
        <div class="kpi-card__sub">\u5DF2\u6536 ${Util.fmt(totalArPaid)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--orange">&#9660;</div>
        <div class="kpi-card__label">\u5E94\u4ED8\u603B\u989D</div>
        <div class="kpi-card__value">${Util.fmt(totalAP)}</div>
        <div class="kpi-card__sub">\u5DF2\u4ED8 ${Util.fmt(totalApPaid)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--purple">&#165;</div>
        <div class="kpi-card__label">\u6BDB\u5229\u603B\u989D</div>
        <div class="kpi-card__value" style="color:${totalGP >= 0 ? 'var(--success)' : 'var(--danger)'}">${totalGP >= 0 ? '' : '-'}${Util.fmt(Math.abs(totalGP))}</div>
        <div class="kpi-card__sub">\u6BDB\u5229\u7387 ${totalAR ? (totalGP / totalAR * 100).toFixed(1) : 0}% \u00B7 \u5355\u5747 ${Util.fmt(avgGP)}</div>
      </div>
    </div>

    <div class="card mb-24">
      <div class="card__body">
        <div class="toolbar">
          <div class="toolbar__left">
            <div class="search-box">
              <input type="text" placeholder="\u641C\u7D22\u8FD0\u5355\u53F7\u3001\u5BA2\u6237\u540D\u79F0\uFF08\u591A\u4E2A\u7528\u7A7A\u683C/\u9017\u53F7\u5206\u9694\uFF09..." value="${Util.esc(state.search)}" oninput="App.onWaybillSearch(this.value)">
            </div>
            <select class="form-control form-control--sm" onchange="App.onWaybillFilter('month', this.value)">
              <option value="">\u5168\u90E8\u6708\u4EFD</option>
              ${months.map(m => `<option value="${m}" ${state.month === m ? 'selected' : ''}>${Util.monthLabel(m)}</option>`).join('')}
            </select>
            <select class="form-control form-control--sm" onchange="App.onWaybillFilter('profitFilter', this.value)">
              <option value="">\u5168\u90E8\u6BDB\u5229</option>
              <option value="profit" ${state.profitFilter === 'profit' ? 'selected' : ''}>\u76C8\u5229\u8FD0\u5355</option>
              <option value="loss" ${state.profitFilter === 'loss' ? 'selected' : ''}>\u4E8F\u635F\u8FD0\u5355</option>
            </select>
            <select class="form-control form-control--sm" onchange="App.onWaybillFilter('route', this.value)">
              <option value="">\u5168\u90E8\u7EBF\u8DEF</option>
              ${routes.map(r => `<option value="${r}" ${state.route === r ? 'selected' : ''}>${r}</option>`).join('')}
            </select>
            ${(state.search || state.month || state.profitFilter || state.route) ? `
            <button class="btn btn--ghost btn--sm" onclick="App.clearWaybillFilters()">\u6E05\u9664\u7B5B\u9009</button>
            ` : ''}
          </div>
          <div class="toolbar__right">
            <button class="btn btn--secondary btn--sm" onclick="ImportExport.exportWaybillCSV()">
              <span>&#8679;</span> \u5BFC\u51FA
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-24">
      <div class="card__header">
        <div class="card__title">\u8FD0\u5355\u660E\u7EC6\u5217\u8868</div>
        <div class="text-muted" style="font-size:13px;">\u5171 ${rows.length} \u6761\u8FD0\u5355\u8BB0\u5F55</div>
      </div>
      <div class="card__body--flush">
        <div class="table-wrap">
          ${rows.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state__icon">&#9645;</div>
              <p>\u6682\u65E0\u7B26\u5408\u6761\u4EF6\u7684\u8FD0\u5355\u8BB0\u5F55</p>
            </div>
          ` : `
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:40px">\u5E8F\u53F7</th>
                  ${(() => {
                    const cols = [
                      { field: 'waybillNumber', label: '\u8FD0\u5355\u53F7', filterable: true },
                      { field: 'date', label: '\u65E5\u671F', filterable: true },
                      { field: 'customerName', label: '\u5BA2\u6237\u540D\u79F0', filterable: true },
                      { field: 'origin', label: '\u53D1\u7AD9', filterable: true },
                      { field: 'destination', label: '\u5230\u7AD9', filterable: true },
                      { field: 'arTotal', label: '\u5E94\u6536\u603B\u989D', align: 'right' },
                      { field: 'apTotal', label: '\u5E94\u4ED8\u603B\u989D', align: 'right' },
                      { field: 'grossProfit', label: '\u6BDB\u5229', align: 'right' },
                      { field: 'profitRate', label: '\u6BDB\u5229\u7387', align: 'right' },
                      { field: 'arCount', label: '\u5E94\u6536\u7B14\u6570', align: 'center' },
                      { field: 'apCount', label: '\u5E94\u4ED8\u7B14\u6570', align: 'center' }
                    ];
                    return cols.map(c => {
                      const isSorted = state.sortField === c.field;
                      const arrow = isSorted ? (state.sortDir === 'asc' ? ' \u2191' : ' \u2193') : '';
                      const cls = c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : '';
                      const hasFilter = state.colFilters[c.field] && state.colFilters[c.field].length > 0;
                      const isActive = state.activeFilterCol === c.field;
                      const filterIcon = c.filterable ? `<span class="wb-filter-icon${hasFilter ? ' wb-filter-active' : ''}${isActive ? ' wb-filter-open' : ''}" onclick="event.stopPropagation();App.toggleWaybillFilter('${c.field}')">&#9662;</span>` : '';
                      return `<th class="${cls}" style="cursor:pointer;user-select:none;position:relative;" onclick="App.onWaybillSort('${c.field}')" title="\u70B9\u51FB\u6392\u5E8F">${c.label}<span style="font-size:11px;color:${isSorted ? 'var(--brand)' : 'var(--text-tertiary)'};">${arrow}</span>${filterIcon}</th>`;
                    }).join('');
                  })()}
                </tr>
                ${state.activeFilterCol ? (() => {
                  const col = state.activeFilterCol;
                  const allRows = Object.values(waybillMap).map(w => w[col] || '');
                  const uniqueVals = [...new Set(allRows)].sort();
                  const selected = state.colFilters[col] || [];
                  return `<tr class="wb-filter-row"><td></td><td colspan="11"><div class="wb-filter-dropdown">
                    <div class="wb-filter-actions">
                      <button class="btn btn--ghost btn--sm" onclick="App.onWaybillSort('${col}');App.toggleWaybillFilter('${col}')">${state.sortDir === 'asc' ? '\u2191 \u5347\u5E8F' : '\u2193 \u964D\u5E8F'} \u6392\u5E8F</button>
                      <button class="btn btn--ghost btn--sm" onclick="App.waybillFilterAll('${col}')">\u5168\u9009</button>
                      <button class="btn btn--ghost btn--sm" onclick="App.waybillFilterClear('${col}')">\u6E05\u7A7A</button>
                      <button class="btn btn--primary btn--sm" style="margin-left:auto;" onclick="App.toggleWaybillFilter('${col}')">\u786E\u5B9A</button>
                    </div>
                    <input type="text" class="form-control form-control--sm" style="margin:6px 0;width:100%;" placeholder="\u641C\u7D22..." oninput="App.onWaybillFilterSearch(this.value)" id="wbFilterSearch">
                    <div class="wb-filter-list">
                      ${uniqueVals.map(v => {
                        const checked = selected.length === 0 || selected.includes(v);
                        return `<label class="wb-filter-item"><input type="checkbox" ${checked ? 'checked' : ''} onchange="App.onWaybillFilterCheck('${col}', '${Util.esc(v).replace(/'/g, "\\'")}', this.checked)"> <span>${Util.esc(v) || '-'}</span></label>`;
                      }).join('')}
                    </div>
                  </div></td></tr>`;
                })() : ''}
              </thead>
              <tbody>
                ${pageRows.map((r, idx) => `
                  <tr style="cursor:pointer" onclick="App.toggleWaybillDetail('${r.waybillNumber}')">
                    <td class="text-center">${start + idx + 1}</td>
                    <td><strong>${Util.esc(r.waybillNumber)}</strong></td>
                    <td>${r.date || '-'}</td>
                    <td>${Util.esc(r.customerName) || '-'}</td>
                    <td>${Util.esc(r.origin) || '-'}</td>
                    <td>${Util.esc(r.destination) || '-'}</td>
                    <td class="text-right num">${Util.fmtNum(r.arTotal)}</td>
                    <td class="text-right num">${Util.fmtNum(r.apTotal)}</td>
                    <td class="text-right num" style="color:${r.grossProfit >= 0 ? 'var(--success)' : 'var(--danger)'};font-weight:600">
                      ${r.grossProfit >= 0 ? '' : '-'}${Util.fmtNum(Math.abs(r.grossProfit))}
                    </td>
                    <td class="text-center">
                      <span class="tag ${r.profitRate >= 0 ? 'tag--success' : 'tag--danger'}">
                        ${(r.profitRate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td class="text-center">${r.arCount}</td>
                    <td class="text-center">${r.apCount}</td>
                  </tr>
                  <tr id="wb-detail-${r.waybillNumber.replace(/[^a-zA-Z0-9]/g, '')}" style="display:none;background:var(--page-surface);">
                    <td colspan="12" style="padding:0;">
                      <div style="padding:16px 24px;">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                          <div>
                            <div style="font-weight:600;margin-bottom:8px;color:var(--success);">
                              &#9650; \u5E94\u6536\u660E\u7EC6\uFF08${r.arCount} \u7B14\uFF09\u00B7 \u5BA2\u6237\uFF1A${Util.esc(r.customerName) || '-'} \u00B7 \u5DF2\u6536\uFF1A${Util.fmtNum(r.arPaid)}
                            </div>
                            <div class="table-wrap">
                              <table class="data-table" style="font-size:13px;">
                                <thead>
                                  <tr><th>\u8D39\u7528\u79CD\u7C7B</th><th class="text-right">\u91D1\u989D</th></tr>
                                </thead>
                                <tbody>
                                  ${Object.entries(r.arCats).sort((a,b) => b[1] - a[1]).map(([cat, amt]) => `
                                    <tr><td>${cat}</td><td class="text-right num">${Util.fmtNum(amt)}</td></tr>
                                  `).join('') || '<tr><td colspan="2" class="text-center text-muted">\u6682\u65E0\u5E94\u6536\u8BB0\u5F55</td></tr>'}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <div>
                            <div style="font-weight:600;margin-bottom:8px;color:var(--reminder);">
                              &#9660; \u5E94\u4ED8\u660E\u7EC6\uFF08${r.apCount} \u7B14\uFF09\u00B7 \u627F\u8FD0\u5546\uFF1A${r.supplierNames.join(', ') || '-'} \u00B7 \u5DF2\u4ED8\uFF1A${Util.fmtNum(r.apPaid)}
                            </div>
                            <div class="table-wrap">
                              <table class="data-table" style="font-size:13px;">
                                <thead>
                                  <tr><th>\u8D39\u7528\u79CD\u7C7B</th><th class="text-right">\u91D1\u989D</th><th class="text-right">\u627F\u8FD0\u5546</th></tr>
                                </thead>
                                <tbody>
                                  ${Object.entries(r.apCats).sort((a,b) => b[1] - a[1]).map(([cat, amt]) => `
                                    <tr><td>${cat}</td><td class="text-right num">${Util.fmtNum(amt)}</td><td class="text-right text-muted">${r.supplierNames.join(', ') || '-'}</td></tr>
                                  `).join('') || '<tr><td colspan="3" class="text-center text-muted">\u6682\u65E0\u5E94\u4ED8\u8BB0\u5F55</td></tr>'}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="sum-row">
                  <td colspan="6">\u5408\u8BA1</td>
                  <td class="text-right num">${Util.fmtNum(totalAR)}</td>
                  <td class="text-right num">${Util.fmtNum(totalAP)}</td>
                  <td class="text-right num" style="color:${totalGP >= 0 ? 'var(--success)' : 'var(--danger)'}">
                    ${totalGP >= 0 ? '' : '-'}${Util.fmtNum(Math.abs(totalGP))}
                  </td>
                  <td class="text-center">${totalAR ? (totalGP / totalAR * 100).toFixed(1) : 0}%</td>
                  <td class="text-center">${rows.reduce((s, r) => s + r.arCount, 0)}</td>
                  <td class="text-center">${rows.reduce((s, r) => s + r.apCount, 0)}</td>
                </tr>
              </tfoot>
            </table>
          `}
        </div>
      </div>
    </div>

    ${rows.length > 0 ? `
      <div class="pagination">
        <span class="pagination__info">\u5171 ${rows.length} \u6761\u8FD0\u5355\uFF0C\u7B2C ${start + 1}-${Math.min(start + state.pageSize, rows.length)} \u6761</span>
        <button onclick="App.changeWaybillPage(1)" ${state.page <= 1 ? 'disabled' : ''}>\u9996\u9875</button>
        <button onclick="App.changeWaybillPage(${state.page - 1})" ${state.page <= 1 ? 'disabled' : ''}>\u4E0A\u4E00\u9875</button>
        ${Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          let p = i + 1;
          if (totalPages > 7) {
            if (state.page > 4) p = state.page - 3 + i;
            if (state.page > totalPages - 3) p = totalPages - 6 + i;
          }
          return `<button class="${p === state.page ? 'active' : ''}" onclick="App.changeWaybillPage(${p})">${p}</button>`;
        }).join('')}
        <button onclick="App.changeWaybillPage(${state.page + 1})" ${state.page >= totalPages ? 'disabled' : ''}>\u4E0B\u4E00\u9875</button>
        <button onclick="App.changeWaybillPage(${totalPages})" ${state.page >= totalPages ? 'disabled' : ''}>\u5C3E\u9875</button>
      </div>
    ` : ''}

    <div class="chart-grid">
      <div class="chart-card">
        <div class="chart-card__title">\u8FD0\u5355\u6BDB\u5229\u5206\u5E03</div>
        <div class="chart-card__desc">\u6309\u6BDB\u5229\u533A\u95F4\u7EDF\u8BA1\u8FD0\u5355\u6570\u91CF</div>
        <div id="waybill-profit-dist" class="chart-container"></div>
      </div>
      <div class="chart-card">
        <div class="chart-card__title">\u6BDB\u5229 Top 10 \u8FD0\u5355</div>
        <div class="chart-card__desc">\u6BDB\u5229\u91D1\u989D\u6700\u9AD8\u7684\u8FD0\u5355</div>
        <div id="waybill-top-profit" class="chart-container"></div>
      </div>
      <div class="chart-card" style="grid-column: 1 / -1;">
        <div class="chart-card__title">\u6708\u5EA6\u8FD0\u5355\u6BDB\u5229\u8D8B\u52BF</div>
        <div class="chart-card__desc">\u8FD1 6 \u4E2A\u6708\u8FD0\u5355\u6570\u3001\u5E94\u6536\u3001\u5E94\u4ED8\u3001\u6BDB\u5229\u53D8\u5316</div>
        <div id="waybill-month-trend" class="chart-container chart-container--lg"></div>
      </div>
    </div>
  `;

  document.getElementById('page-waybill').innerHTML = html;
  initWaybillCharts(rows);
}

function initWaybillCharts(rows) {
  const buckets = [
    { label: '\u4E8F\u635F (<0)', min: -99999999, max: 0, count: 0, amount: 0 },
    { label: '\u5FAE\u5229 (0-10%)', min: 0, max: 0.1, count: 0, amount: 0 },
    { label: '\u6B63\u5E38 (10-25%)', min: 0.1, max: 0.25, count: 0, amount: 0 },
    { label: '\u826F\u597D (25-40%)', min: 0.25, max: 0.4, count: 0, amount: 0 },
    { label: '\u4F18\u79C0 (>40%)', min: 0.4, max: 999, count: 0, amount: 0 }
  ];
  rows.forEach(r => {
    const bucket = buckets.find(b => r.profitRate >= b.min && r.profitRate < b.max);
    if (bucket) { bucket.count++; bucket.amount += r.grossProfit; }
  });

  ChartMgr.render('waybill-profit-dist', {
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { data: ['\u8FD0\u5355\u6570', '\u6BDB\u5229\u989D'], top: 0, textStyle: { color: '#64748B' } },
    grid: { left: 60, right: 30, top: 35, bottom: 40 },
    xAxis: { type: 'category', data: buckets.map(b => b.label), axisLabel: { color: '#64748B', fontSize: 11 } },
    yAxis: [
      { type: 'value', name: '\u8FD0\u5355\u6570', axisLabel: { color: '#64748B' } },
      { type: 'value', name: '\u6BDB\u5229\u989D', axisLabel: { color: '#64748B', formatter: v => (v / 10000).toFixed(0) + '\u4E07' } }
    ],
    series: [
      { name: '\u8FD0\u5355\u6570', type: 'bar', data: buckets.map(b => b.count), itemStyle: { color: '#0969DA' }, barWidth: '40%' },
      { name: '\u6BDB\u5229\u989D', type: 'line', yAxisIndex: 1, data: buckets.map(b => Number(b.amount.toFixed(2))), itemStyle: { color: '#16A34A' } }
    ]
  });

  const top10 = [...rows].sort((a, b) => b.grossProfit - a.grossProfit).slice(0, 10);
  ChartMgr.render('waybill-top-profit', {
    tooltip: { trigger: 'axis', appendToBody: true, axisPointer: { type: 'shadow' } },
    grid: { left: 130, right: 30, top: 35, bottom: 30 },
    xAxis: { type: 'value', axisLabel: { color: '#64748B', formatter: v => (v / 10000).toFixed(0) + '\u4E07' } },
    yAxis: { type: 'category', data: top10.map(c => c.waybillNumber).reverse(), axisLabel: { color: '#475569', fontSize: 11 } },
    series: [
      { name: '\u5E94\u6536', type: 'bar', stack: 'total', data: top10.map(c => Number(c.arTotal.toFixed(2))).reverse(), itemStyle: { color: '#0969DA' } },
      { name: '\u5E94\u4ED8(-)', type: 'bar', stack: 'total', data: top10.map(c => Number(-c.apTotal.toFixed(2))).reverse(), itemStyle: { color: '#FF7A45' } }
    ],
    legend: { data: ['\u5E94\u6536', '\u5E94\u4ED8(-)'], top: 0, textStyle: { color: '#64748B' } }
  });

  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
  }

  const monthStats = months.map(m => {
    const mRows = rows.filter(r => Util.monthKey(r.date) === m);
    return {
      count: mRows.length,
      ar: mRows.reduce((s, r) => s + r.arTotal, 0),
      ap: mRows.reduce((s, r) => s + r.apTotal, 0),
      gp: mRows.reduce((s, r) => s + r.grossProfit, 0)
    };
  });

  ChartMgr.render('waybill-month-trend', {
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { data: ['\u8FD0\u5355\u6570', '\u5E94\u6536', '\u5E94\u4ED8', '\u6BDB\u5229'], top: 0, textStyle: { color: '#64748B' } },
    grid: { left: 60, right: 60, top: 35, bottom: 40 },
    xAxis: { type: 'category', data: months.map(m => Util.monthLabel(m)), axisLabel: { color: '#64748B' } },
    yAxis: [
      { type: 'value', name: '\u91D1\u989D', axisLabel: { color: '#64748B', formatter: v => (v / 10000).toFixed(0) + '\u4E07' } },
      { type: 'value', name: '\u8FD0\u5355\u6570', axisLabel: { color: '#64748B' } }
    ],
    series: [
      { name: '\u5E94\u6536', type: 'bar', data: monthStats.map(m => Number(m.ar.toFixed(2))), itemStyle: { color: '#0969DA' } },
      { name: '\u5E94\u4ED8', type: 'bar', data: monthStats.map(m => Number(m.ap.toFixed(2))), itemStyle: { color: '#FF7A45' } },
      { name: '\u6BDB\u5229', type: 'line', data: monthStats.map(m => Number(m.gp.toFixed(2))), itemStyle: { color: '#16A34A' }, lineStyle: { width: 2 }, symbolSize: 6 },
      { name: '\u8FD0\u5355\u6570', type: 'line', yAxisIndex: 1, data: monthStats.map(m => m.count), itemStyle: { color: '#8250DF' }, lineStyle: { width: 2 }, symbolSize: 6 }
    ]
  });
}

/* ============================================================
   PAGE: Report (AR / AP)
   ============================================================ */

function renderReportPage(type) {
  if (type === 'ar') {
    renderARReport();
  } else {
    renderAPReport();
  }
}

/* ===== \u5E94\u6536\u62A5\u8868\uFF1A\u6309\u5BA2\u6237\u533A\u5206\uFF0C\u5DF2\u4ED8/\u672A\u4ED8 + \u5404\u5BA2\u6237\u5404\u9879\u8D39\u7528 ===== */
function renderARReport() {
  ChartMgr.disposePage('ar-report');
  const allData = Store.get('ar');
  const allFlowData = Store.get('ar-flow');
  const state = reportState.ar;

  // Build month list for filter dropdown
  const allDates = allData.map(r => r.date).filter(Boolean);
  const monthSet = new Set(allDates.map(d => Util.monthKey(d)));
  const months = [...monthSet].sort().reverse();

  // Apply month filter
  const data = state.month ? allData.filter(r => Util.monthKey(r.date) === state.month) : allData;
  const flowData = state.month ? allFlowData.filter(r => Util.monthKey(r.date) === state.month) : allFlowData;

  const entities = getEntityList(data, 'customerName');

  const flowMap = {};
  flowData.forEach(r => { flowMap[r.customerName] = (flowMap[r.customerName] || 0) + (r.amount || 0); });

  const totalAmt = data.reduce((s, r) => s + r.amount, 0);
  const totalPaid = flowData.reduce((s, r) => s + (r.amount || 0), 0);
  const totalUnpaid = totalAmt - totalPaid;

  const customerGroups = {};
  data.forEach(r => {
    const name = r.customerName;
    if (!customerGroups[name]) customerGroups[name] = { name, records: [] };
    customerGroups[name].records.push(r);
  });

  const customerRows = Object.values(customerGroups).map(g => {
    const total = g.records.reduce((s, r) => s + r.amount, 0);
    const paid = flowMap[g.name] || 0;
    const rate = total > 0 ? (paid / total * 100) : 0;
    return { name: g.name, total, paid, unpaid: total - paid, count: g.records.length, rate };
  }).filter(g => {
    if (state.entity && !g.name.includes(state.entity)) return false;
    if (state.payStatus === 'unpaid') return g.paid === 0;
    if (state.payStatus === 'partial') return g.paid > 0 && g.paid < g.total;
    if (state.payStatus === 'paid') return g.paid >= g.total && g.total > 0;
    if (state.payStatus === 'notfull') return g.paid < g.total;
    return true;
  }).sort((a, b) => b.total - a.total);

  // Recalculate totals based on filtered customers
  const filteredNames = new Set(customerRows.map(r => r.name));
  const filteredData = data.filter(r => filteredNames.has(r.customerName));
  const filteredFlowData = flowData.filter(r => filteredNames.has(r.customerName));
  const fTotalAmt = filteredData.reduce((s, r) => s + r.amount, 0);
  const fTotalPaid = filteredFlowData.reduce((s, r) => s + (r.amount || 0), 0);
  const fTotalUnpaid = fTotalAmt - fTotalPaid;

  const filterData = filteredData;
  const catGroups = {};
  filterData.forEach(r => {
    if (!catGroups[r.expenseCategory]) catGroups[r.expenseCategory] = { category: r.expenseCategory, total: 0, count: 0 };
    catGroups[r.expenseCategory].total += r.amount;
    catGroups[r.expenseCategory].count += 1;
  });
  const catRows = Object.values(catGroups).sort((a, b) => b.total - a.total);
  const catTotal = catRows.reduce((s, x) => s + x.total, 0);

  const html = `
    <div class="card mb-24">
      <div class="card__body">
        <div class="toolbar">
          <div class="toolbar__left">
            <span class="text-muted" style="font-size:13px;">\u7B5B\u9009\u67E5\u770B\uFF1A</span>
            <select class="form-control form-control--sm" onchange="App.onARReportMonthChange(this.value)">
              <option value="">\u5168\u90E8\u6708\u4EFD</option>
              ${months.map(m => `<option value="${m}" ${state.month === m ? 'selected' : ''}>${Util.monthLabel(m)}</option>`).join('')}
            </select>
            <select class="form-control form-control--sm" onchange="App.onARReportPayStatusChange(this.value)">
              <option value="">\u5168\u90E8\u5BA2\u6237</option>
              <option value="unpaid" ${state.payStatus === 'unpaid' ? 'selected' : ''}>\u672A\u4ED8\u6B3E(0%)</option>
              <option value="partial" ${state.payStatus === 'partial' ? 'selected' : ''}>\u90E8\u5206\u4ED8\u6B3E</option>
              <option value="paid" ${state.payStatus === 'paid' ? 'selected' : ''}>\u5DF2\u4ED8\u6E05(100%)</option>
              <option value="notfull" ${state.payStatus === 'notfull' ? 'selected' : ''}>\u672A\u4ED8\u5B8C</option>
            </select>
            <input type="text" class="form-control form-control--sm" style="width:160px;" placeholder="\u641C\u7D22\u5BA2\u6237..." value="${Util.esc(state.entity)}" oninput="App.onARReportEntityInput(this.value)">
            ${(state.month || state.entity || state.payStatus) ? `<button class="btn btn--ghost btn--sm" onclick="App.clearARReportFilters()">\u6E05\u9664\u7B5B\u9009</button>` : ''}
          </div>
          <div class="toolbar__right">
            ${state.month ? `<span class="tag tag--info">\u5DF2\u9009\uFF1A${Util.monthLabel(state.month)}</span>` : ''}
            ${state.payStatus ? `<span class="tag tag--info">\u4ED8\u6B3E\u72B6\u6001\uFF1A${{'unpaid':'\u672A\u4ED8\u6B3E','partial':'\u90E8\u5206\u4ED8\u6B3E','paid':'\u5DF2\u4ED8\u6E05','notfull':'\u672A\u4ED8\u5B8C'}[state.payStatus]}</span>` : ''}
            ${state.entity ? `<span class="tag tag--info">\u5BA2\u6237\uFF1A${Util.esc(state.entity)}</span>` : ''}
          </div>
        </div>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--blue">\u25B2</div>
        <div class="kpi-card__label">\u603B\u5E94\u6536</div>
        <div class="kpi-card__value">${Util.fmt(fTotalAmt)}</div>
        <div class="kpi-card__sub">${filteredData.length} \u7B14\u8BB0\u5F55</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--green">\u2713</div>
        <div class="kpi-card__label">\u5DF2\u4ED8</div>
        <div class="kpi-card__value">${Util.fmt(fTotalPaid)}</div>
        <div class="kpi-card__sub">\u4ED8\u6B3E\u7387 ${fTotalAmt ? (fTotalPaid / fTotalAmt * 100).toFixed(1) : 0}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--red">\u2717</div>
        <div class="kpi-card__label">\u672A\u4ED8</div>
        <div class="kpi-card__value">${Util.fmt(fTotalUnpaid)}</div>
        <div class="kpi-card__sub">\u5360\u6BD4 ${fTotalAmt ? (fTotalUnpaid / fTotalAmt * 100).toFixed(1) : 0}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--orange">\u25D0</div>
        <div class="kpi-card__label">\u5BA2\u6237\u6570\u91CF</div>
        <div class="kpi-card__value">${customerRows.length}</div>
        <div class="kpi-card__sub">\u5E73\u5747\u6BCF\u5BA2\u6237 ${customerRows.length ? Util.fmt(fTotalAmt / customerRows.length) : 0}</div>
      </div>
    </div>

    <div class="card mb-24">
      <div class="card__header">
        <div class="card__title">
          \u7B2C\u4E00\u7EF4\u5EA6 \u00B7 \u5404\u5BA2\u6237\u5E94\u6536\u6C47\u603B${state.month ? ' \uFF08' + Util.monthLabel(state.month) + '\uFF09' : ''}
          <span class="text-muted" style="font-weight:400;font-size:13px;">\uFF08\u70B9\u51FB\u5BA2\u6237\u67E5\u770B\u8D39\u7528\u660E\u7EC6\uFF09</span>
        </div>
      </div>
      <div class="card__body--flush">
        <div class="table-wrap">
          ${customerRows.length === 0 ? `
            <div class="empty-state"><p>\u6682\u65E0\u6570\u636E</p></div>
          ` : `
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:40px">\u5E8F\u53F7</th>
                  <th>\u5BA2\u6237\u540D\u79F0</th>
                  <th class="text-right">\u5E94\u6536\u603B\u989D</th>
                  <th class="text-right">\u5DF2\u4ED8\u91D1\u989D</th>
                  <th class="text-right">\u672A\u4ED8\u91D1\u989D</th>
                  <th class="text-right">\u4ED8\u6B3E\u7387</th>
                  <th class="text-center">\u8BB0\u5F55\u6570</th>
                </tr>
              </thead>
              <tbody>
                ${customerRows.map((g, idx) => `
                  <tr style="cursor:pointer" onclick="App.onReportEntityChange('ar', '${Util.esc(g.name)}')" ${state.entity === g.name ? 'style="background:var(--page-brand-soft)"' : ''}>
                    <td class="text-center">${idx + 1}</td>
                    <td>
                      <div class="flex-center gap-8">
                        ${state.entity === g.name ? '<span class="tag tag--info">\u5DF2\u9009\u4E2D</span>' : ''}
                        ${Util.esc(g.name)}
                      </div>
                    </td>
                    <td class="text-right num"><strong>${Util.fmtNum(g.total)}</strong></td>
                    <td class="text-right num text-success">${Util.fmtNum(g.paid)}</td>
                    <td class="text-right num text-danger">${Util.fmtNum(g.unpaid)}</td>
                    <td class="text-right">
                      ${g.rate.toFixed(1)}%
                      ${g.rate === 0 ? '<span class="tag tag--danger" style="margin-left:4px;font-size:11px;">\u672A\u4ED8</span>' : ''}
                      ${g.rate > 0 && g.rate < 100 ? '<span class="tag tag--warning" style="margin-left:4px;font-size:11px;">\u90E8\u5206</span>' : ''}
                      ${g.rate >= 100 ? '<span class="tag tag--success" style="margin-left:4px;font-size:11px;">\u5DF2\u6E05</span>' : ''}
                    </td>
                    <td class="text-center">${g.count}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="sum-row">
                  <td colspan="2">\u5408\u8BA1</td>
                  <td class="text-right num">${Util.fmtNum(fTotalAmt)}</td>
                  <td class="text-right num">${Util.fmtNum(fTotalPaid)}</td>
                  <td class="text-right num">${Util.fmtNum(fTotalUnpaid)}</td>
                  <td class="text-right">${fTotalAmt ? (fTotalPaid / fTotalAmt * 100).toFixed(1) : 0}%</td>
                  <td class="text-center">${filteredData.length}</td>
                </tr>
              </tfoot>
            </table>
          `}
        </div>
      </div>
    </div>

    <div class="card mb-24">
      <div class="card__header">
        <div class="card__title">
          \u7B2C\u4E8C\u7EF4\u5EA6 \u00B7 ${state.entity ? Util.esc(state.entity) + ' \u5404\u9879\u8D39\u7528\u660E\u7EC6' : '\u5168\u90E8\u5BA2\u6237\u8D39\u7528\u7C7B\u578B\u6C47\u603B'}
        </div>
        <div class="flex gap-8 flex-wrap">
          <select class="form-control form-control--sm" onchange="App.onReportEntityChange('ar', this.value)">
            <option value="">\u5168\u90E8\u5BA2\u6237</option>
            ${entities.map(e => `<option value="${Util.esc(e)}" ${state.entity === e ? 'selected' : ''}>${Util.esc(e)}</option>`).join('')}
          </select>
          ${state.entity ? `<button class="btn btn--ghost btn--sm" onclick="App.onReportEntityChange('ar', '')">\u6E05\u9664\u5BA2\u6237\u7B5B\u9009</button>` : ''}
        </div>
      </div>
      <div class="card__body--flush">
        <div class="table-wrap">
          ${catRows.length === 0 ? `
            <div class="empty-state"><p>\u6682\u65E0\u7B26\u5408\u6761\u4EF6\u7684\u6570\u636E</p></div>
          ` : `
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:40px">\u5E8F\u53F7</th>
                  <th>\u8D39\u7528\u79CD\u7C7B</th>
                  <th class="text-right">\u91D1\u989D\u5408\u8BA1</th>
                  <th class="text-right">\u5360\u6BD4</th>
                  <th class="text-center">\u8BB0\u5F55\u6570</th>
                </tr>
              </thead>
              <tbody>
                ${catRows.map((g, idx) => `
                  <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td>${g.category || '-'}</td>
                    <td class="text-right num"><strong>${Util.fmtNum(g.total)}</strong></td>
                    <td class="text-right">${catTotal ? (g.total / catTotal * 100).toFixed(1) : 0}%</td>
                    <td class="text-center">${g.count}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="sum-row">
                  <td colspan="2">\u5408\u8BA1</td>
                  <td class="text-right num">${Util.fmtNum(catTotal)}</td>
                  <td class="text-right">100%</td>
                  <td class="text-center">${catRows.reduce((s, x) => s + x.count, 0)}</td>
                </tr>
              </tfoot>
            </table>
          `}
        </div>
      </div>
    </div>

    <div class="chart-grid">
      <div class="chart-card">
        <div class="chart-card__title">\u5BA2\u6237\u5E94\u6536\u6392\u540D Top 10</div>
        <div class="chart-card__desc">\u6309\u5E94\u6536\u603B\u989D\u6392\u5E8F</div>
        <div id="ar-report-top10" class="chart-container"></div>
      </div>
      <div class="chart-card">
        <div class="chart-card__title">\u8D39\u7528\u79CD\u7C7B\u5206\u5E03</div>
        <div class="chart-card__desc">${state.entity ? Util.esc(state.entity) : '\u5168\u90E8\u5BA2\u6237'} \u5404\u8D39\u7528\u7C7B\u578B\u5360\u6BD4</div>
        <div id="ar-report-cat-pie" class="chart-container"></div>
      </div>
      <div class="chart-card" style="grid-column: 1 / -1;">
        <div class="chart-card__title">\u8FD16\u6708\u5E94\u6536\u8D8B\u52BF</div>
        <div class="chart-card__desc">\u5E94\u6536\u603B\u989D\u3001\u5DF2\u4ED8\u3001\u672A\u4ED8\u6708\u5EA6\u53D8\u5316\u8D8B\u52BF</div>
        <div id="ar-report-trend" class="chart-container chart-container--lg"></div>
      </div>
    </div>
  `;

  document.getElementById('page-ar-report').innerHTML = html;
  initARReportCharts(data, flowData, customerRows, catRows, state);
}

function initARReportCharts(allData, flowData, customerRows, catRows, state) {
  const top10 = customerRows.slice(0, 10);
  ChartMgr.render('ar-report-top10', {
    tooltip: { trigger: 'axis', appendToBody: true, axisPointer: { type: 'shadow' } },
    grid: { left: 130, right: 30, top: 35, bottom: 30 },
    xAxis: { type: 'value', axisLabel: { color: '#64748B', formatter: v => (v / 10000).toFixed(0) + '\u4E07' } },
    yAxis: { type: 'category', data: top10.map(c => c.name).reverse(), axisLabel: { color: '#475569', fontSize: 12 } },
    series: [
      { name: '\u5DF2\u4ED8', type: 'bar', stack: 'total', data: top10.map(c => Number(c.paid.toFixed(2))).reverse(), itemStyle: { color: '#16A34A' } },
      { name: '\u672A\u4ED8', type: 'bar', stack: 'total', data: top10.map(c => Number(c.unpaid.toFixed(2))).reverse(), itemStyle: { color: '#FF4D4F' } }
    ],
    legend: { data: ['\u5DF2\u4ED8', '\u672A\u4ED8'], top: 0, textStyle: { color: '#64748B' } }
  });

  ChartMgr.render('ar-report-cat-pie', {
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: \u00A5{c} ({d}%)' },
    legend: { bottom: 0, textStyle: { color: '#64748B' }, type: 'scroll' },
    color: CHART_COLORS,
    series: [{
      type: 'pie', radius: ['35%', '60%'], center: ['50%', '42%'],
      label: { color: '#475569', formatter: '{d}%', fontSize: 11 },
      data: catRows.slice(0, 8).map(c => ({ name: c.category, value: Number(c.total.toFixed(2)) }))
    }]
  });

  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
  }
  const trendTotal = months.map(m => allData.filter(r => Util.monthKey(r.date) === m).reduce((s, r) => s + r.amount, 0));
  const trendPaid = months.map(m => flowData.filter(r => Util.monthKey(r.date) === m).reduce((s, r) => s + (r.amount || 0), 0));
  const trendUnpaid = months.map((m, i) => trendTotal[i] - trendPaid[i]);

  ChartMgr.render('ar-report-trend', {
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { data: ['\u5E94\u6536\u603B\u989D', '\u5DF2\u4ED8', '\u672A\u4ED8'], top: 0, textStyle: { color: '#64748B' } },
    grid: { left: 70, right: 30, top: 35, bottom: 40 },
    xAxis: { type: 'category', data: months.map(m => Util.monthLabel(m)), axisLabel: { color: '#64748B' } },
    yAxis: { type: 'value', axisLabel: { color: '#64748B', formatter: v => (v / 10000).toFixed(0) + '\u4E07' } },
    series: [
      { name: '\u5E94\u6536\u603B\u989D', type: 'bar', data: trendTotal, itemStyle: { color: '#0969DA' } },
      { name: '\u5DF2\u4ED8', type: 'line', data: trendPaid, itemStyle: { color: '#16A34A' }, lineStyle: { width: 2 }, symbolSize: 6 },
      { name: '\u672A\u4ED8', type: 'line', data: trendUnpaid, itemStyle: { color: '#FF4D4F' }, lineStyle: { width: 2 }, symbolSize: 6 }
    ]
  });
}

/* ===== \u5E94\u4ED8\u62A5\u8868\uFF1A\u6309\u627F\u8FD0\u5546\u533A\u5206\uFF0C\u5404\u8D39\u7528\u79CD\u7C7B\u6C47\u603B\u91D1\u989D\u3001\u5DF2\u4ED8\u91D1\u989D\u3001\u672A\u4ED8\u91D1\u989D ===== */
function renderAPReport() {
  ChartMgr.disposePage('ap-report');
  const data = Store.get('ap');
  const flowData = Store.get('ap-flow');
  const state = reportState.ap;
  const entities = getEntityList(data, 'supplierName');

  const flowMap = {};
  flowData.forEach(r => { flowMap[r.supplierName] = (flowMap[r.supplierName] || 0) + (r.amount || 0); });

  const totalAmt = data.reduce((s, r) => s + r.amount, 0);
  const totalPaid = flowData.reduce((s, r) => s + (r.amount || 0), 0);
  const totalUnpaid = totalAmt - totalPaid;

  const carrierGroups = {};
  data.forEach(r => {
    const name = r.supplierName;
    if (!carrierGroups[name]) carrierGroups[name] = { name, records: [] };
    carrierGroups[name].records.push(r);
  });

  const carrierRows = Object.values(carrierGroups).map(g => {
    const total = g.records.reduce((s, r) => s + r.amount, 0);
    const paid = flowMap[g.name] || 0;
    const catMap = {};
    g.records.forEach(r => {
      if (!catMap[r.expenseCategory]) catMap[r.expenseCategory] = { total: 0, count: 0 };
      catMap[r.expenseCategory].total += r.amount;
      catMap[r.expenseCategory].count += 1;
    });
    return { name: g.name, total, paid, unpaid: total - paid, count: g.records.length, catMap };
  }).sort((a, b) => b.total - a.total);

  const html = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--purple">\u25BC</div>
        <div class="kpi-card__label">\u603B\u5E94\u4ED8</div>
        <div class="kpi-card__value">${Util.fmt(totalAmt)}</div>
        <div class="kpi-card__sub">${data.length} \u7B14\u8BB0\u5F55</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--green">\u2713</div>
        <div class="kpi-card__label">\u5DF2\u4ED8</div>
        <div class="kpi-card__value">${Util.fmt(totalPaid)}</div>
        <div class="kpi-card__sub">\u4ED8\u6B3E\u7387 ${totalAmt ? (totalPaid / totalAmt * 100).toFixed(1) : 0}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--red">\u2717</div>
        <div class="kpi-card__label">\u672A\u4ED8</div>
        <div class="kpi-card__value">${Util.fmt(totalUnpaid)}</div>
        <div class="kpi-card__sub">\u5360\u6BD4 ${totalAmt ? (totalUnpaid / totalAmt * 100).toFixed(1) : 0}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__icon kpi-card__icon--cyan">\u25D0</div>
        <div class="kpi-card__label">\u627F\u8FD0\u5546\u6570\u91CF</div>
        <div class="kpi-card__value">${carrierRows.length}</div>
        <div class="kpi-card__sub">\u5E73\u5747\u6BCF\u5BB6 ${carrierRows.length ? Util.fmt(totalAmt / carrierRows.length) : 0}</div>
      </div>
    </div>

    <div class="card mb-24">
      <div class="card__header">
        <div class="card__title">
          \u6309\u627F\u8FD0\u5546\u533A\u5206 \u00B7 \u5404\u8D39\u7528\u79CD\u7C7B\u6C47\u603B
          <span class="text-muted" style="font-weight:400;font-size:13px;">\uFF08\u70B9\u51FB\u627F\u8FD0\u5546\u5C55\u5F00\u8BE6\u7EC6\u8D39\u7528\uFF09</span>
        </div>
        <div class="flex gap-8">
          <select class="form-control form-control--sm" onchange="App.onReportEntityChange('ap', this.value)">
            <option value="">\u5168\u90E8\u627F\u8FD0\u5546</option>
            ${entities.map(e => `<option value="${Util.esc(e)}" ${state.entity === e ? 'selected' : ''}>${Util.esc(e)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="card__body--flush">
        <div class="table-wrap">
          ${carrierRows.length === 0 ? `
            <div class="empty-state"><p>\u6682\u65E0\u6570\u636E</p></div>
          ` : `
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:40px">\u5E8F\u53F7</th>
                  <th>\u627F\u8FD0\u5546\u540D\u79F0</th>
                  <th>\u8D39\u7528\u79CD\u7C7B\u6C47\u603B</th>
                  <th class="text-right">\u91D1\u989D\u5408\u8BA1</th>
                  <th class="text-right">\u5DF2\u4ED8\u91D1\u989D</th>
                  <th class="text-right">\u672A\u4ED8\u91D1\u989D</th>
                  <th class="text-right">\u4ED8\u6B3E\u7387</th>
                </tr>
              </thead>
              <tbody>
                ${carrierRows.map((g, idx) => {
                  const catEntries = Object.entries(g.catMap).sort((a, b) => b[1].total - a[1].total);
                  const catSummary = catEntries.map(([cat, val]) =>
                    `<span class="tag tag--neutral" style="margin:2px 4px 2px 0;">${cat}: ${Util.fmtNum(val.total)}</span>`
                  ).join('');
                  const isSelected = state.entity === g.name;
                  return `
                    <tr style="cursor:pointer;${isSelected ? 'background:var(--page-brand-soft);' : ''}" onclick="App.onReportEntityChange('ap', '${Util.esc(g.name)}')">
                      <td class="text-center">${idx + 1}</td>
                      <td>
                        <div class="flex-center gap-8">
                          ${isSelected ? '<span class="tag tag--info">\u5DF2\u9009\u4E2D</span>' : ''}
                          <strong>${Util.esc(g.name)}</strong>
                        </div>
                        <div class="text-muted" style="font-size:12px;margin-top:2px;">${g.count} \u7B14\u8BB0\u5F55</div>
                      </td>
                      <td>
                        <div style="line-height:1.8;">${catSummary}</div>
                      </td>
                      <td class="text-right num"><strong>${Util.fmtNum(g.total)}</strong></td>
                      <td class="text-right num text-success">${Util.fmtNum(g.paid)}</td>
                      <td class="text-right num text-danger">${Util.fmtNum(g.unpaid)}</td>
                      <td class="text-right">${g.total ? (g.paid / g.total * 100).toFixed(1) : 0}%</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
              <tfoot>
                <tr class="sum-row">
                  <td colspan="3">\u5408\u8BA1</td>
                  <td class="text-right num">${Util.fmtNum(totalAmt)}</td>
                  <td class="text-right num">${Util.fmtNum(totalPaid)}</td>
                  <td class="text-right num">${Util.fmtNum(totalUnpaid)}</td>
                  <td class="text-right">${totalAmt ? (totalPaid / totalAmt * 100).toFixed(1) : 0}%</td>
                </tr>
              </tfoot>
            </table>
          `}
        </div>
      </div>
    </div>

    <div class="card mb-24">
      <div class="card__header">
        <div class="card__title">
          ${state.entity ? Util.esc(state.entity) + ' \u8D39\u7528\u660E\u7EC6' : '\u5168\u90E8\u627F\u8FD0\u5546\u8D39\u7528\u7C7B\u578B\u6C47\u603B'}
        </div>
        <div class="flex gap-8 flex-wrap">
          ${state.entity ? `<span class="tag tag--info">\u5F53\u524D\u627F\u8FD0\u5546: ${Util.esc(state.entity)}</span>` : ''}
          ${state.entity ? `<button class="btn btn--ghost btn--sm" onclick="App.onReportEntityChange('ap', '')">\u67E5\u770B\u5168\u90E8</button>` : ''}
        </div>
      </div>
      <div class="card__body--flush">
        ${renderAPCatDetailTable(state.entity ? data.filter(r => r.supplierName === state.entity) : data)}
      </div>
    </div>

    <div class="chart-grid">
      <div class="chart-card">
        <div class="chart-card__title">\u627F\u8FD0\u5546\u5E94\u4ED8\u6392\u540D Top 10</div>
        <div class="chart-card__desc">\u6309\u5E94\u4ED8\u603B\u989D\u6392\u5E8F</div>
        <div id="ap-report-top10" class="chart-container"></div>
      </div>
      <div class="chart-card">
        <div class="chart-card__title">\u8D39\u7528\u79CD\u7C7B\u5206\u5E03</div>
        <div class="chart-card__desc">${state.entity ? Util.esc(state.entity) : '\u5168\u90E8\u627F\u8FD0\u5546'} \u5404\u8D39\u7528\u7C7B\u578B\u5360\u6BD4</div>
        <div id="ap-report-cat-pie" class="chart-container"></div>
      </div>
      <div class="chart-card" style="grid-column: 1 / -1;">
        <div class="chart-card__title">\u8FD16\u6708\u5E94\u4ED8\u8D8B\u52BF</div>
        <div class="chart-card__desc">\u5E94\u4ED8\u603B\u989D\u3001\u5DF2\u4ED8\u3001\u672A\u4ED8\u6708\u5EA6\u53D8\u5316\u8D8B\u52BF</div>
        <div id="ap-report-trend" class="chart-container chart-container--lg"></div>
      </div>
    </div>
  `;

  document.getElementById('page-ap-report').innerHTML = html;
  initAPReportCharts(data, flowData, carrierRows, state);
}

function renderAPCatDetailTable(filtered) {
  const catMap = {};
  filtered.forEach(r => {
    if (!catMap[r.expenseCategory]) catMap[r.expenseCategory] = { category: r.expenseCategory, total: 0, count: 0 };
    catMap[r.expenseCategory].total += r.amount;
    catMap[r.expenseCategory].count += 1;
  });
  const rows = Object.values(catMap).sort((a, b) => b.total - a.total);
  const total = rows.reduce((s, x) => s + x.total, 0);

  if (rows.length === 0) return '<div class="empty-state"><p>\u6682\u65E0\u6570\u636E</p></div>';

  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:40px">\u5E8F\u53F7</th>
            <th>\u8D39\u7528\u79CD\u7C7B</th>
            <th class="text-right">\u91D1\u989D\u5408\u8BA1</th>
            <th class="text-right">\u5360\u6BD4</th>
            <th class="text-center">\u8BB0\u5F55\u6570</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((g, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td>${g.category}</td>
              <td class="text-right num"><strong>${Util.fmtNum(g.total)}</strong></td>
              <td class="text-right">${total ? (g.total / total * 100).toFixed(1) : 0}%</td>
              <td class="text-center">${g.count}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr class="sum-row">
            <td colspan="2">\u5408\u8BA1</td>
            <td class="text-right num">${Util.fmtNum(total)}</td>
            <td class="text-right">100%</td>
            <td class="text-center">${rows.reduce((s, x) => s + x.count, 0)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

function initAPReportCharts(allData, flowData, carrierRows, state) {
  const top10 = carrierRows.slice(0, 10);
  ChartMgr.render('ap-report-top10', {
    tooltip: { trigger: 'axis', appendToBody: true, axisPointer: { type: 'shadow' } },
    grid: { left: 130, right: 30, top: 35, bottom: 30 },
    xAxis: { type: 'value', axisLabel: { color: '#64748B', formatter: v => (v / 10000).toFixed(0) + '\u4E07' } },
    yAxis: { type: 'category', data: top10.map(c => c.name).reverse(), axisLabel: { color: '#475569', fontSize: 12 } },
    series: [
      { name: '\u5DF2\u4ED8', type: 'bar', stack: 'total', data: top10.map(c => Number(c.paid.toFixed(2))).reverse(), itemStyle: { color: '#16A34A' } },
      { name: '\u672A\u4ED8', type: 'bar', stack: 'total', data: top10.map(c => Number(c.unpaid.toFixed(2))).reverse(), itemStyle: { color: '#FF4D4F' } }
    ],
    legend: { data: ['\u5DF2\u4ED8', '\u672A\u4ED8'], top: 0, textStyle: { color: '#64748B' } }
  });

  const catMap = {};
  const filterData = state.entity ? allData.filter(r => r.supplierName === state.entity) : allData;
  filterData.forEach(r => {
    catMap[r.expenseCategory] = (catMap[r.expenseCategory] || 0) + r.amount;
  });
  const catArr = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

  ChartMgr.render('ap-report-cat-pie', {
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: \u00A5{c} ({d}%)' },
    legend: { bottom: 0, textStyle: { color: '#64748B' }, type: 'scroll' },
    color: CHART_COLORS,
    series: [{
      type: 'pie', radius: ['35%', '60%'], center: ['50%', '42%'],
      label: { color: '#475569', formatter: '{d}%', fontSize: 11 },
      data: catArr.map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
    }]
  });

  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
  }
  const trendTotal = months.map(m => allData.filter(r => Util.monthKey(r.date) === m).reduce((s, r) => s + r.amount, 0));
  const trendPaid = months.map(m => flowData.filter(r => Util.monthKey(r.date) === m).reduce((s, r) => s + (r.amount || 0), 0));
  const trendUnpaid = months.map((m, i) => trendTotal[i] - trendPaid[i]);

  ChartMgr.render('ap-report-trend', {
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { data: ['\u5E94\u4ED8\u603B\u989D', '\u5DF2\u4ED8', '\u672A\u4ED8'], top: 0, textStyle: { color: '#64748B' } },
    grid: { left: 70, right: 30, top: 35, bottom: 40 },
    xAxis: { type: 'category', data: months.map(m => Util.monthLabel(m)), axisLabel: { color: '#64748B' } },
    yAxis: { type: 'value', axisLabel: { color: '#64748B', formatter: v => (v / 10000).toFixed(0) + '\u4E07' } },
    series: [
      { name: '\u5E94\u4ED8\u603B\u989D', type: 'bar', data: trendTotal, itemStyle: { color: '#8250DF' } },
      { name: '\u5DF2\u4ED8', type: 'line', data: trendPaid, itemStyle: { color: '#16A34A' }, lineStyle: { width: 2 }, symbolSize: 6 },
      { name: '\u672A\u4ED8', type: 'line', data: trendUnpaid, itemStyle: { color: '#FF4D4F' }, lineStyle: { width: 2 }, symbolSize: 6 }
    ]
  });
}

/* ============================================================
   Import / Export
   ============================================================ */

const ImportExport = {
  showImportModal(type) {
    const config = MODULES[type];
    const isFlow = (type === 'ar-flow' || type === 'ap-flow');
    let requiredHint;
    if (isFlow) {
      requiredHint = '\u5FC5\u586B\u5B57\u6BB5\uFF1A\u65E5\u671F\u3001' + config.entityLabel + '\u3001\u4ED8\u6B3E\u91D1\u989D\uFF08\u8FD0\u5355\u53F7\u3001\u4ED8\u6B3E\u65B9\u5F0F\u3001\u5907\u6CE8\u53EF\u9009\uFF09\uFF1B\u6838\u9500\u72B6\u6001\u7531\u7CFB\u7EDF\u81EA\u52A8\u8BA1\u7B97';
    } else if (type === 'ar') {
      requiredHint = '\u5FC5\u586B\u5B57\u6BB5\uFF1A\u65E5\u671F\u3001\u8FD0\u5355\u53F7\u3001\u5BA2\u6237\u540D\u79F0\u3001\u91D1\u989D\uFF08\u8D39\u7528\u7C7B\u578B\u53EF\u9009\uFF0C\u4E0D\u586B\u9ED8\u8BA4\u201C\u5176\u4ED6\u201D\uFF09';
    } else {
      requiredHint = '\u5FC5\u586B\u5B57\u6BB5\uFF1A\u65E5\u671F\u3001\u8FD0\u5355\u53F7\u3001\u627F\u8FD0\u5546\u540D\u79F0\u3001\u8D39\u7528\u7C7B\u578B\u3001\u91D1\u989D';
    }
    const html = `
      <div class="modal__header">
        <div class="modal__title">\u5BFC\u5165${config.title}\u6570\u636E</div>
        <button class="modal__close" onclick="Modal.close()">&times;</button>
      </div>
      <div class="modal__body">
        <p class="text-muted mb-16">${requiredHint}</p>
        <div class="flex gap-8 mb-16">
          <button class="btn btn--secondary btn--sm" onclick="${isFlow ? `ImportExport.downloadFlowTemplate('${type}')` : `ImportExport.downloadTemplate('${type}')`}">\u2193 \u4E0B\u8F7D\u5BFC\u5165\u6A21\u677F</button>
        </div>
        <div class="import-zone" id="importZone" onclick="document.getElementById('importFileInput').click()">
          <div class="import-zone__icon">\u2634</div>
          <div class="import-zone__text">\u70B9\u51FB\u9009\u62E9\u6587\u4EF6\u6216\u62D6\u62FD\u5230\u6B64\u5904</div>
          <div class="import-zone__hint">\u652F\u6301 CSV \u683C\u5F0F\uFF0C\u81EA\u52A8\u8BC6\u522B UTF-8 / GBK \u7F16\u7801</div>
        </div>
        <input type="file" id="importFileInput" accept=".csv,.txt,.xls,.xlsx" style="display:none" onchange="ImportExport.handleFile('${type}', this.files[0])">
        <div id="importResult" class="mt-16"></div>
      </div>
    `;
    Modal.open(html);
    const zone = document.getElementById('importZone');
    if (zone) {
      zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) this.handleFile(type, e.dataTransfer.files[0]);
      });
    }
  },

  handleFile(type, file) {
    if (!file) return;
    const isFlow = (type === 'ar-flow' || type === 'ap-flow');
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const buf = new Uint8Array(e.target.result);
        const text = decodeFileText(buf);
        const rows = parseCSV(text);
        if (rows.length === 0) {
          this._showResult(false, '\u6587\u4EF6\u4E2D\u672A\u627E\u5230\u6709\u6548\u6570\u636E\u884C\uFF0C\u8BF7\u786E\u8BA4\u6587\u4EF6\u4E3A CSV \u683C\u5F0F\u4E14\u5305\u542B\u8868\u5934\u548C\u6570\u636E\u884C', 0, []);
          return;
        }
        const config = MODULES[type];
        const records = [];
        const errors = [];
        let headersFound = Object.keys(rows[0]);
        let allMatched = headersFound.every(h => HEADER_MAP[h] || HEADER_MAP[h.toLowerCase()]);
        let noneMatched = headersFound.every(h => !HEADER_MAP[h] && !HEADER_MAP[h.toLowerCase()]);
        if (noneMatched) {
          errors.push(`\u8868\u5934\u672A\u88AB\u8BC6\u522B\uFF08\u53EF\u80FD\u662F\u7F16\u7801\u95EE\u9898\uFF09\uFF0C\u5DF2\u6309\u5217\u4F4D\u7F6E\u81EA\u52A8\u5339\u914D\u3002\u5982\u679C\u6570\u636E\u9519\u8BEF\uFF0C\u8BF7\u7528 Excel \u53E6\u5B58\u4E3A\u201CCSV UTF-8(\u9017\u53F7\u5206\u9694)\u201D\u683C\u5F0F\u540E\u91CD\u8BD5`);
        }
        rows.forEach((row, i) => {
          if (isFlow) {
            const mapped = mapFlowImportRow(row, type);
            const required = ['date', config.entityField];
            const missing = required.filter(f => !mapped[f]);
            if (mapped.amount == null || isNaN(mapped.amount)) missing.push('amount');
            if (missing.length > 0) {
              const labels = { date: '\u65E5\u671F', [config.entityField]: config.entityLabel, amount: '\u4ED8\u6B3E\u91D1\u989D' };
              const names = missing.map(f => labels[f] || f).join('\u3001');
              errors.push(`\u7B2C ${i + 2} \u884C\uFF1A\u7F3A\u5C11\u5FC5\u586B\u5B57\u6BB5\uFF08${names}\uFF09`);
              return;
            }
            records.push(mapped);
          } else {
            const mapped = mapImportRow(row, type);
            const required = ['date', 'waybillNumber', config.entityField];
            if (type !== 'ar') required.push('expenseCategory');
            const missing = required.filter(f => !mapped[f]);
            if (mapped.amount == null || isNaN(mapped.amount)) missing.push('amount');
            if (missing.length > 0) {
              const labels = { date: '\u65E5\u671F', waybillNumber: '\u8FD0\u5355\u53F7', [config.entityField]: config.entityLabel, amount: '\u91D1\u989D', expenseCategory: '\u8D39\u7528\u7C7B\u578B' };
              const names = missing.map(f => labels[f] || f).join('\u3001');
              errors.push(`\u7B2C ${i + 2} \u884C\uFF1A\u7F3A\u5C11\u5FC5\u586B\u5B57\u6BB5\uFF08${names}\uFF09`);
              return;
            }
            records.push(mapped);
          }
        });
        if (records.length > 0) {
          Store.bulkAdd(type, records);
        }
        this._showResult(records.length > 0, '', records.length, errors);
        if (isFlow) { renderFlowPage(type); } else { renderListPage(type); }
      } catch (err) {
        this._showResult(false, '\u6587\u4EF6\u89E3\u6790\u5931\u8D25: ' + err.message, 0, []);
      }
    };
    reader.readAsArrayBuffer(file);
  },

  _showResult(success, msg, count, errors) {
    const el = document.getElementById('importResult');
    if (!el) return;
    el.innerHTML = `
      <div class="card" style="background:${success ? '#F0FDF4' : '#FEF2F2'};border-color:${success ? '#BBF7D0' : '#FECACA'};">
        <div class="card__body" style="padding:12px 16px;">
          ${success ? `<p class="text-success">\u2705 \u6210\u529F\u5BFC\u5165 ${count} \u6761\u8BB0\u5F55</p>` : `<p class="text-danger">\u274C ${msg}</p>`}
          ${errors.length > 0 ? `<details style="margin-top:8px;"><summary style="cursor:pointer;font-size:13px;color:var(--page-text-muted);">\u67E5\u770B ${errors.length} \u6761\u9519\u8BEF</summary><ul style="margin-top:8px;font-size:13px;color:var(--danger);">${errors.slice(0, 20).map(e => `<li>${e}</li>`).join('')}</ul></details>` : ''}
        </div>
      </div>
    `;
  },

  downloadTemplate(type) {
    const config = MODULES[type];
    const entityCol = type === 'ar' ? '\u5BA2\u6237\u540D\u79F0' : '\u627F\u8FD0\u5546\u540D\u79F0';
    const catCol = type === 'ar' ? '\u8D39\u7528\u7C7B\u578B(\u53EF\u9009)' : '\u8D39\u7528\u7C7B\u578B';
    const headers = ['\u65E5\u671F', '\u8FD0\u5355\u53F7', entityCol, '\u53D1\u8D27\u5730', '\u76EE\u7684\u5730', catCol, '\u91D1\u989D', '\u5907\u6CE8'];
    const sample = ['2026-09-01', 'WB20260901001', type === 'ar' ? '\u4E0A\u6D77\u4E2D\u8FDC\u7269\u6D41' : '\u4E0A\u6D77\u6377\u8FD0\u8FD0\u8F93\u8F66\u961F', '\u4E0A\u6D77', '\u5317\u4EAC', type === 'ar' ? '' : '\u516C\u8DEF\u8FD0\u8D39', '15000', '\u793A\u4F8B\u6570\u636E'];
    const csv = '\uFEFF' + headers.join(',') + '\n' + sample.join(',');
    this._download(config.title + '_\u5BFC\u5165\u6A21\u677F.csv', csv);
  },

  downloadFlowTemplate(type) {
    const config = MODULES[type];
    const entityCol = type === 'ar-flow' ? '\u5BA2\u6237' : '\u627F\u8FD0\u5546';
    const headers = ['\u65E5\u671F', '\u8FD0\u5355\u53F7', entityCol, '\u4ED8\u6B3E\u65B9\u5F0F', '\u4ED8\u6B3E\u91D1\u989D', '\u5907\u6CE8'];
    const sample = ['2026-09-01', 'WB20260901001', type === 'ar-flow' ? '\u4E0A\u6D77\u8FDC\u6210\u7269\u6D41\u6709\u9650\u516C\u53F8' : '\u4E0A\u6D77\u6377\u8FD0\u8FD0\u8F93\u8F66\u961F', '\u5BF9\u516C\u8F6C\u8D26', '15000', ''];
    const csv = '\uFEFF' + headers.join(',') + '\n' + sample.join(',');
    this._download(config.title + '_\u5BFC\u5165\u6A21\u677F.csv', csv);
  },

  exportCSV(type) {
    const config = MODULES[type];
    const data = Store.get(type);
    if (data.length === 0) { showToast('\u6682\u65E0\u6570\u636E\u53EF\u5BFC\u51FA', 'warning'); return; }
    const entityCol = type === 'ar' ? '\u5BA2\u6237\u540D\u79F0' : '\u627F\u8FD0\u5546\u540D\u79F0';
    const headers = ['\u65E5\u671F', '\u8FD0\u5355\u53F7', entityCol, '\u53D1\u7AD9', '\u5230\u7AD9', '\u8D39\u7528\u79CD\u7C7B', '\u91D1\u989D', '\u5907\u6CE8'];
    const lines = [headers.join(',')];
    data.forEach(r => {
      lines.push([r.date, r.waybillNumber, r[config.entityField], r.origin || '', r.destination || '', r.expenseCategory, r.amount, r.remarks || ''].map(v => '"' + (v || '') + '"').join(','));
    });
    this._download(config.title + '_\u5BFC\u51FA_' + Util.todayStr() + '.csv', '\uFEFF' + lines.join('\n'));
    showToast(`\u5DF2\u5BFC\u51FA ${data.length} \u6761\u8BB0\u5F55`, 'success');
  },

  exportFlowCSV(type) {
    const config = MODULES[type];
    const data = Store.get(type);
    if (data.length === 0) { showToast('\u6682\u65E0\u6570\u636E\u53EF\u5BFC\u51FA', 'warning'); return; }
    const entityCol = type === 'ar-flow' ? '\u5BA2\u6237' : '\u627F\u8FD0\u5546';
    const headers = ['\u65E5\u671F', '\u8FD0\u5355\u53F7', entityCol, '\u4ED8\u6B3E\u65B9\u5F0F', '\u4ED8\u6B3E\u91D1\u989D', '\u5907\u6CE8'];
    const lines = [headers.join(',')];
    data.forEach(r => {
      lines.push([r.date, r.waybillNumber || '', r[config.entityField], r.paymentMethod || '', r.amount, r.remarks || ''].map(v => '"' + (v || '') + '"').join(','));
    });
    this._download(config.title + '_\u5BFC\u51FA_' + Util.todayStr() + '.csv', '\uFEFF' + lines.join('\n'));
    showToast(`\u5DF2\u5BFC\u51FA ${data.length} \u6761\u8BB0\u5F55`, 'success');
  },

  _download(filename, content) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  exportWaybillCSV() {
    const arData = Store.get('ar');
    const apData = Store.get('ap');
    const state = reportState.waybill;

    const waybillMap = {};
    arData.forEach(r => {
      if (!waybillMap[r.waybillNumber]) {
        waybillMap[r.waybillNumber] = {
          waybillNumber: r.waybillNumber, date: r.date, customerName: r.customerName,
          arTotal: 0, apTotal: 0, arCount: 0, apCount: 0
        };
      }
      const w = waybillMap[r.waybillNumber];
      w.arTotal += r.amount; w.arCount += 1;
      if (r.date < w.date) w.date = r.date;
    });
    apData.forEach(r => {
      if (!waybillMap[r.waybillNumber]) {
        waybillMap[r.waybillNumber] = {
          waybillNumber: r.waybillNumber, date: r.date, customerName: '',
          arTotal: 0, apTotal: 0, arCount: 0, apCount: 0
        };
      }
      const w = waybillMap[r.waybillNumber];
      w.apTotal += r.amount; w.apCount += 1;
      if (!w.date || r.date < w.date) w.date = r.date;
    });

    let rows = Object.values(waybillMap).map(w => ({
      ...w,
      grossProfit: w.arTotal - w.apTotal,
      profitRate: w.arTotal ? ((w.arTotal - w.apTotal) / w.arTotal * 100).toFixed(2) + '%' : '0%'
    }));

    if (state.search) {
      const q = state.search.toLowerCase();
      rows = rows.filter(r => r.waybillNumber.toLowerCase().includes(q) || (r.customerName || '').toLowerCase().includes(q));
    }
    if (state.month) rows = rows.filter(r => r.date && r.date.substring(0, 7) === state.month);
    if (state.profitFilter === 'profit') rows = rows.filter(r => r.grossProfit > 0);
    else if (state.profitFilter === 'loss') rows = rows.filter(r => r.grossProfit < 0);

    if (rows.length === 0) { showToast('\u6682\u65E0\u6570\u636E\u53EF\u5BFC\u51FA', 'warning'); return; }

    const headers = ['\u8FD0\u5355\u53F7', '\u65E5\u671F', '\u5BA2\u6237\u540D\u79F0', '\u5E94\u6536\u603B\u989D', '\u5E94\u4ED8\u603B\u989D', '\u6BDB\u5229', '\u6BDB\u5229\u7387', '\u5E94\u6536\u7B14\u6570', '\u5E94\u4ED8\u7B14\u6570'];
    const lines = [headers.join(',')];
    rows.forEach(r => {
      lines.push([
        r.waybillNumber, r.date || '', r.customerName || '',
        r.arTotal.toFixed(2), r.apTotal.toFixed(2),
        r.grossProfit.toFixed(2), r.profitRate,
        r.arCount, r.apCount
      ].map(v => '"' + (v || '') + '"').join(','));
    });

    this._download('\u8FD0\u5355\u660E\u7EC6_' + Util.todayStr() + '.csv', '\uFEFF' + lines.join('\n'));
    showToast('\u5DF2\u5BFC\u51FA ' + rows.length + ' \u6761\u8FD0\u5355', 'success');
  }
};

/* ============================================================
   Forms (Add / Edit / Delete)
   ============================================================ */

const Forms = {
  showAdd(type) {
    const config = MODULES[type];
    const entityCol = type === 'ar' ? '\u5BA2\u6237\u540D\u79F0' : '\u627F\u8FD0\u5546\u540D\u79F0';
    const entities = getEntityList(Store.get(type), config.entityField);
    const html = `
      <div class="modal__header">
        <div class="modal__title">\u65B0\u589E${config.title}\u8BB0\u5F55</div>
        <button class="modal__close" onclick="Modal.close()">&times;</button>
      </div>
      <div class="modal__body">
        <div class="form-row">
          <div class="form-group">
            <label>\u65E5\u671F *</label>
            <input type="date" class="form-control" id="f-date" value="${Util.todayStr()}">
          </div>
          <div class="form-group">
            <label>\u8FD0\u5355\u53F7 *</label>
            <input type="text" class="form-control" id="f-waybill" placeholder="\u5916\u90E8\u63D0\u4F9B\u7684\u8FD0\u5355\u53F7">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group" style="flex:1">
            <label>${entityCol} *</label>
            <input type="text" class="form-control" id="f-entity" list="entity-list" placeholder="\u8F93\u5165\u6216\u9009\u62E9${config.entityLabel}">
            <datalist id="entity-list">
              ${entities.map(e => `<option value="${Util.esc(e)}">`).join('')}
            </datalist>
          </div>
          <div class="form-group">
            <label>${type === 'ar' ? '\u8D39\u7528\u79CD\u7C7B(\u53EF\u9009)' : '\u8D39\u7528\u79CD\u7C7B *'}</label>
            <input type="text" class="form-control" id="f-category" list="category-list" placeholder="\u9009\u62E9\u6216\u8F93\u5165" value="${type === 'ar' ? '' : '\u5176\u4ED6'}">
            <datalist id="category-list">
              ${CATEGORIES.map(c => `<option value="${c}">`).join('')}
            </datalist>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>\u53D1\u7AD9</label>
            <input type="text" class="form-control" id="f-origin" list="city-list" placeholder="\u53D1\u8FD0\u57CE\u5E02">
          </div>
          <div class="form-group">
            <label>\u5230\u7AD9</label>
            <input type="text" class="form-control" id="f-destination" list="city-list" placeholder="\u5230\u8FBE\u57CE\u5E02">
          </div>
        </div>
        <datalist id="city-list">
          ${CITIES.map(c => `<option value="${c}">`).join('')}
        </datalist>
        <div class="form-row">
          <div class="form-group">
            <label>\u91D1\u989D *</label>
            <input type="number" class="form-control" id="f-amount" placeholder="0.00" step="0.01" min="0">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group" style="flex:1">
            <label>\u5907\u6CE8</label>
            <input type="text" class="form-control" id="f-remarks" placeholder="\u53EF\u9009">
          </div>
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn btn--secondary" onclick="Modal.close()">\u53D6\u6D88</button>
        <button class="btn btn--primary" onclick="Forms.save('${type}', null)">\u4FDD\u5B58</button>
      </div>
    `;
    Modal.open(html);
  },

  showEdit(type, id) {
    const config = MODULES[type];
    const r = Store.getById(type, id);
    if (!r) return;
    const entityCol = type === 'ar' ? '\u5BA2\u6237\u540D\u79F0' : '\u627F\u8FD0\u5546\u540D\u79F0';
    const entities = getEntityList(Store.get(type), config.entityField);
    const html = `
      <div class="modal__header">
        <div class="modal__title">\u7F16\u8F91${config.title}\u8BB0\u5F55</div>
        <button class="modal__close" onclick="Modal.close()">&times;</button>
      </div>
      <div class="modal__body">
        <div class="form-row">
          <div class="form-group">
            <label>\u65E5\u671F *</label>
            <input type="date" class="form-control" id="f-date" value="${r.date}">
          </div>
          <div class="form-group">
            <label>\u8FD0\u5355\u53F7 *</label>
            <input type="text" class="form-control" id="f-waybill" value="${Util.esc(r.waybillNumber)}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group" style="flex:1">
            <label>${entityCol} *</label>
            <input type="text" class="form-control" id="f-entity" list="entity-list" value="${Util.esc(r[config.entityField])}">
            <datalist id="entity-list">
              ${entities.map(e => `<option value="${Util.esc(e)}">`).join('')}
            </datalist>
          </div>
          <div class="form-group">
            <label>${type === 'ar' ? '\u8D39\u7528\u79CD\u7C7B(\u53EF\u9009)' : '\u8D39\u7528\u79CD\u7C7B *'}</label>
            <input type="text" class="form-control" id="f-category" list="category-list" placeholder="\u9009\u62E9\u6216\u8F93\u5165" value="${Util.esc(r.expenseCategory || (type === 'ar' ? '' : '\u5176\u4ED6'))}">
            <datalist id="category-list">
              ${CATEGORIES.map(c => `<option value="${c}">`).join('')}
            </datalist>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>\u53D1\u7AD9</label>
            <input type="text" class="form-control" id="f-origin" list="city-list" value="${Util.esc(r.origin)}">
          </div>
          <div class="form-group">
            <label>\u5230\u7AD9</label>
            <input type="text" class="form-control" id="f-destination" list="city-list" value="${Util.esc(r.destination)}">
          </div>
        </div>
        <datalist id="city-list">
          ${CITIES.map(c => `<option value="${c}">`).join('')}
        </datalist>
        <div class="form-row">
          <div class="form-group">
            <label>\u91D1\u989D *</label>
            <input type="number" class="form-control" id="f-amount" value="${r.amount}" step="0.01" min="0">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group" style="flex:1">
            <label>\u5907\u6CE8</label>
            <input type="text" class="form-control" id="f-remarks" value="${Util.esc(r.remarks)}">
          </div>
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn btn--secondary" onclick="Modal.close()">\u53D6\u6D88</button>
        <button class="btn btn--primary" onclick="Forms.save('${type}', '${id}')">\u4FDD\u5B58</button>
      </div>
    `;
    Modal.open(html);
  },

  confirmDelete(type, id) {
    if (!confirm('\u786E\u8BA4\u5220\u9664\u6B64\u8BB0\u5F55\uFF1F')) return;
    Store.delete(type, id);
    renderListPage(type);
    showToast('\u5DF2\u5220\u9664', 'success');
  },

  save(type, id) {
    const config = MODULES[type];
    const date = document.getElementById('f-date').value.trim();
    const waybill = document.getElementById('f-waybill').value.trim();
    const entity = document.getElementById('f-entity').value.trim();
    const category = document.getElementById('f-category').value;
    const origin = document.getElementById('f-origin').value.trim();
    const destination = document.getElementById('f-destination').value.trim();
    const amount = parseFloat(document.getElementById('f-amount').value) || 0;
    const remarks = document.getElementById('f-remarks').value.trim();

    if (!date) { showToast('\u8BF7\u586B\u5199\u65E5\u671F', 'error'); return; }
    if (!waybill) { showToast('\u8BF7\u586B\u5199\u8FD0\u5355\u53F7', 'error'); return; }
    if (!entity) { showToast('\u8BF7\u586B\u5199' + config.entityLabel + '\u540D\u79F0', 'error'); return; }
    if (type === 'ap' && !category) { showToast('\u8BF7\u9009\u62E9\u8D39\u7528\u79CD\u7C7B', 'error'); return; }
    if (amount < 0 || isNaN(amount)) { showToast('\u8BF7\u586B\u5199\u6709\u6548\u91D1\u989D', 'error'); return; }

    const record = {
      date,
      waybillNumber: waybill,
      [config.entityField]: entity,
      origin,
      destination,
      expenseCategory: category || '\u5176\u4ED6',
      amount,
      remarks
    };

    if (id) {
      Store.update(type, id, record);
      showToast('\u5DF2\u4FDD\u5B58\u4FEE\u6539', 'success');
    } else {
      Store.add(type, record);
      showToast('\u5DF2\u65B0\u589E\u8BB0\u5F55', 'success');
    }
    Modal.close();
    renderListPage(type);
  },

  showFlowAdd(type) {
    const config = MODULES[type];
    const entityCol = type === 'ar-flow' ? '\u5BA2\u6237' : '\u627F\u8FD0\u5546';
    const entities = getFlowEntityList(type);
    const html = `
      <div class="modal__header">
        <div class="modal__title">\u65B0\u589E${config.title}\u8BB0\u5F55</div>
        <button class="modal__close" onclick="Modal.close()">&times;</button>
      </div>
      <div class="modal__body">
        <div class="form-row">
          <div class="form-group">
            <label>\u65E5\u671F *</label>
            <input type="date" class="form-control" id="f-date" value="${Util.todayStr()}">
          </div>
          <div class="form-group" style="flex:1">
            <label>\u8FD0\u5355\u53F7</label>
            <input type="text" class="form-control" id="f-waybill" placeholder="\u53EF\u9009\uFF0C\u5173\u8054\u8FD0\u5355">
          </div>
          <div class="form-group" style="flex:1">
            <label>${entityCol} *</label>
            <input type="text" class="form-control" id="f-entity" list="entity-list" placeholder="\u8F93\u5165\u6216\u9009\u62E9${config.entityLabel}">
            <datalist id="entity-list">
              ${entities.map(e => `<option value="${Util.esc(e)}">`).join('')}
            </datalist>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>\u4ED8\u6B3E\u65B9\u5F0F</label>
            <select class="form-control" id="f-payment">
              <option value="">\u8BF7\u9009\u62E9</option>
              ${PAYMENT_METHODS.map(p => `<option value="${p}">${p}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>\u4ED8\u6B3E\u91D1\u989D *</label>
            <input type="number" class="form-control" id="f-amount" placeholder="0.00" step="0.01" min="0">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group" style="flex:1">
            <label>\u5907\u6CE8</label>
            <input type="text" class="form-control" id="f-remarks" placeholder="\u53EF\u9009">
          </div>
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn btn--secondary" onclick="Modal.close()">\u53D6\u6D88</button>
        <button class="btn btn--primary" onclick="Forms.saveFlow('${type}', null)">\u4FDD\u5B58</button>
      </div>
    `;
    Modal.open(html);
  },

  showFlowEdit(type, id) {
    const config = MODULES[type];
    const r = Store.getById(type, id);
    if (!r) return;
    const entityCol = type === 'ar-flow' ? '\u5BA2\u6237' : '\u627F\u8FD0\u5546';
    const entities = getFlowEntityList(type);
    const html = `
      <div class="modal__header">
        <div class="modal__title">\u7F16\u8F91${config.title}\u8BB0\u5F55</div>
        <button class="modal__close" onclick="Modal.close()">&times;</button>
      </div>
      <div class="modal__body">
        <div class="form-row">
          <div class="form-group">
            <label>\u65E5\u671F *</label>
            <input type="date" class="form-control" id="f-date" value="${r.date}">
          </div>
          <div class="form-group" style="flex:1">
            <label>\u8FD0\u5355\u53F7</label>
            <input type="text" class="form-control" id="f-waybill" value="${Util.esc(r.waybillNumber || '')}" placeholder="\u53EF\u9009\uFF0C\u5173\u8054\u8FD0\u5355">
          </div>
          <div class="form-group" style="flex:1">
            <label>${entityCol} *</label>
            <input type="text" class="form-control" id="f-entity" list="entity-list" value="${Util.esc(r[config.entityField])}">
            <datalist id="entity-list">
              ${entities.map(e => `<option value="${Util.esc(e)}">`).join('')}
            </datalist>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>\u4ED8\u6B3E\u65B9\u5F0F</label>
            <select class="form-control" id="f-payment">
              <option value="">\u8BF7\u9009\u62E9</option>
              ${PAYMENT_METHODS.map(p => `<option value="${p}" ${p === r.paymentMethod ? 'selected' : ''}>${p}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>\u4ED8\u6B3E\u91D1\u989D *</label>
            <input type="number" class="form-control" id="f-amount" value="${r.amount}" step="0.01" min="0">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group" style="flex:1">
            <label>\u5907\u6CE8</label>
            <input type="text" class="form-control" id="f-remarks" value="${Util.esc(r.remarks)}">
          </div>
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn btn--secondary" onclick="Modal.close()">\u53D6\u6D88</button>
        <button class="btn btn--primary" onclick="Forms.saveFlow('${type}', '${id}')">\u4FDD\u5B58</button>
      </div>
    `;
    Modal.open(html);
  },

  confirmFlowDelete(type, id) {
    if (!confirm('\u786E\u8BA4\u5220\u9664\u6B64\u8BB0\u5F55\uFF1F')) return;
    Store.delete(type, id);
    renderFlowPage(type);
    showToast('\u5DF2\u5220\u9664', 'success');
  },

  saveFlow(type, id) {
    const config = MODULES[type];
    const date = document.getElementById('f-date').value.trim();
    const waybill = (document.getElementById('f-waybill') || {}).value || '';
    const entity = document.getElementById('f-entity').value.trim();
    const payment = document.getElementById('f-payment').value;
    const amount = parseFloat(document.getElementById('f-amount').value) || 0;
    const remarks = document.getElementById('f-remarks').value.trim();

    if (!date) { showToast('\u8BF7\u586B\u5199\u65E5\u671F', 'error'); return; }
    if (!entity) { showToast('\u8BF7\u586B\u5199' + config.entityLabel + '\u540D\u79F0', 'error'); return; }
    if (amount < 0 || isNaN(amount)) { showToast('\u8BF7\u586B\u5199\u6709\u6548\u91D1\u989D', 'error'); return; }

    const record = {
      date,
      waybillNumber: waybill.trim(),
      [config.entityField]: entity,
      paymentMethod: payment,
      amount,
      remarks
    };

    if (id) {
      Store.update(type, id, record);
      showToast('\u5DF2\u4FDD\u5B58\u4FEE\u6539', 'success');
    } else {
      Store.add(type, record);
      showToast('\u5DF2\u65B0\u589E\u8BB0\u5F55', 'success');
    }
    Modal.close();
    renderFlowPage(type);
  }
};

/* ============================================================
   Page Routing & App Controller
   ============================================================ */

const PAGE_META = {
  'ar-list': { title: '\u5E94\u6536\u660E\u7EC6', subtitle: '\u5BA2\u6237\u8D39\u7528\u660E\u7EC6\u7BA1\u7406' },
  'ap-list': { title: '\u5E94\u4ED8\u660E\u7EC6', subtitle: '\u627F\u8FD0\u5546\u8D39\u7528\u660E\u7EC6\u7BA1\u7406' },
  'ar-flow': { title: '\u5BA2\u6237\u6D41\u6C34', subtitle: '\u5BA2\u6237\u4ED8\u6B3E\u8BB0\u5F55\u7BA1\u7406' },
  'ap-flow': { title: '\u627F\u8FD0\u5546\u6D41\u6C34', subtitle: '\u627F\u8FD0\u5546\u4ED8\u6B3E\u8BB0\u5F55\u7BA1\u7406' },
  'waybill': { title: '\u8FD0\u5355\u6570\u636E', subtitle: '\u8FD0\u5355\u6BDB\u5229\u5206\u6790' },
  'ar-report': { title: '\u5E94\u6536\u62A5\u8868', subtitle: '\u5BA2\u6237\u5E94\u6536\u6C47\u603B\u5206\u6790' },
  'ap-report': { title: '\u5E94\u4ED8\u62A5\u8868', subtitle: '\u627F\u8FD0\u5546\u5E94\u4ED8\u6C47\u603B\u5206\u6790' }
};

const App = {
  _currentPage: 'waybill',
  _editMode: false,
  _editPassword: '123456',

  init() {
    Store.init();
    this._bindNav();
    this._updateLockUI();
    this.navigate('waybill');
  },

  canEdit() {
    return this._editMode;
  },

  toggleEditMode() {
    if (this._editMode) {
      this._editMode = false;
      this._updateLockUI();
      this.navigate(this._currentPage);
      if (typeof showToast === 'function') showToast('\u5DF2\u5207\u6362\u5230\u53EA\u8BFB\u6A21\u5F0F', 'info');
    } else {
      const pwd = prompt('\u8BF7\u8F93\u5165\u7F16\u8F91\u5BC6\u7801\uFF1A');
      if (pwd === null) return;
      if (pwd === this._editPassword) {
        this._editMode = true;
        this._updateLockUI();
        this.navigate(this._currentPage);
        if (typeof showToast === 'function') showToast('\u5DF2\u89E3\u9501\u7F16\u8F91\u6A21\u5F0F', 'success');
      } else {
        alert('\u5BC6\u7801\u9519\u8BEF\uFF0C\u65E0\u6CD5\u7F16\u8F91');
      }
    }
  },

  _updateLockUI() {
    const lockIcon = document.getElementById('lockIcon');
    const lockText = document.getElementById('lockText');
    const lockBtn = document.getElementById('lockBtn');
    const btnClear = document.getElementById('btnClear');
    const btnReset = document.getElementById('btnReset');
    if (this._editMode) {
      if (lockIcon) lockIcon.innerHTML = '&#128275;';
      if (lockText) lockText.textContent = '\u9501\u5B9A\u7F16\u8F91';
      if (lockBtn) lockBtn.className = 'btn btn--primary btn--sm';
      if (btnClear) btnClear.style.display = '';
      if (btnReset) btnReset.style.display = '';
    } else {
      if (lockIcon) lockIcon.innerHTML = '&#128274;';
      if (lockText) lockText.textContent = '\u89E3\u9501\u7F16\u8F91';
      if (lockBtn) lockBtn.className = 'btn btn--secondary btn--sm';
      if (btnClear) btnClear.style.display = 'none';
      if (btnReset) btnReset.style.display = 'none';
    }
  },

  _bindNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        this.navigate(item.dataset.page);
      });
    });
  },

  navigate(page) {
    if (!PAGE_META[page]) page = 'waybill';
    this._currentPage = page;
    document.querySelectorAll('.page-section').forEach(s => s.style.display = 'none');
    const target = document.getElementById('page-' + page);
    if (target) target.style.display = 'block';
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });
    const meta = PAGE_META[page];
    document.getElementById('pageTitle').textContent = meta.title;
    document.getElementById('pageSubtitle').textContent = meta.subtitle;
    switch (page) {
      case 'ar-list': renderListPage('ar'); break;
      case 'ap-list': renderListPage('ap'); break;
      case 'ar-flow': renderFlowPage('ar-flow'); break;
      case 'ap-flow': renderFlowPage('ap-flow'); break;
      case 'waybill': renderWaybillPage(); break;
      case 'ar-report': renderARReport(); break;
      case 'ap-report': renderAPReport(); break;
    }
  },

  onListSearch(type, val) {
    listState[type].search = val;
    listState[type].page = 1;
    listState[type].selectedIds.clear();
    if (type === 'ar-flow' || type === 'ap-flow') renderFlowPage(type);
    else renderListPage(type);
  },

  onListFilter(type, key, val) {
    listState[type][key] = val;
    listState[type].page = 1;
    listState[type].selectedIds.clear();
    if (type === 'ar-flow' || type === 'ap-flow') renderFlowPage(type);
    else renderListPage(type);
  },

  clearListFilters(type) {
    listState[type].search = '';
    listState[type].month = '';
    listState[type].category = '';
    listState[type].verificationStatus = '';
    listState[type].page = 1;
    listState[type].selectedIds.clear();
    renderListPage(type);
  },

  changePage(type, p) {
    listState[type].page = p;
    renderListPage(type);
  },

  toggleSelect(type, id, checked) {
    if (checked) listState[type].selectedIds.add(id);
    else listState[type].selectedIds.delete(id);
    renderListPage(type);
  },

  toggleSelectAll(type, checked) {
    const state = listState[type];
    const data = Store.get(type);
    const filtered = filterRecords(data, state, MODULES[type].entityField);
    const totalPages = Math.ceil(filtered.length / state.pageSize);
    if (state.page > totalPages && totalPages > 0) state.page = 1;
    const start = (state.page - 1) * state.pageSize;
    const pageData = filtered.slice(start, start + state.pageSize);
    if (checked) {
      pageData.forEach(r => state.selectedIds.add(r.id));
    } else {
      pageData.forEach(r => state.selectedIds.delete(r.id));
    }
    renderListPage(type);
  },

  confirmBulkDelete(type) {
    const count = listState[type].selectedIds.size;
    if (count === 0) { showToast('\u8BF7\u5148\u52FE\u9009\u8981\u5220\u9664\u7684\u8BB0\u5F55', 'warning'); return; }
    if (!confirm(`\u786E\u8BA4\u5220\u9664\u9009\u4E2D\u7684 ${count} \u6761\u8BB0\u5F55\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002`)) return;
    Store.bulkDelete(type, [...listState[type].selectedIds]);
    listState[type].selectedIds.clear();
    listState[type].page = 1;
    renderListPage(type);
    showToast(`\u5DF2\u5220\u9664 ${count} \u6761\u8BB0\u5F55`, 'success');
  },

  onFlowSearch(type, val) {
    listState[type].search = val;
    listState[type].page = 1;
    listState[type].selectedIds.clear();
    renderFlowPage(type);
  },

  clearFlowFilters(type) {
    listState[type].search = '';
    listState[type].month = '';
    listState[type].payment = '';
    listState[type].page = 1;
    listState[type].selectedIds.clear();
    renderFlowPage(type);
  },

  toggleFlowSelect(type, id, checked) {
    if (checked) listState[type].selectedIds.add(id);
    else listState[type].selectedIds.delete(id);
    renderFlowPage(type);
  },

  toggleFlowSelectAll(type, checked) {
    const state = listState[type];
    const data = Store.get(type);
    const filtered = filterFlowRecords(data, state, MODULES[type].entityField);
    const totalPages = Math.ceil(filtered.length / state.pageSize);
    if (state.page > totalPages && totalPages > 0) state.page = 1;
    const start = (state.page - 1) * state.pageSize;
    const pageData = filtered.slice(start, start + state.pageSize);
    if (checked) {
      pageData.forEach(r => state.selectedIds.add(r.id));
    } else {
      pageData.forEach(r => state.selectedIds.delete(r.id));
    }
    renderFlowPage(type);
  },

  confirmFlowBulkDelete(type) {
    const count = listState[type].selectedIds.size;
    if (count === 0) { showToast('\u8BF7\u5148\u52FE\u9009\u8981\u5220\u9664\u7684\u8BB0\u5F55', 'warning'); return; }
    if (!confirm(`\u786E\u8BA4\u5220\u9664\u9009\u4E2D\u7684 ${count} \u6761\u8BB0\u5F55\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002`)) return;
    Store.bulkDelete(type, [...listState[type].selectedIds]);
    listState[type].selectedIds.clear();
    listState[type].page = 1;
    renderFlowPage(type);
    showToast(`\u5DF2\u5220\u9664 ${count} \u6761\u8BB0\u5F55`, 'success');
  },

  changeFlowPage(type, p) {
    listState[type].page = p;
    renderFlowPage(type);
  },

  onWaybillSearch(val) {
    reportState.waybill.search = val;
    reportState.waybill.page = 1;
    renderWaybillPage();
  },

  onWaybillFilter(key, val) {
    reportState.waybill[key] = val;
    reportState.waybill.page = 1;
    renderWaybillPage();
  },

  clearWaybillFilters() {
    const w = reportState.waybill;
    w.search = ''; w.month = ''; w.profitFilter = ''; w.route = '';
    w.colFilters = {}; w.activeFilterCol = '';
    w.page = 1;
    renderWaybillPage();
  },

  onWaybillSort(field) {
    const w = reportState.waybill;
    if (w.sortField === field) {
      w.sortDir = w.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      w.sortField = field;
      w.sortDir = 'desc';
    }
    renderWaybillPage();
  },

  toggleWaybillFilter(col) {
    const w = reportState.waybill;
    if (w.activeFilterCol === col) {
      w.activeFilterCol = '';
    } else {
      w.activeFilterCol = col;
    }
    w.page = 1;
    renderWaybillPage();
  },

  onWaybillFilterCheck(col, val, checked) {
    const w = reportState.waybill;
    if (!w.colFilters[col]) w.colFilters[col] = [];
    if (checked) {
      if (!w.colFilters[col].includes(val)) w.colFilters[col].push(val);
    } else {
      w.colFilters[col] = w.colFilters[col].filter(v => v !== val);
    }
  },

  waybillFilterAll(col) {
    reportState.waybill.colFilters[col] = [];
    renderWaybillPage();
  },

  waybillFilterClear(col) {
    const allRows = Object.values(Store.get('ar').reduce((m, r) => {
      if (!m[r.waybillNumber]) m[r.waybillNumber] = {};
      return m;
    }, {}));
    reportState.waybill.colFilters[col] = [];
    renderWaybillPage();
  },

  onWaybillFilterSearch(val) {
    const q = val.toLowerCase();
    document.querySelectorAll('.wb-filter-item').forEach(item => {
      const text = item.querySelector('span').textContent.toLowerCase();
      item.style.display = text.includes(q) ? '' : 'none';
    });
  },

  changeWaybillPage(p) {
    reportState.waybill.page = p;
    renderWaybillPage();
  },

  toggleWaybillDetail(waybillNumber) {
    const id = 'wb-detail-' + waybillNumber.replace(/[^a-zA-Z0-9]/g, '');
    const el = document.getElementById(id);
    if (el) el.style.display = el.style.display === 'none' ? '' : 'none';
  },

  onReportEntityChange(type, name) {
    reportState[type].entity = name;
    if (type === 'ar') renderARReport();
    else renderAPReport();
  },

  onARReportMonthChange(month) {
    reportState.ar.month = month;
    renderARReport();
  },

  onARReportPayStatusChange(val) {
    reportState.ar.payStatus = val;
    renderARReport();
  },

  _arEntityTimer: null,
  onARReportEntityInput(val) {
    clearTimeout(this._arEntityTimer);
    this._arEntityTimer = setTimeout(() => {
      reportState.ar.entity = val.trim();
      renderARReport();
      // Restore focus and cursor position
      const inp = document.querySelector('#pageContent input[placeholder="\u641C\u7D22\u5BA2\u6237..."]');
      if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
    }, 300);
  },

  clearARReportFilters() {
    reportState.ar.month = '';
    reportState.ar.entity = '';
    reportState.ar.payStatus = '';
    renderARReport();
  },

  exportAllData() {
    const allData = {};
    ['ar', 'ap', 'ar-flow', 'ap-flow'].forEach(t => { allData[t] = Store.get(t); });
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '\u7269\u6D41\u8D22\u52A1\u5168\u90E8\u6570\u636E_' + Util.todayStr() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('\u5DF2\u5BFC\u51FA\u5168\u90E8\u6570\u636E', 'success');
  },

  importAllData(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data || typeof data !== 'object') throw new Error('\u683C\u5F0F\u9519\u8BEF');
        const validKeys = ['ar', 'ap', 'ar-flow', 'ap-flow'];
        let count = 0;
        validKeys.forEach(k => {
          if (Array.isArray(data[k])) {
            Store._save(k, data[k]);
            count += data[k].length;
          }
        });
        localStorage.setItem('lm_initialized', '1');
        input.value = '';
        this.navigate(this._currentPage);
        showToast('\u6210\u529F\u5BFC\u5165 ' + count + ' \u6761\u8BB0\u5F55', 'success');
      } catch (err) {
        input.value = '';
        alert('\u5BFC\u5165\u5931\u8D25\uFF1A\u6587\u4EF6\u683C\u5F0F\u4E0D\u6B63\u786E\uFF0C\u8BF7\u9009\u62E9\u5BFC\u51FA\u7684 JSON \u6587\u4EF6');
      }
    };
    reader.readAsText(file);
  },

  clearAllData() {
    if (!confirm('\u786E\u8BA4\u6E05\u7A7A\u6240\u6709\u6570\u636E\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002')) return;
    Store.clear('ar');
    Store.clear('ap');
    Store.clear('ar-flow');
    Store.clear('ap-flow');
    localStorage.setItem('lm_initialized', '1'); // Keep flag so sample data won't auto-regenerate
    this.navigate('ar-list');
    showToast('\u5DF2\u6E05\u7A7A\u6240\u6709\u6570\u636E', 'success');
  },

  resetSampleData() {
    Store.reset();
    localStorage.setItem('lm_initialized', '1');
    this.navigate('ar-list');
    showToast('\u5DF2\u91CD\u7F6E\u4E3A\u793A\u4F8B\u6570\u636E', 'success');
  }
};

document.addEventListener('DOMContentLoaded', function() {
  App.init();
});

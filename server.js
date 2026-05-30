const SUPABASE_URL = 'https://peqqtfvypljvgcorddbn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { title, message, url } = req.body;
  await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${process.env.ONESIGNAL_REST_KEY}`
    },
    body: JSON.stringify({
      app_id: '20b46cc0-1f20-4482-9879-f258a7234c13',
      included_segments: ['Total Subscriptions'],
      headings: { en: title },
      contents: { en: message },
      url: `https://sreecollectionsknl.vercel.app${url}`
    })
  });
  return res.status(200).json({ ok: true });
}

  if (req.headers['x-admin-secret'] !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
if (req.body.action === 'sendPush') {
  const { method, table, filter, body } = req.body;

  const allowedTables = ['orders', 'products', 'coupons', 'returns', 'reviews'];
  if (!allowedTables.includes(table)) {
    return res.status(400).json({ error: 'Invalid table' });
  }

  const allowedMethods = ['GET', 'POST', 'PATCH', 'DELETE'];
  if (!allowedMethods.includes(method)) {
    return res.status(400).json({ error: 'Invalid method' });
  }

  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  if (filter) url += `?${filter}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : ''
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (response.status === 204) return res.status(204).end();
    const data = await response.text();
    res.status(response.status).json(data ? JSON.parse(data) : []);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
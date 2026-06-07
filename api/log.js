// Proxy logging to Google Apps Script webhook (Google Sheets backend)
// Expects env `SHEETS_WEBHOOK_URL` to be the Apps Script web app URL.
const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;
const ADMIN_PASS = process.env.ADMIN_PASS;

console.log('DEBUG: env present:', { SHEETS_WEBHOOK_URL: !!SHEETS_WEBHOOK_URL, ADMIN_PASS: !!ADMIN_PASS });

async function readJsonSafe(req) {
  try {
    return req.body || {};
  } catch (e) {
    return await new Promise((resolve) => {
      let data = '';
      req.on('data', (chunk) => data += chunk);
      req.on('end', () => {
        try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); }
      });
      req.on('error', () => resolve({}));
    });
  }
}

module.exports = async (req, res) => {
  if (!SHEETS_WEBHOOK_URL) return res.status(500).json({error: 'SHEETS_WEBHOOK_URL not configured'});

  try {
    if (req.method === 'POST') {
      const body = await readJsonSafe(req);
      // Forward POST to Apps Script webhook
      const r = await fetch(SHEETS_WEBHOOK_URL, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)});
      const txt = await r.text();
      if (!r.ok) return res.status(r.status).send(txt);
      return res.json({ok: true});
    }

    if (req.method === 'GET') {
      const {admin_pass} = req.query;
      console.log('DEBUG: admin_pass provided:', !!admin_pass);
      console.log('DEBUG: admin_pass matches:', admin_pass === ADMIN_PASS);
      if (!admin_pass || admin_pass !== ADMIN_PASS) return res.status(401).json({error:'unauthorized'});

      const url = `${SHEETS_WEBHOOK_URL}?admin_pass=${encodeURIComponent(admin_pass)}`;
      const r = await fetch(url);
      const txt = await r.text();
      if (!r.ok) return res.status(r.status).send(txt);
      try { return res.json(JSON.parse(txt)); } catch { return res.send(txt); }
    }

    res.status(405).json({error:'method not allowed'});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: err.message});
  }
};

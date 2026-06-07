const express = require('express');
const fetch = global.fetch || require('node-fetch');
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 3000;

const DOWNLOAD_TOKEN = process.env.DOWNLOAD_TOKEN || '';
// Base raw URL for files (folder 'download' in repo)
const RAW_BASE = process.env.GITHUB_RAW_BASE || 'https://raw.githubusercontent.com/roy445/appdownload/main/download';

function checkToken(req) {
  const q = req.query.token;
  if (q && DOWNLOAD_TOKEN && q === DOWNLOAD_TOKEN) return true;
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    const t = auth.slice(7);
    return DOWNLOAD_TOKEN && t === DOWNLOAD_TOKEN;
  }
  return false;
}

app.get('/download/:name', async (req, res) => {
  if (!DOWNLOAD_TOKEN) return res.status(500).send('DOWNLOAD_TOKEN not configured');
  if (!checkToken(req)) return res.status(401).send('unauthorized');
  const name = req.params.name;
  const rawUrl = `${RAW_BASE}/${encodeURIComponent(name)}`;
  try {
    const r = await fetch(rawUrl);
    if (!r.ok) return res.status(r.status).send(`upstream error: ${r.status}`);
    const contentType = r.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
    // stream web ReadableStream to Node stream
    if (r.body && typeof Readable.fromWeb === 'function') {
      const nodeStream = Readable.fromWeb(r.body);
      nodeStream.pipe(res);
    } else {
      const buffer = Buffer.from(await r.arrayBuffer());
      res.end(buffer);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('internal error');
  }
});

app.get('/', (req, res) => res.send('Protected download service')); 

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

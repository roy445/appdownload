const fetch = require('node-fetch');

const OWNER = 'roy445';
const REPO = 'appdownload';
const PATH = 'logs/events.log';

async function getFile(token) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
  const res = await fetch(url, {headers: {Authorization: `token ${token}`, 'User-Agent': 'appdownload-log'}});
  if (res.status === 200) return res.json();
  if (res.status === 404) return null;
  throw new Error(`GitHub GET failed: ${res.status}`);
}

async function putFile(token, content, sha, message) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
  const body = {
    message: message || 'Update logs',
    content: Buffer.from(content).toString('base64'),
  };
  if (sha) body.sha = sha;
  const res = await fetch(url, {method: 'PUT', headers: {Authorization: `token ${token}`, 'User-Agent': 'appdownload-log','Content-Type':'application/json'}, body: JSON.stringify(body)});
  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status}`);
  return res.json();
}

module.exports = async (req, res) => {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const ADMIN_PASS = process.env.ADMIN_PASS;
  if (!GITHUB_TOKEN) return res.status(500).json({error:'GITHUB_TOKEN not configured'});

  try {
    if (req.method === 'POST') {
      const {type, page, extra} = req.body || {};
      const now = new Date().toISOString();
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
      const line = `${now} \t ${type || 'view'} \t ${page || '-'} \t ${ip} \t ${extra || '-'}\n`;

      // get existing
      const file = await getFile(GITHUB_TOKEN);
      let content = '';
      let sha = null;
      if (file && file.content) {
        content = Buffer.from(file.content, 'base64').toString('utf8');
        sha = file.sha;
      }
      content += line;
      await putFile(GITHUB_TOKEN, content, sha, `Log: ${type} ${page} ${now}`);
      return res.json({ok:true});
    }

    if (req.method === 'GET') {
      const {admin_pass, action} = req.query;
      if (!admin_pass || admin_pass !== ADMIN_PASS) return res.status(401).json({error:'unauthorized'});
      // return raw log content
      const file = await getFile(GITHUB_TOKEN);
      const content = file && file.content ? Buffer.from(file.content, 'base64').toString('utf8') : '';
      return res.json({content});
    }

    res.status(405).json({error:'method not allowed'});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: err.message});
  }
};

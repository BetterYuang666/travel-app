const REPO_API = 'https://api.github.com/repos/BetterYuang666/travel-app/contents/data/trips.json';
const ALLOWED_ORIGIN = 'https://betteryuang666.github.io';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'PUT') return res.status(405).json({ error: 'method not allowed' });
  if (!process.env.GITHUB_TOKEN) return res.status(500).json({ error: 'server not configured' });
  const headers = {
    'Authorization': 'token ' + process.env.GITHUB_TOKEN,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'travel-sync-proxy'
  };
  const init = { method: req.method, headers };
  if (req.method === 'PUT') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    body.branch = 'main';
    init.body = JSON.stringify(body);
    init.headers['Content-Type'] = 'application/json';
  }
  try {
    const r = await fetch(REPO_API, init);
    const text = await r.text();
    res.setHeader('Content-Type', 'application/json');
    return res.status(r.status).send(text);
  } catch (e) {
    return res.status(502).json({ error: 'github fetch failed' });
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || token !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { inventory, message } = req.body;

    const OWNER = 'khanmujeebin';
    const REPO  = 'premiumcarhub';
    const PATH  = 'data/inventory.json';

    const ghHeaders = {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
    };

    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
    const getRes  = await fetch(url, { headers: ghHeaders });
    const getJson = await getRes.json();

    if (!getJson.sha) {
      return res.status(500).json({ error: 'Could not read inventory.json: ' + getJson.message });
    }

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: ghHeaders,
      body: JSON.stringify({
        message: message || 'Update inventory',
        content: Buffer.from(JSON.stringify(inventory, null, 2)).toString('base64'),
        sha: getJson.sha,
      }),
    });

    if (!putRes.ok) {
      const err = await putRes.json();
      return res.status(500).json({ error: 'GitHub save failed: ' + JSON.stringify(err) });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

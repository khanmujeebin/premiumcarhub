module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || token !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { filename, contentType, fileData, carData, mediaOnly } = req.body;

    let mediaUrl = '';
    if (fileData && filename && contentType) {
      const buffer = Buffer.from(fileData, 'base64');
      const ext = filename.split('.').pop().toLowerCase();
      const folder = contentType.startsWith('video/') ? 'videos' : 'inventory';
      const pathname = `${folder}/${Date.now()}-${filename}`;

      const uploadRes = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
          'Content-Type': contentType,
          'x-api-version': '7',
          'x-cache-control-max-age': '31536000',
          'x-add-random-suffix': '1',
        },
        body: buffer,
      });

      const blob = await uploadRes.json();
      mediaUrl = blob.url || '';
    }

    if (mediaOnly) {
      return res.status(200).json({ publicUrl: mediaUrl, success: true });
    }

    if (carData) {
      const car = carData;
      car.id = Date.now();

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

      if (!getJson.content) {
        return res.status(500).json({ error: 'GitHub error: ' + getJson.message });
      }

      const current = JSON.parse(Buffer.from(getJson.content, 'base64').toString('utf8'));
      current.unshift(car);

      const putRes = await fetch(url, {
        method: 'PUT',
        headers: ghHeaders,
        body: JSON.stringify({
          message: `Add car: ${car.year} ${car.make} ${car.model}`,
          content: Buffer.from(JSON.stringify(current, null, 2)).toString('base64'),
          sha: getJson.sha,
        }),
      });

      if (!putRes.ok) {
        const err = await putRes.json();
        return res.status(500).json({ error: 'GitHub save failed: ' + JSON.stringify(err) });
      }
    }

    return res.status(200).json({ publicUrl: mediaUrl, success: true });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

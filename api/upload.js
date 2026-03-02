module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || token !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { filename, contentType, fileData, carData } = req.body;

    // Upload image to Vercel Blob
    let imageUrl = '';
    if (fileData && filename && contentType) {
      const buffer = Buffer.from(fileData, 'base64');
      const ext = filename.split('.').pop().toLowerCase();
      const pathname = `inventory/${Date.now()}.${ext}`;

      const uploadRes = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
          'Content-Type': contentType,
          'x-api-version': '7',
        },
        body: buffer,
      });
      const blob = await uploadRes.json();
      imageUrl = blob.url || '';
    }

    // Save car to GitHub inventory.json
    if (carData) {
      // carData arrives as a plain object (already parsed by express)
      const car = carData;
      if (imageUrl) car.images = [imageUrl];
      car.id = Date.now();

      const ghHeaders = {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      };

      const owner = process.env.GITHUB_OWNER;
      const repo  = process.env.GITHUB_REPO;
      const path  = 'data/inventory.json';

      // Get current inventory.json
      const getRes  = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers: ghHeaders });
      const getJson = await getRes.json();

      if (!getJson.content) {
        return res.status(500).json({ error: 'Could not read inventory.json from GitHub: ' + JSON.stringify(getJson) });
      }

      const current = JSON.parse(Buffer.from(getJson.content, 'base64').toString('utf8'));
      current.unshift(car);

      // Save back to GitHub
      const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
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

    return res.status(200).json({ publicUrl: imageUrl, success: true });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

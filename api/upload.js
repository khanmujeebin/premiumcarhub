// /api/upload.js
// Node.js (not Edge). Requires: npm i @vercel/blob
const { put } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Simple bearer pin
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || token !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { filename, contentType, fileData, carData, mediaOnly } = req.body;

    let mediaUrl = '';
    if (fileData && filename && contentType) {
      // Support both raw base64 and data URLs
      const base64 = String(fileData).replace(/^data:.*?;base64,/, '');
      const buffer = Buffer.from(base64, 'base64');

      // NOTE: Server uploads on Vercel are fine for small files (e.g., images).
      // For big videos (>~4.5 MB), switch to the client-upload flow.
      const folder = contentType.startsWith('video/') ? 'videos' : 'inventory';
      const pathname = `${folder}/${Date.now()}-${filename}`;

      // Upload via official SDK (handles headers, versions, URL, etc.)
      const blob = await put(pathname, buffer, {
        access: 'public', // Your store is Public, so returned URL is world-readable
        contentType,
        addRandomSuffix: false,
        // Optional if the Blob store is linked to this Vercel project:
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      mediaUrl = blob.url; // e.g. https://<store-id>.public.blob.vercel-storage.com/pathname
    }

    // If caller only wanted media upload
    if (mediaOnly) {
      return res.status(200).json({ publicUrl: mediaUrl, success: true });
    }

    // If we also persist the car in GitHub
    if (carData) {
      const car = { ...carData, id: Date.now() };
      if (mediaUrl) car.mediaUrl = mediaUrl; // attach uploaded media to the car

      const OWNER = 'khanmujeebin';
      const REPO  = 'premiumcarhub';
      const PATH  = 'data/inventory.json';

      const ghHeaders = {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      };

      const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;

      // Read current file to get SHA
      const getRes = await fetch(url, { headers: ghHeaders });
      if (!getRes.ok) {
        const t = await getRes.text();
        return res.status(500).json({ error: 'GitHub read failed: ' + t });
      }
      const getJson = await getRes.json();
      if (!getJson.content) {
        return res.status(500).json({ error: 'GitHub error: ' + (getJson.message || 'missing content') });
      }

      const current = JSON.parse(Buffer.from(getJson.content, 'base64').toString('utf8'));
      current.unshift(car);

      const putRes = await fetch(url, {
        method: 'PUT',
        headers: ghHeaders,
        body: JSON.stringify({
          message: `Add car: ${car.year} ${car.make} ${car.model}`,
          content: Buffer.from(JSON.stringify(current, null, 2)).toString('base64'),
          sha: getJson.sha, // required to update existing file
        }),
      });

      if (!putRes.ok) {
        const err = await putRes.text();
        return res.status(500).json({ error: 'GitHub save failed: ' + err });
      }
    }

    return res.status(200).json({ publicUrl: mediaUrl, success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

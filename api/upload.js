export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || token !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { filename, contentType, fileData } = req.body;

    if (!filename || !contentType || !fileData) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const base64Data = fileData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const ext = filename.split(".").pop().toLowerCase();
    const pathname = `inventory/${Date.now()}.${ext}`;

    const uploadRes = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${blobToken}`,
        "Content-Type": contentType,
        "x-api-version": "7",
        "x-content-type": contentType,
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Blob upload failed: ${errText}`);
    }

    const result = await uploadRes.json();

    return res.status(200).json({
      publicUrl: result.url,
      success: true
    });

  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: err.message });
  }
}

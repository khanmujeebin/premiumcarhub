module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || token !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { filename, contentType, fileData } = req.body;

    const base64Data = fileData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const ext = filename.split(".").pop().toLowerCase();
    const pathname = `inventory/${Date.now()}.${ext}`;

    const uploadRes = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
        "Content-Type": contentType,
        "x-api-version": "7",
      },
      body: buffer,
    });

    const result = await uploadRes.json();
    return res.status(200).json({ publicUrl: result.url, success: true });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

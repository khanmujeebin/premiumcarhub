import { put } from "@vercel/blob";

export default async function handler(req, res) {
    // Allow CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Check PIN
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token || token !== process.env.ADMIN_PIN) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const { filename, contentType } = req.body;

        if (!filename || !contentType) {
            return res.status(400).json({ error: "Missing filename or contentType" });
        }

        const ext = filename.split(".").pop().toLowerCase();
        const pathname = `inventory/${Date.now()}.${ext}`;

        const blob = await put(pathname, Buffer.from("placeholder"), {
            access: "public",
            contentType: contentType,
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        return res.status(200).json({
            uploadUrl: blob.url,
            publicUrl: blob.url,
            success: true
        });

    } catch (err) {
        console.error("Blob error:", err);
        return res.status(500).json({ error: err.message });
    }
}

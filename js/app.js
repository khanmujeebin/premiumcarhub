import { put } from "@vercel/blob";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token !== process.env.ADMIN_PIN) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { filename, contentType } = req.body;
    const ext = filename.split(".").pop();
    const pathname = `inventory/${Date.now()}.${ext}`;

    const blob = await put(pathname, req, {
        access: "public",
        contentType,
        token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({
        uploadUrl: blob.url,
        publicUrl: blob.url
    });
}

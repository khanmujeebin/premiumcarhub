// api/upload.js
import { handleUpload } from '@vercel/blob/client';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const secret = process.env.ADMIN_SECRET || "";
  const auth = req.headers.get("authorization") || "";

  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const body = await req.json();

    const json = await handleUpload({
      request: req,
      body,
      onBeforeGenerateToken: () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
        addRandomSuffix: false,
      }),
      onUploadCompleted: ({ blob }) => {
        console.log("Uploaded:", blob.url);
      },
    });

    return new Response(JSON.stringify(json), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Upload failed" }), {
      status: 400,
    });
  }
}
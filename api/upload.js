import { handleUpload } from "@vercel/blob/server";

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (token !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const jsonResponse = await handleUpload({
    request: req,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: ["image/*"],
    }),
    onUploadCompleted: async () => {},
  });

  return res.status(200).json(jsonResponse);
}

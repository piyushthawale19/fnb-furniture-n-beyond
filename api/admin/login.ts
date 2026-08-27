export default function handler(req: any, res: any) {
  // Support CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Username and password are required" });
    }

    const expectedUser = (process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME || "").trim();
    const expectedPass = (process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || "").trim();

    if (!expectedUser || !expectedPass) {
      return res.status(500).json({ success: false, error: "Admin credentials are not configured on environment variables." });
    }

    const inputUser = String(username).trim();
    const inputPass = String(password).trim();

    if (inputUser.toLowerCase() === expectedUser.toLowerCase() && inputPass === expectedPass) {
      return res.status(200).json({
        success: true,
        message: "Administrator authenticated successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        error: "Invalid Administrator credentials. Access denied.",
      });
    }
  } catch (err: any) {
    console.error("Vercel Admin Login function error:", err);
    return res.status(500).json({ success: false, error: "Internal server error during authentication" });
  }
}

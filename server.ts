import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set up body parsers for base64 images and JSON payloads (supports high-res direct image uploads)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Initialize GoogleGenAI SDK
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Admin authentication endpoint using environment variables (ADMIN_USERNAME & ADMIN_PASSWORD)
  app.post("/api/admin/login", (req, res) => {
    try {
      const { username, password } = req.body;
      const expectedUsername = process.env.ADMIN_USERNAME;
      const expectedPassword = process.env.ADMIN_PASSWORD;

      if (!username || !password) {
        return res.status(400).json({ success: false, error: "Username and password are required" });
      }

      if (username.trim() === expectedUsername.trim() && password === expectedPassword) {
        return res.json({
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
      console.error("Admin login validation error:", err);
      return res.status(500).json({ success: false, error: "Internal server error during authentication" });
    }
  });

  // Server API endpoint to analyze image and detect color using Gemini 3.5 Flash
  app.post("/api/ai/detect-color", async (req, res) => {
    try {
      const { imageUrl, base64Data, mimeType } = req.body;
      if (!imageUrl && !base64Data) {
        return res.status(400).json({ error: "Missing imageUrl or base64Data parameter" });
      }

      let imagePart;

      if (base64Data) {
        // Clean prefix if present (e.g. "data:image/png;base64,")
        let cleanBase64 = base64Data;
        let finalMime = mimeType || "image/jpeg";

        if (base64Data.startsWith("data:")) {
          const match = base64Data.match(/^data:([^;]+);base64,(.*)$/);
          if (match) {
            finalMime = match[1];
            cleanBase64 = match[2];
          }
        }

        imagePart = {
          inlineData: {
            mimeType: finalMime,
            data: cleanBase64,
          },
        };
      } else if (imageUrl) {
        try {
          const fetchRes = await fetch(imageUrl);
          if (!fetchRes.ok) {
            throw new Error(`Failed to fetch remote image. Status: ${fetchRes.status}`);
          }
          const arrayBuffer = await fetchRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const mime = fetchRes.headers.get("content-type") || "image/jpeg";
          imagePart = {
            inlineData: {
              mimeType: mime,
              data: buffer.toString("base64"),
            },
          };
        } catch (fetchErr: any) {
          console.error("Error fetching remote image URL:", fetchErr);
          return res.status(400).json({ error: `Failed to retrieve remote image: ${fetchErr.message}` });
        }
      }

      if (!imagePart) {
        return res.status(400).json({ error: "Could not decode or download image data" });
      }

      const prompt = "Inspect this furniture or upholstery fabric image and detect the primary dominant color or material shade name. Give a single, highly descriptive premium name like 'Navy Blue', 'Smaragd Green', 'Charcoal Grey', 'Teak Brown', 'Warm Walnut', 'Beige', 'Scarlet Red', 'Cream', 'Olive Wood'. Return ONLY the color name as plain text. No markdown, no explanations, no punctuation.";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [imagePart, { text: prompt }],
        },
      });

      const colorName = response.text?.trim() || "Custom Color";
      console.log(`Detected color for uploaded image: ${colorName}`);
      return res.json({ color: colorName });
    } catch (err: any) {
      console.error("Error detecting color via Gemini AI:", err);
      return res.status(500).json({ error: err.message || "Internal Server Error analyzing image" });
    }
  });

  // Backend dynamic sharing logic that redirects with query parameters so the SPA handles the rest
  app.get("/share/:productId", (req, res) => {
    const { productId } = req.params;
    const color = req.query.color || "";
    console.log(`Backend resolving shared product request: ID ${productId}, Color: ${color}`);
    res.redirect(`/?product=${productId}&color=${encodeURIComponent(color as string)}`);
  });

  // Vite development vs production static file serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static file server configured");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express application running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal error starting Express server:", err);
});

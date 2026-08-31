import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initializer for Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured in server environment or request."
    );
  }
  // User-Agent set to aistudio-build as per skill guidelines
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// API endpoint to execute an Agent Flow Step
app.post("/api/generate-step", async (req: Request, res: Response) => {
  try {
    const {
      provider = "gemini", // "gemini" | "openai"
      model = "gemini-3.7-flash",
      systemInstruction = "",
      prompt = "",
      temperature = 0.7,
      apiKey: customApiKey,
      stream = false,
    } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required." });
    }

    if (provider === "openai") {
      const apiKey = customApiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error:
            "OpenAI API Key is required. Please provide it in the API settings or set OPENAI_API_KEY.",
        });
      }

      const openaiEndpoint = "https://api.openai.com/v1/chat/completions";
      const messages = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      messages.push({ role: "user", content: prompt });

      const openaiResponse = await fetch(openaiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || "gpt-4o",
          messages,
          temperature: typeof temperature === "number" ? temperature : 0.7,
        }),
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json().catch(() => ({}));
        return res.status(openaiResponse.status).json({
          error:
            errorData.error?.message ||
            `OpenAI API error: ${openaiResponse.statusText}`,
        });
      }

      const data = await openaiResponse.json();
      const text = data.choices?.[0]?.message?.content || "";
      const usage = data.usage;

      return res.json({
        success: true,
        text,
        provider: "openai",
        model,
        usage,
      });
    }

    // Default: Gemini provider via official @google/genai SDK
    const ai = getGeminiClient(customApiKey);

    // Selected model fallback
    const selectedModel = model || "gemini-3.7-flash";

    const config: any = {
      temperature: typeof temperature === "number" ? temperature : 0.7,
    };

    if (systemInstruction && systemInstruction.trim().length > 0) {
      config.systemInstruction = systemInstruction.trim();
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: prompt,
      config,
    });

    const text = response.text || "";

    return res.json({
      success: true,
      text,
      provider: "gemini",
      model: selectedModel,
      usage: response.usageMetadata,
    });
  } catch (error: any) {
    console.error("Generation error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate content from AI agent step.",
    });
  }
});

// Vite Middleware for development & static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FlowArticle server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

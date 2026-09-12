import dotenv from "dotenv";
dotenv.config({ override: true });

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { getFallbackQuestionsForTopic } from "./server/fallbackQuestions";

function getAIClient(apiKey?: string) {
  const key = (apiKey && typeof apiKey === "string" ? apiKey.trim() : "") || process.env.GEMINI_API_KEY || "";
  if (!key) {
    throw new Error("MISSING_API_KEY");
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory cache to save API quota for repeated topics
const topicCache = new Map<string, { timestamp: number; questions: any[] }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

async function generateWithGemini(topic: string, count: number, modelName: string, apiKey?: string) {
  const prompt = `Bạn là một giáo viên Toán lớp 3 nhiệt huyết. Nhiệm vụ của bạn là tạo ra chính xác ${count} câu hỏi trắc nghiệm Toán học bám sát nội dung bài học: "${topic}" trong Sách giáo khoa Toán 3 (Kết nối tri thức với cuộc sống).

ĐIỀU KIỆN QUAN TRỌNG: 
1. Sử dụng các con số NGẪU NHIÊN khác nhau trong mỗi câu hỏi để học sinh có thể ôn tập nhiều lần bài học này mà không bị trùng lặp đề.
2. Các câu hỏi phải có độ khó đa dạng. Có câu hỏi tính toán, có câu hỏi giải toán có lời văn (liên quan đến thực tế).

Tuân thủ định dạng JSON nghiêm ngặt. Trả về một mảng gồm ${count} object, mỗi object có cấu trúc sau:
- id: số thứ tự (1-${count})
- stageName: Tên màn chơi thú vị, ngắn gọn (VD: "Màn 1: Khu rừng bí ẩn")
- category: Tên dạng toán (VD: "${topic}")
- categoryIcon: 1 emoji đại diện phù hợp
- question: Nội dung câu hỏi rõ ràng, dễ hiểu với học sinh lớp 3
- options: Mảng chứa chính xác 4 chuỗi đáp án (VD: ["10", "12", "15", "20"]). Cần ghi rõ đơn vị nếu có (VD: "12 quả").
- correctIndex: Vị trí của đáp án đúng trong mảng options (0, 1, 2, hoặc 3)
- hint: Câu gợi ý từng bước, khơi gợi tư duy cho bé (tuyệt đối không nói thẳng đáp án)
- explanation: Lời giải chi tiết
`;

  const ai = getAIClient(apiKey);
  const response = await ai.models.generateContent({
    model: modelName,
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            stageName: { type: Type.STRING },
            category: { type: Type.STRING },
            categoryIcon: { type: Type.STRING },
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            correctIndex: { type: Type.INTEGER },
            hint: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["id", "stageName", "category", "categoryIcon", "question", "options", "correctIndex", "hint", "explanation"],
        },
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Không nhận được phản hồi từ AI");
  }
  return JSON.parse(text);
}

function is429Error(err: any): boolean {
  if (!err) return false;
  if (err.status === 429) return true;
  const raw = `${err?.message || ""} ${err?.statusText || ""} ${JSON.stringify(err || {})}`.toLowerCase();
  return (
    raw.includes("429") ||
    raw.includes("resource_exhausted") ||
    raw.includes("quota exceeded") ||
    raw.includes("too many requests") ||
    raw.includes("rate limit") ||
    raw.includes("quota")
  );
}

function isInvalidKeyError(err: any): boolean {
  if (!err) return false;
  if (err.status === 401 || err.status === 403) return true;
  const raw = `${err?.message || ""} ${JSON.stringify(err || {})}`.toLowerCase();
  return (
    (err.status === 400 && raw.includes("key")) ||
    raw.includes("api_key_invalid") ||
    raw.includes("api key not valid") ||
    raw.includes("permission_denied")
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.post("/api/generate-questions-by-topic", async (req, res) => {
    const { topic, count = 10, forceRefresh = false, apiKey } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Thiếu thông tin chủ đề (topic)" });
    }

    const effectiveKey = (apiKey && typeof apiKey === "string" ? apiKey.trim() : "") || process.env.GEMINI_API_KEY || "";
    if (!effectiveKey) {
      const fallback = getFallbackQuestionsForTopic(topic, count);
      return res.json({
        questions: fallback,
        notice: "Đang học với Bộ đề thông minh chuẩn SGK Toán 3 (Miễn phí & không cần API Key).",
        source: "smart_standard",
      });
    }

    // Check cache first to avoid burning quota unnecessarily
    const keyFingerprint = effectiveKey.slice(-6);
    const cacheKey = `${keyFingerprint}_${topic.trim()}_${count}`;
    const cached = topicCache.get(cacheKey);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json({ questions: cached.questions, fromCache: true });
    }

    // Attempt 1: Fast stable model gemini-3.8-flash per gemini-api skill
    try {
      const questions = await generateWithGemini(topic, count, "gemini-3.8-flash", effectiveKey);
      topicCache.set(cacheKey, { timestamp: Date.now(), questions });
      return res.json({ questions });
    } catch (errPrimary: any) {
      console.warn(`[Gemini API] Lỗi tạo câu hỏi:`, errPrimary?.status, errPrimary?.message);

      // Check 429 quota exhausted error immediately
      if (is429Error(errPrimary)) {
        return res.status(429).json({
          error: "API Key hiện tại đã hết hạn mức (lỗi 429). Vui lòng nhập hoặc đổi sang API Key khác để tiếp tục!",
          code: 429,
        });
      }

      // Check invalid key
      if (isInvalidKeyError(errPrimary)) {
        return res.status(401).json({
          error: "API Key không hợp lệ hoặc đã bị vô hiệu hóa. Vui lòng kiểm tra và nhập lại API Key!",
          code: 401,
        });
      }

      // Attempt fallback model gemini-3.1-flash-lite if temporary model glitch
      try {
        const questions = await generateWithGemini(topic, count, "gemini-3.1-flash-lite", effectiveKey);
        topicCache.set(cacheKey, { timestamp: Date.now(), questions });
        return res.json({ questions, fallbackModelUsed: true });
      } catch (errSecondary: any) {
        console.warn("[Gemini API] Lỗi model dự phòng:", errSecondary?.status, errSecondary?.message);

        if (is429Error(errSecondary)) {
          return res.status(429).json({
            error: "API Key hiện tại đã hết hạn mức (lỗi 429). Vui lòng nhập hoặc đổi sang API Key khác để tiếp tục!",
            code: 429,
          });
        }

        if (isInvalidKeyError(errSecondary)) {
          return res.status(401).json({
            error: "API Key không hợp lệ hoặc đã bị vô hiệu hóa. Vui lòng kiểm tra và nhập lại API Key!",
            code: 401,
          });
        }

        return res.status(500).json({
          error: errSecondary?.message || errPrimary?.message || "Không thể tạo câu hỏi lúc này. Vui lòng thử lại sau!",
          code: 500,
        });
      }
    }
  });

  app.post("/api/test-api-key", async (req, res) => {
    const { apiKey } = req.body;
    const key = (apiKey && typeof apiKey === "string" ? apiKey.trim() : "") || process.env.GEMINI_API_KEY || "";
    if (!key) {
      return res.status(400).json({ valid: false, message: "Vui lòng nhập API key" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "1+1=",
      });
      return res.json({ valid: true, message: "Khóa API Gemini hợp lệ 100%!" });
    } catch (err: any) {
      const raw = `${err?.message || ""} ${JSON.stringify(err || {})}`.toLowerCase();
      if (raw.includes("429") || raw.includes("quota") || raw.includes("resource_exhausted")) {
        return res.status(429).json({ valid: false, message: "Khóa đúng nhưng hiện hết hạn mức (429)" });
      }
      return res.status(400).json({ valid: false, message: "Khóa API không hợp lệ hoặc chưa được kích hoạt" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
  });
}

startServer();

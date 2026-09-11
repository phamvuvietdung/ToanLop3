import dotenv from "dotenv";
dotenv.config({ override: true });

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { getFallbackQuestionsForTopic } from "./server/fallbackQuestions";

function getAIClient() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// In-memory cache to save API quota for repeated topics
const topicCache = new Map<string, { timestamp: number; questions: any[] }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

async function generateWithGemini(topic: string, count: number, modelName: string) {
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

  const ai = getAIClient();
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.post("/api/generate-questions-by-topic", async (req, res) => {
    const { topic, count = 10, forceRefresh = false } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Thiếu thông tin chủ đề (topic)" });
    }

    // Check cache first to avoid burning quota
    const cacheKey = `${topic.trim()}_${count}`;
    const cached = topicCache.get(cacheKey);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json({ questions: cached.questions, fromCache: true });
    }

    // Attempt 1: Fast stable model gemini-3.6-flash
    try {
      const questions = await generateWithGemini(topic, count, "gemini-3.6-flash");
      topicCache.set(cacheKey, { timestamp: Date.now(), questions });
      return res.json({ questions });
    } catch (errPrimary: any) {
      const is429 = errPrimary?.status === 429 ||
                    errPrimary?.message?.includes("429") ||
                    errPrimary?.message?.includes("RESOURCE_EXHAUSTED") ||
                    errPrimary?.message?.includes("quota");

      console.warn(`[Gemini API] Lỗi model chính (429 = ${is429}):`, errPrimary?.message);

      // If 429 rate limited, wait 1.5 seconds and attempt with gemini-3.1-flash-lite
      if (is429) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          const questions = await generateWithGemini(topic, count, "gemini-3.1-flash-lite");
          topicCache.set(cacheKey, { timestamp: Date.now(), questions });
          return res.json({ questions, fallbackModelUsed: true });
        } catch (errSecondary: any) {
          console.warn("[Gemini API] Fallback model cũng gặp giới hạn rate limit/quota:", errSecondary?.message);
        }
      }

      // If API quota is completely exhausted, gracefully use intelligent offline fallback
      console.log(`[Fallback] Kích hoạt ngân hàng câu hỏi dự phòng cho chủ đề: "${topic}"`);
      const fallbackQuestions = getFallbackQuestionsForTopic(topic, count);
      return res.json({
        questions: fallbackQuestions,
        isFallback: true,
        notice: "Đang sử dụng ngân hàng bài tập dự phòng do dịch vụ AI tạm thời đạt giới hạn lượt gọi (429)."
      });
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

import { Question } from '../types';
import { getFallbackQuestionsForTopic } from './fallbackQuestions';
import { GoogleGenAI, Type } from '@google/genai';

export interface GenerateResult {
  questions: Question[];
  notice?: string;
}

export class ApiError extends Error {
  code?: number | string;
  constructor(message: string, code?: number | string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

/**
 * Directly generate questions from client using the user's saved API key
 * This enables the app to work 100% on static hosts like GitHub Pages!
 */
async function generateDirectlyWithGemini(
  topic: string,
  count: number,
  apiKey: string
): Promise<Question[]> {
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

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    config: {
      responseMimeType: 'application/json',
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
          required: [
            'id',
            'stageName',
            'category',
            'categoryIcon',
            'question',
            'options',
            'correctIndex',
            'hint',
            'explanation',
          ],
        },
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Không nhận được phản hồi từ AI');
  }
  return JSON.parse(text);
}

function checkIs429(err: any): boolean {
  if (!err) return false;
  if (err.status === 429 || err.code === 429) return true;
  const raw = `${err?.message || ''} ${JSON.stringify(err || {})}`.toLowerCase();
  return (
    raw.includes('429') ||
    raw.includes('resource_exhausted') ||
    raw.includes('quota') ||
    raw.includes('too many requests')
  );
}

/**
 * Universal question generator:
 * Works both with backend server (/api/...) and on static hosting (GitHub Pages).
 */
export async function requestQuestions(
  topic: string,
  count: number = 10,
  apiKey: string,
  forceRefresh: boolean = false
): Promise<GenerateResult> {
  // Step 1: Try server endpoint
  let isStaticHost = false;
  try {
    const response = await fetch('/api/generate-questions-by-topic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        count,
        forceRefresh,
        apiKey,
      }),
    });

    // Check if running on GitHub Pages (static host returning 404 or HTML)
    const contentType = response.headers.get('content-type') || '';
    if (response.status === 404 || contentType.includes('text/html')) {
      isStaticHost = true;
    } else {
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 429 || data.code === 429 || data.error?.includes('429')) {
          throw new ApiError(
            'API Key hiện tại đã hết hạn mức (lỗi 429). Vui lòng nhập hoặc đổi sang API Key khác để tiếp tục!',
            429
          );
        }
        if (response.status === 401 || data.code === 401) {
          throw new ApiError(
            data.error || 'API Key không hợp lệ. Vui lòng kiểm tra lại!',
            401
          );
        }
        throw new ApiError(data.error || 'Lỗi từ máy chủ', response.status);
      }

      return {
        questions: data.questions,
        notice: data.notice,
      };
    }
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network or static host fallback
    isStaticHost = true;
  }

  // Step 2: If on GitHub Pages or static host, generate directly with user's saved Gemini Key
  if (isStaticHost) {
    try {
      const questions = await generateDirectlyWithGemini(topic, count, apiKey);
      return { questions };
    } catch (clientErr: any) {
      if (checkIs429(clientErr)) {
        throw new ApiError(
          'API Key hiện tại đã hết hạn mức (lỗi 429). Vui lòng nhập hoặc đổi sang API Key khác để tiếp tục!',
          429
        );
      }

      const msg = clientErr?.message?.toLowerCase() || '';
      if (msg.includes('api_key_invalid') || msg.includes('not valid') || clientErr?.status === 400 || clientErr?.status === 403) {
        throw new ApiError('API Key không hợp lệ. Vui lòng kiểm tra lại!', 401);
      }

      // If network fails or other error, fallback to rich offline math bank
      console.warn('Direct AI generation failed, using offline fallback:', clientErr);
      const fallback = getFallbackQuestionsForTopic(topic, count);
      return {
        questions: fallback,
        notice: 'Đang dùng bộ câu hỏi ôn tập theo chuẩn SGK Kết nối tri thức.',
      };
    }
  }

  // Fallback default
  const fallback = getFallbackQuestionsForTopic(topic, count);
  return { questions: fallback };
}

import { Question } from '../types';
import { getFallbackQuestionsForTopic } from './fallbackQuestions';
import { GoogleGenAI, Type } from '@google/genai';

export interface GenerateResult {
  questions: Question[];
  notice?: string;
  source: 'ai' | 'smart_standard';
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
 * This enables AI generation to work on static hosts like GitHub Pages.
 */
async function generateDirectlyWithGemini(
  topic: string,
  count: number,
  apiKey: string
): Promise<Question[]> {
  const prompt = `Bạn là một giáo viên Toán lớp 3 nhiệt huyết. Nhiệm vụ của bạn là tạo ra chính xác ${count} câu hỏi trắc nghiệm Toán học bám sát nội dung bài học: "${topic}" trong Sách giáo khoa Toán 3 (Bộ sách Kết nối tri thức với cuộc sống).

ĐIỀU KIỆN BẮT BUỘC VỀ NỘI DUNG BÀI HỌC:
1. ĐÚNG CHỦ ĐỀ: Nếu bài học là Bảng nhân/chia nào (Ví dụ: "Bảng nhân 4, bảng chia 4") thì TẤT CẢ các câu hỏi tính toán và bài toán đố phải bám sát chính xác con số đó (ví dụ số 4), tuyệt đối không nhầm sang bảng nhân chia khác.
2. SỐ LIỆU ĐA DẠNG: Sử dụng các con số ngẫu nhiên khác nhau trong mỗi câu hỏi để học sinh có thể ôn tập nhiều lần bài học này mà không bị trùng lặp đề.
3. ĐA DẠNG CÂU HỎI: Có câu hỏi tính nhẩm nhanh, có câu hỏi bài toán đố có lời văn gắn với thực tế đời sống.

Tuân thủ định dạng JSON nghiêm ngặt. Trả về một mảng gồm ${count} object, mỗi object có cấu trúc sau:
- id: số thứ tự (1-${count})
- stageName: Tên màn chơi thú vị, ngắn gọn (VD: "Màn 1: Thử tài tính nhẩm")
- category: Tên dạng toán (VD: "${topic}")
- categoryIcon: 1 emoji đại diện phù hợp
- question: Nội dung câu hỏi rõ ràng, chuẩn ngữ pháp tiếng Việt dành cho học sinh lớp 3
- options: Mảng chứa chính xác 4 chuỗi đáp án (VD: ["16", "20", "24", "28"]). Cần ghi rõ đơn vị nếu có (VD: "16 bông hoa").
- correctIndex: Vị trí của đáp án đúng trong mảng options (0, 1, 2, hoặc 3)
- hint: Câu gợi ý từng bước, khơi gợi tư duy cho bé (tuyệt đối không nói thẳng đáp án)
- explanation: Lời giải chi tiết
`;

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
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
 * Universal question generator with Hybrid Mode (Phương án 3):
 * - If no API Key: 100% instant generation using smart grade-3 math algorithm (Zero cost, no key needed, no 429 errors!)
 * - If API Key is present: calls Gemini AI (via server or client). If 429 error occurs, notifies and falls back gracefully.
 */
export async function requestQuestions(
  topic: string,
  count: number = 10,
  apiKey?: string,
  forceRefresh: boolean = false
): Promise<GenerateResult> {
  const trimmedKey = apiKey ? apiKey.trim() : '';

  // Mode 1: No API Key -> Default to high-quality smart SGK curriculum generator
  if (!trimmedKey) {
    const fallback = getFallbackQuestionsForTopic(topic, count);
    return {
      questions: fallback,
      notice: 'Đang làm bài với Bộ đề thông minh chuẩn SGK Toán 3 (Miễn phí & không cần API Key).',
      source: 'smart_standard',
    };
  }

  // Mode 2: User provided Gemini API Key -> Attempt AI Generation
  let isStaticHost = false;
  try {
    const response = await fetch('/api/generate-questions-by-topic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        count,
        forceRefresh,
        apiKey: trimmedKey,
      }),
    });

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
        source: 'ai',
      };
    }
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    isStaticHost = true;
  }

  // If on static hosting (GitHub Pages) with API Key, generate directly in browser
  if (isStaticHost) {
    try {
      const questions = await generateDirectlyWithGemini(topic, count, trimmedKey);
      return {
        questions,
        source: 'ai',
      };
    } catch (clientErr: any) {
      if (checkIs429(clientErr)) {
        throw new ApiError(
          'API Key hiện tại đã hết hạn mức (lỗi 429). Vui lòng nhập hoặc đổi sang API Key khác để tiếp tục!',
          429
        );
      }

      const msg = clientErr?.message?.toLowerCase() || '';
      if (
        msg.includes('api_key_invalid') ||
        msg.includes('not valid') ||
        clientErr?.status === 400 ||
        clientErr?.status === 403
      ) {
        throw new ApiError('API Key không hợp lệ. Vui lòng kiểm tra lại!', 401);
      }

      // Network or other error -> Fallback gracefully to smart question generator
      console.warn('AI generation error, using smart generator:', clientErr);
      const fallback = getFallbackQuestionsForTopic(topic, count);
      return {
        questions: fallback,
        notice: 'Tạm thời dùng Bộ đề thông minh chuẩn SGK do kết nối AI bị gián đoạn.',
        source: 'smart_standard',
      };
    }
  }

  const fallback = getFallbackQuestionsForTopic(topic, count);
  return {
    questions: fallback,
    source: 'smart_standard',
  };
}

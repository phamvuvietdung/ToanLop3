import { GoogleGenAI } from '@google/genai';

export interface KeyValidationResult {
  valid: boolean;
  status: 'valid' | 'invalid' | 'quota_exceeded' | 'network_error';
  message: string;
}

/**
 * Validates a Gemini API Key directly by issuing a lightweight probe.
 * Works seamlessly on static client (GitHub Pages) or with server proxy.
 */
export async function testGeminiApiKey(apiKey: string): Promise<KeyValidationResult> {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    return {
      valid: false,
      status: 'invalid',
      message: 'Vui lòng nhập khóa API trước khi kiểm tra.',
    };
  }

  // 1. Try server test endpoint if available
  try {
    const res = await fetch('/api/test-api-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: trimmed }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        valid: Boolean(data.valid),
        status: data.valid ? 'valid' : 'invalid',
        message: data.message || 'Khóa API hợp lệ và sẵn sàng tạo câu hỏi!',
      };
    } else if (res.status === 429) {
      return {
        valid: false,
        status: 'quota_exceeded',
        message: 'Khóa API đúng nhưng hiện đã hết hạn mức sử dụng (Lỗi 429: Quota Exceeded).',
      };
    } else if (res.status === 400 || res.status === 401 || res.status === 403) {
      return {
        valid: false,
        status: 'invalid',
        message: 'Khóa API không chính xác hoặc chưa được kích hoạt. Hãy kiểm tra lại chuỗi ký tự dán vào.',
      };
    }
  } catch {
    // Static host like GitHub Pages where /api/ does not exist -> test directly via GoogleGenAI client SDK
  }

  // 2. Direct client-side validation using @google/genai
  try {
    const ai = new GoogleGenAI({ apiKey: trimmed });
    // Issue a minimal ping prompt (1 token output) to verify key validity and quota
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: '1+1=',
    });

    if (response && response.text) {
      return {
        valid: true,
        status: 'valid',
        message: 'Khóa API Gemini hợp lệ 100% và sẵn sàng hoạt động!',
      };
    }

    return {
      valid: true,
      status: 'valid',
      message: 'Khóa API kết nối thành công!',
    };
  } catch (err: any) {
    const raw = `${err?.message || ''} ${JSON.stringify(err || {})}`.toLowerCase();

    if (
      raw.includes('429') ||
      raw.includes('resource_exhausted') ||
      raw.includes('quota') ||
      raw.includes('too many requests')
    ) {
      return {
        valid: false,
        status: 'quota_exceeded',
        message: 'Khóa API chính xác nhưng hiện đang tạm hết hạn mức (429: Quota Limit). Bé vẫn có thể học với Chế độ Đề chuẩn SGK miễn phí!',
      };
    }

    if (
      raw.includes('api_key_invalid') ||
      raw.includes('not valid') ||
      raw.includes('permission') ||
      raw.includes('forbidden') ||
      err?.status === 400 ||
      err?.status === 403
    ) {
      return {
        valid: false,
        status: 'invalid',
        message: 'Khóa API không hợp lệ. Vui lòng đảm bảo bạn copy đầy đủ từ AI Studio (bắt đầu bằng AIzaSy...).',
      };
    }

    return {
      valid: false,
      status: 'network_error',
      message: `Không thể kết nối đến máy chủ Google (${err?.message || 'Lỗi mạng'}). Vui lòng kiểm tra lại kết nối internet.`,
    };
  }
}

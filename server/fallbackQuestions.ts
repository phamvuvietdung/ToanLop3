import { Question } from '../src/types';

/**
 * Sinh ngân hàng câu hỏi dự phòng chất lượng cao cho Toán lớp 3
 * Được sử dụng khi Gemini API chạm ngưỡng giới hạn (429 Rate Limit/Quota Exceeded)
 * Đảm bảo các bé luôn có bài tập học tập liền mạch 100%, không bị gián đoạn.
 */
export function getFallbackQuestionsForTopic(topic: string, count: number = 10): Question[] {
  const normalized = topic.toLowerCase();

  // Helper random int between min and max inclusive
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  const questions: Question[] = [];

  for (let i = 1; i <= count; i++) {
    let question = '';
    let options: string[] = [];
    let correctIndex = 0;
    let hint = '';
    let explanation = '';
    let stageName = `Màn ${i}: Thử thách`;
    let categoryIcon = '⭐';

    if (normalized.includes('nhân') || normalized.includes('bảng nhân')) {
      categoryIcon = '✖️';
      stageName = `Màn ${i}: Bảng nhân thần tốc`;
      if (i % 2 === 1) {
        // Calculation
        const a = rand(3, 9);
        const b = rand(4, 9);
        const ans = a * b;
        question = `Tính kết quả của phép tính: ${a} × ${b} = ?`;
        const distractors = [ans - a, ans + a, ans - 1, ans + 2].filter(x => x > 0 && x !== ans);
        const opts = Array.from(new Set([ans, ...distractors])).slice(0, 4);
        while (opts.length < 4) opts.push(ans + opts.length * 3);
        opts.sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ans);
        options = opts.map(x => `${x}`);
        hint = `Bé nhớ lại bảng nhân ${a}: ${a} nhân ${b} bằng bao nhiêu nhé!`;
        explanation = `Ta có: ${a} × ${b} = ${ans}.`;
      } else {
        // Word problem
        const boxes = rand(4, 8);
        const itemsPerBox = rand(5, 9);
        const ans = boxes * itemsPerBox;
        question = `Mỗi hộp đựng ${itemsPerBox} cái bánh. Hỏi ${boxes} hộp như thế có tất cả bao nhiêu cái bánh?`;
        const distractors = [ans - itemsPerBox, ans + itemsPerBox, boxes + itemsPerBox, ans + 4];
        const opts = Array.from(new Set([ans, ...distractors])).slice(0, 4);
        while (opts.length < 4) opts.push(ans + opts.length * 2);
        opts.sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ans);
        options = opts.map(x => `${x} cái bánh`);
        hint = `Bé lấy số bánh mỗi hộp nhân với số hộp (${itemsPerBox} × ${boxes}) nhé!`;
        explanation = `Số bánh trong ${boxes} hộp là: ${itemsPerBox} × ${boxes} = ${ans} (cái bánh).`;
      }
    } else if (normalized.includes('chia') || normalized.includes('bảng chia')) {
      categoryIcon = '➗';
      stageName = `Màn ${i}: Phép chia tài ba`;
      const divisor = rand(2, 9);
      const quotient = rand(3, 9);
      const dividend = divisor * quotient;
      if (i % 2 === 1) {
        question = `Kết quả của phép chia ${dividend} : ${divisor} là:`;
        const ans = quotient;
        const opts = [ans, ans + 1, ans - 1, ans + 2].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ans);
        options = opts.map(x => `${x}`);
        hint = `Bé nhẩm xem: ${divisor} nhân với mấy thì bằng ${dividend}?`;
        explanation = `Ta có: ${dividend} : ${divisor} = ${ans} (vì ${divisor} × ${ans} = ${dividend}).`;
      } else {
        question = `Có ${dividend} quyển vở chia đều cho ${divisor} bạn học sinh. Hỏi mỗi bạn nhận được bao nhiêu quyển vở?`;
        const ans = quotient;
        const opts = [ans, ans + 2, ans - 1, ans + 3].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ans);
        options = opts.map(x => `${x} quyển vở`);
        hint = `Bé lấy tổng số vở chia đều cho số bạn: ${dividend} : ${divisor}.`;
        explanation = `Mỗi bạn nhận được số quyển vở là: ${dividend} : ${divisor} = ${ans} (quyển).`;
      }
    } else if (normalized.includes('hình') || normalized.includes('chu vi') || normalized.includes('diện tích') || normalized.includes('góc')) {
      categoryIcon = '📐';
      stageName = `Màn ${i}: Khám phá hình học`;
      if (i % 2 === 1) {
        // Chu vi hình chữ nhật
        const cd = rand(10, 25);
        const cr = rand(5, cd - 2);
        const cv = (cd + cr) * 2;
        question = `Một hình chữ nhật có chiều dài ${cd}cm và chiều rộng ${cr}cm. Chu vi của hình chữ nhật đó là:`;
        const opts = [cv, cv - 4, cv + 4, (cd + cr)].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(cv);
        options = opts.map(x => `${x} cm`);
        hint = `Công thức tính chu vi hình chữ nhật: (Chiều dài + Chiều rộng) × 2 = ?`;
        explanation = `Chu vi hình chữ nhật là: (${cd} + ${cr}) × 2 = ${cd + cr} × 2 = ${cv} (cm).`;
      } else {
        // Chu vi hình vuông
        const canh = rand(4, 15);
        const cv = canh * 4;
        question = `Một mảnh vườn hình vuông có cạnh dài ${canh}m. Chu vi của mảnh vườn đó là:`;
        const opts = [cv, cv - 2, canh * canh, cv + 4].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(cv);
        options = opts.map(x => `${x} m`);
        hint = `Chu vi hình vuông bằng độ dài một cạnh nhân với 4 (${canh} × 4).`;
        explanation = `Chu vi hình vuông là: ${canh} × 4 = ${cv} (m).`;
      }
    } else if (normalized.includes('cộng') || normalized.includes('trừ') || normalized.includes('số đến 1000')) {
      categoryIcon = '➕';
      stageName = `Màn ${i}: Tính nhẩm thông thái`;
      if (i % 2 === 1) {
        const a = rand(120, 550);
        const b = rand(110, 420);
        const sum = a + b;
        question = `Đặt tính rồi tính: ${a} + ${b} = ?`;
        const opts = [sum, sum - 10, sum + 10, sum - 1].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(sum);
        options = opts.map(x => `${x}`);
        hint = `Bé cộng lần lượt từ phải sang trái: hàng đơn vị, hàng chục, rồi đến hàng trăm nhé!`;
        explanation = `Ta thực hiện phép cộng: ${a} + ${b} = ${sum}.`;
      } else {
        const a = rand(450, 950);
        const b = rand(120, 380);
        const diff = a - b;
        question = `Hiệu của hai số ${a} và ${b} là bao nhiêu?`;
        const opts = [diff, diff - 10, diff + 10, a + b].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(diff);
        options = opts.map(x => `${x}`);
        hint = `Muốn tìm hiệu, bé thực hiện phép trừ lấy số lớn trừ số bé: ${a} - ${b}.`;
        explanation = `Hiệu của hai số là: ${a} - ${b} = ${diff}.`;
      }
    } else {
      // General Grade 3 math problem
      categoryIcon = '💡';
      stageName = `Màn ${i}: Bài toán hay`;
      const num1 = rand(12, 35);
      const num2 = rand(3, 5);
      const prod = num1 * num2;
      question = `Một lớp học có ${num2} tổ, mỗi tổ có ${num1} bạn học sinh. Hỏi cả lớp có bao nhiêu bạn học sinh?`;
      const opts = [prod, prod - num1, prod + num2, num1 + num2].sort(() => Math.random() - 0.5);
      correctIndex = opts.indexOf(prod);
      options = opts.map(x => `${x} học sinh`);
      hint = `Bé lấy số học sinh mỗi tổ nhân với số tổ: ${num1} × ${num2}.`;
      explanation = `Số học sinh cả lớp là: ${num1} × ${num2} = ${prod} (học sinh).`;
    }

    questions.push({
      id: i,
      stageName,
      category: topic,
      categoryIcon,
      question,
      options,
      correctIndex,
      hint,
      explanation,
    });
  }

  return questions;
}

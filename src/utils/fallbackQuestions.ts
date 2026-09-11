import { Question } from '../types';

/**
 * Ngân hàng sinh câu hỏi Toán lớp 3 thông minh (Algorithmic Math Generator)
 * Bám sát 100% chương trình SGK Toán 3 (Kết nối tri thức với cuộc sống - Tập 1)
 * Sinh ngẫu nhiên số liệu, lời giải, gợi ý và phương án nhiễu, đảm bảo chơi mãi không trùng!
 */
export function getFallbackQuestionsForTopic(topic: string, count: number = 10): Question[] {
  const normalized = topic.toLowerCase();
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const questions: Question[] = [];

  for (let i = 1; i <= count; i++) {
    let question = '';
    let options: string[] = [];
    let correctIndex = 0;
    let hint = '';
    let explanation = '';
    let stageName = `Màn ${i}: Thử thách`;
    let categoryIcon = '⭐';

    // 1. DẠNG: ĐƠN VỊ ĐO (mm, gam, ml, nhiệt độ)
    if (normalized.includes('mi-li-mét') || normalized.includes('gam') || normalized.includes('mi-li-lít') || normalized.includes('nhiệt độ') || normalized.includes('đo lường')) {
      categoryIcon = '⚖️';
      stageName = `Màn ${i}: Nhà đo lường tài ba`;
      const type = (i + rand(0, 3)) % 4;

      if (type === 0) {
        // mm to cm / cm to mm
        const cm = rand(2, 9);
        const mm = rand(1, 9);
        const totalMm = cm * 10 + mm;
        question = `Đổi: ${cm} cm ${mm} mm = ... mm?`;
        const ans = `${totalMm} mm`;
        const distractors = [`${cm * 10} mm`, `${totalMm + 10} mm`, `${cm + mm} mm`];
        const opts = [ans, ...distractors].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ans);
        options = opts;
        hint = `Bé nhớ quy tắc: 1 cm = 10 mm nhé!`;
        explanation = `Vì 1 cm = 10 mm nên ${cm} cm = ${cm * 10} mm. Do đó: ${cm} cm ${mm} mm = ${cm * 10} + ${mm} = ${totalMm} mm.`;
      } else if (type === 1) {
        // Gam
        const g1 = rand(150, 450);
        const g2 = rand(100, 350);
        const sum = g1 + g2;
        const fruit = pick(['túi cam', 'gói bánh', 'hộp kẹo', 'túi táo']);
        question = `Mẹ mua một ${fruit} cân nặng ${g1} g và một hộp sữa cân nặng ${g2} g. Cả hai món đồ cân nặng tất cả bao nhiêu gam?`;
        const ans = `${sum} g`;
        const opts = [ans, `${sum - 10} g`, `${sum + 20} g`, `${sum - 50} g`].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ans);
        options = opts;
        hint = `Bé thực hiện phép cộng cân nặng của 2 món đồ: ${g1} + ${g2}.`;
        explanation = `Cả hai món đồ cân nặng: ${g1} + ${g2} = ${sum} (g).`;
      } else if (type === 2) {
        // ml
        const bottle = rand(200, 500);
        const drink = rand(50, 150);
        const remain = bottle - drink;
        question = `Một bình nước có ${bottle} ml nước. Bạn An đã uống ${drink} ml nước. Trong bình còn lại bao nhiêu mi-li-lít nước?`;
        const ans = `${remain} ml`;
        const opts = [ans, `${remain + 20} ml`, `${remain - 10} ml`, `${bottle + drink} ml`].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ans);
        options = opts;
        hint = `Bé lấy lượng nước ban đầu trừ đi lượng nước đã uống: ${bottle} - ${drink}.`;
        explanation = `Trong bình còn lại: ${bottle} - ${drink} = ${remain} (ml).`;
      } else {
        // Nhiệt độ
        const tMorning = rand(18, 24);
        const increase = rand(4, 8);
        const tNoon = tMorning + increase;
        question = `Nhiệt độ buổi sáng là ${tMorning}°C. Đến buổi trưa, nhiệt độ tăng thêm ${increase}°C. Hỏi nhiệt độ buổi trưa là bao nhiêu độ C?`;
        const ans = `${tNoon}°C`;
        const opts = [ans, `${tNoon - 2}°C`, `${tNoon + 3}°C`, `${tMorning}°C`].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ans);
        options = opts;
        hint = `Nhiệt độ tăng thêm thì bé làm phép cộng: ${tMorning} + ${increase}.`;
        explanation = `Nhiệt độ buổi trưa là: ${tMorning} + ${increase} = ${tNoon}°C.`;
      }
    }

    // 2. DẠNG: HÌNH HỌC (Hình tròn, trung điểm, góc, chu vi, khối hộp)
    else if (normalized.includes('hình') || normalized.includes('chu vi') || normalized.includes('trung điểm') || normalized.includes('góc') || normalized.includes('khối')) {
      categoryIcon = '📐';
      stageName = `Màn ${i}: Thám tử hình học`;

      if (normalized.includes('tròn') || normalized.includes('bán kính') || normalized.includes('đường kính')) {
        const r = rand(3, 15);
        const d = r * 2;
        if (i % 2 === 1) {
          question = `Một hình tròn có bán kính bằng ${r} cm. Đường kính của hình tròn đó là:`;
          const ans = `${d} cm`;
          const opts = [ans, `${r} cm`, `${d + 2} cm`, `${r * 3} cm`].sort(() => Math.random() - 0.5);
          correctIndex = opts.indexOf(ans);
          options = opts;
          hint = `Bé ghi nhớ: Độ dài đường kính gấp 2 lần bán kính (Đường kính = Bán kính × 2).`;
          explanation = `Đường kính của hình tròn là: ${r} × 2 = ${d} (cm).`;
        } else {
          question = `Một hình tròn có đường kính bằng ${d} cm. Bán kính của hình tròn đó là:`;
          const ans = `${r} cm`;
          const opts = [ans, `${d} cm`, `${d * 2} cm`, `${r + 2} cm`].sort(() => Math.random() - 0.5);
          correctIndex = opts.indexOf(ans);
          options = opts;
          hint = `Bé ghi nhớ: Độ dài bán kính bằng đường kính chia cho 2 (Bán kính = Đường kính : 2).`;
          explanation = `Bán kính hình tròn là: ${d} : 2 = ${r} (cm).`;
        }
      } else if (normalized.includes('trung điểm') || normalized.includes('điểm ở giữa')) {
        const length = rand(6, 20) * 2;
        const half = length / 2;
        question = `Đoạn thẳng AB dài ${length} cm. Điểm M là trung điểm của đoạn thẳng AB. Độ dài đoạn thẳng AM là:`;
        const ans = `${half} cm`;
        const opts = [ans, `${length} cm`, `${half + 2} cm`, `${half - 2} cm`].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ans);
        options = opts;
        hint = `Trung điểm chia đoạn thẳng thành hai đoạn bằng nhau: AM = AB : 2.`;
        explanation = `Độ dài đoạn AM là: ${length} : 2 = ${half} (cm).`;
      } else if (normalized.includes('khối')) {
        const shape = pick(['khối lập phương', 'khối hộp chữ nhật']);
        question = `Một ${shape} có bao nhiêu đỉnh và bao nhiêu mặt?`;
        const ans = `8 đỉnh, 6 mặt`;
        const opts = [ans, `6 đỉnh, 8 mặt`, `8 đỉnh, 12 mặt`, `12 đỉnh, 6 mặt`].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ans);
        options = opts;
        hint = `Bé đếm các mặt và đỉnh của một hộp quà hoặc viên xúc xắc nhé!`;
        explanation = `Mỗi ${shape} đều có 8 đỉnh, 6 mặt và 12 cạnh.`;
      } else {
        // Chu vi chữ nhật hoặc vuông
        if (i % 2 === 1) {
          const cd = rand(8, 20);
          const cr = rand(4, cd - 2);
          const cv = (cd + cr) * 2;
          question = `Tính chu vi hình chữ nhật có chiều dài ${cd} cm và chiều rộng ${cr} cm.`;
          const ans = `${cv} cm`;
          const opts = [ans, `${cd + cr} cm`, `${cv - 4} cm`, `${cd * cr} cm`].sort(() => Math.random() - 0.5);
          correctIndex = opts.indexOf(ans);
          options = opts;
          hint = `Công thức: Chu vi = (Chiều dài + Chiều rộng) × 2.`;
          explanation = `Chu vi hình chữ nhật là: (${cd} + ${cr}) × 2 = ${cv} (cm).`;
        } else {
          const canh = rand(5, 18);
          const cv = canh * 4;
          question = `Một cái bàn hình vuông có cạnh dài ${canh} dm. Chu vi của cái bàn đó là:`;
          const ans = `${cv} dm`;
          const opts = [ans, `${canh * 2} dm`, `${cv + 4} dm`, `${canh * canh} dm`].sort(() => Math.random() - 0.5);
          correctIndex = opts.indexOf(ans);
          options = opts;
          hint = `Công thức: Chu vi hình vuông = Độ dài một cạnh × 4.`;
          explanation = `Chu vi cái bàn là: ${canh} × 4 = ${cv} (dm).`;
        }
      }
    }

    // 3. DẠNG: TÌM THÀNH PHẦN CHƯA BIẾT (x + a = b, x - a = b, a × x = b...)
    else if (normalized.includes('thành phần')) {
      categoryIcon = '🔍';
      stageName = `Màn ${i}: Đi tìm ẩn số x`;
      const formType = rand(1, 4);

      if (formType === 1) {
        // x + a = b -> x = b - a
        const x = rand(25, 90);
        const a = rand(15, 60);
        const b = x + a;
        question = `Tìm x, biết: x + ${a} = ${b}`;
        const ans = `x = ${x}`;
        const opts = [ans, `x = ${x + 10}`, `x = ${b + a}`, `x = ${x - 5}`].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ans);
        options = opts;
        hint = `Muốn tìm số hạng chưa biết, bé lấy tổng trừ đi số hạng đã biết: x = ${b} - ${a}.`;
        explanation = `Ta có: x = ${b} - ${a} => x = ${x}.`;
      } else if (formType === 2) {
        // x - a = b -> x = b + a
        const a = rand(20, 70);
        const b = rand(30, 80);
        const x = a + b;
        question = `Tìm x, biết: x - ${a} = ${b}`;
        const ans = `x = ${x}`;
        const opts = [ans, `x = ${b - a}`, `x = ${x + 10}`, `x = ${x - 10}`].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ans);
        options = opts;
        hint = `Muốn tìm số bị trừ, bé lấy hiệu cộng với số trừ: x = ${b} + ${a}.`;
        explanation = `Ta có: x = ${b} + ${a} => x = ${x}.`;
      } else if (formType === 3) {
        // a × x = b -> x = b : a
        const a = rand(3, 9);
        const x = rand(4, 9);
        const b = a * x;
        question = `Tìm x, biết: ${a} × x = ${b}`;
        const ans = `x = ${x}`;
        const opts = [ans, `x = ${x + 1}`, `x = ${x - 1}`, `x = ${x + 2}`].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ans);
        options = opts;
        hint = `Muốn tìm thừa số chưa biết, bé lấy tích chia cho thừa số kia: x = ${b} : ${a}.`;
        explanation = `Ta có: x = ${b} : ${a} => x = ${x}.`;
      } else {
        // x : a = b -> x = b × a
        const a = rand(3, 8);
        const b = rand(4, 9);
        const x = a * b;
        question = `Tìm x, biết: x : ${a} = ${b}`;
        const ans = `x = ${x}`;
        const opts = [ans, `x = ${x + a}`, `x = ${x - a}`, `x = ${b + a}`].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ans);
        options = opts;
        hint = `Muốn tìm số bị chia, bé lấy thương nhân với số chia: x = ${b} × ${a}.`;
        explanation = `Ta có: x = ${b} × ${a} => x = ${x}.`;
      }
    }

    // 4. DẠNG: MỘT PHẦN MẤY (1/2, 1/3, 1/4, 1/5...)
    else if (normalized.includes('một phần mấy')) {
      categoryIcon = '🍰';
      stageName = `Màn ${i}: Phân số kỳ thú`;
      const part = rand(2, 6);
      const total = part * rand(3, 8);
      const val = total / part;
      const item = pick(['quả táo', 'viên bi', 'bông hoa', 'quyển sách']);

      if (i % 2 === 1) {
        question = `Một phần ${part} (1/${part}) của ${total} ${item} là bao nhiêu ${item}?`;
        const ans = `${val} ${item}`;
        const opts = [ans, `${val + 1} ${item}`, `${val - 1} ${item}`, `${val + 2} ${item}`].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ans);
        options = opts;
        hint = `Muốn tìm 1/${part} của ${total}, bé lấy ${total} chia cho ${part}.`;
        explanation = `Ta có: ${total} : ${part} = ${val} (${item}).`;
      } else {
        question = `Bà có ${total} ${item}. Bà đem chia đều cho ${part} cháu. Hỏi mỗi cháu được một phần mấy số ${item} của bà?`;
        const ans = `1/${part}`;
        const opts = [ans, `1/${part + 1}`, `1/${part - 1}`, `1/${total}`].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ans);
        options = opts;
        hint = `Chia đều cho ${part} bạn thì mỗi bạn nhận được một phần mấy?`;
        explanation = `Vì chia đều thành ${part} phần bằng nhau nên mỗi cháu được 1/${part} số ${item}.`;
      }
    }

    // 5. DẠNG: GẤP / GIẢM MỘT SỐ LẦN, SO SÁNH SỐ LỚN GẤP MẤY LẦN SỐ BÉ
    else if (normalized.includes('gấp') || normalized.includes('giảm') || normalized.includes('lớn gấp mấy lần')) {
      categoryIcon = '🚀';
      stageName = `Màn ${i}: Cấp số nhân biến hình`;

      if (normalized.includes('giảm')) {
        const times = rand(2, 5);
        const ans = rand(6, 18);
        const original = ans * times;
        question = `Giảm số ${original} đi ${times} lần thì được kết quả là:`;
        const ansStr = `${ans}`;
        const opts = [ansStr, `${original - times}`, `${ans + 1}`, `${ans - 2}`].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ansStr);
        options = opts;
        hint = `Muốn giảm một số đi nhiều lần, ta lấy số đó chia cho số lần (${original} : ${times}).`;
        explanation = `Ta có: ${original} : ${times} = ${ans}.`;
      } else if (normalized.includes('gấp một số lên')) {
        const times = rand(3, 6);
        const num = rand(7, 15);
        const product = num * times;
        question = `Gấp số ${num} lên ${times} lần thì được số nào dưới đây?`;
        const ansStr = `${product}`;
        const opts = [ansStr, `${num + times}`, `${product - times}`, `${product + 2}`].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ansStr);
        options = opts;
        hint = `Muốn gấp một số lên nhiều lần, ta lấy số đó nhân với số lần (${num} × ${times}).`;
        explanation = `Ta có: ${num} × ${times} = ${product}.`;
      } else {
        // So sánh số lớn gấp mấy lần số bé
        const times = rand(3, 7);
        const small = rand(4, 9);
        const big = small * times;
        const animal = pick(['con gà', 'cây xanh', 'quả bóng']);
        question = `Đoạn dây thứ nhất dài ${big} m, đoạn dây thứ hai dài ${small} m. Hỏi đoạn dây thứ nhất dài gấp mấy lần đoạn dây thứ hai?`;
        const ansStr = `${times} lần`;
        const opts = [ansStr, `${times + 1} lần`, `${times - 1} lần`, `${big - small} lần`].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ansStr);
        options = opts;
        hint = `Muốn tìm số lớn gấp mấy lần số bé, bé lấy số lớn chia cho số bé: ${big} : ${small}.`;
        explanation = `Đoạn thứ nhất dài gấp đoạn thứ hai số lần là: ${big} : ${small} = ${times} (lần).`;
      }
    }

    // 6. DẠNG: BIỂU THỨC SỐ & BÀI TOÁN 2 BƯỚC TÍNH
    else if (normalized.includes('biểu thức') || normalized.includes('hai bước tính')) {
      categoryIcon = '🧩';
      stageName = `Màn ${i}: Chuỗi phép tính thông thái`;

      if (i % 2 === 1) {
        // Biểu thức có ngoặc hoặc nhân chia trước cộng trừ sau
        const a = rand(15, 45);
        const b = rand(2, 6);
        const c = rand(3, 8);
        const res = a + b * c;
        question = `Giá trị của biểu thức: ${a} + ${b} × ${c} là:`;
        const ansStr = `${res}`;
        const wrongOrder = (a + b) * c;
        const opts = [ansStr, `${wrongOrder}`, `${res + 10}`, `${res - 5}`].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ansStr);
        options = opts;
        hint = `Quy tắc: Nhân chia trước, cộng trừ sau! Bé tính ${b} × ${c} trước nhé!`;
        explanation = `Ta thực hiện phép nhân trước: ${b} × ${c} = ${b * c}. Sau đó: ${a} + ${b * c} = ${res}.`;
      } else {
        // Bài toán 2 bước tính
        const b1 = rand(15, 30);
        const b2 = rand(5, 12);
        const ans = b1 + (b1 + b2);
        question = `Thùng thứ nhất có ${b1} lít dầu, thùng thứ hai có nhiều hơn thùng thứ nhất ${b2} lít dầu. Hỏi cả hai thùng có tất cả bao nhiêu lít dầu?`;
        const ansStr = `${ans} lít`;
        const opts = [ansStr, `${b1 + b2} lít`, `${ans - 5} lít`, `${b1 * 2} lít`].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(ansStr);
        options = opts;
        hint = `Bước 1: Tìm số dầu thùng thứ 2 (${b1} + ${b2}). Bước 2: Cộng cả hai thùng lại.`;
        explanation = `Thùng thứ hai có: ${b1} + ${b2} = ${b1 + b2} (lít). Cả hai thùng có: ${b1} + ${b1 + b2} = ${ans} (lít).`;
      }
    }

    // 7. DẠNG: PHÉP CHIA HẾT VÀ CHIA CÓ DƯ
    else if (normalized.includes('chia có dư') || normalized.includes('phép chia hết')) {
      categoryIcon = '➗';
      stageName = `Màn ${i}: Phép chia có số dư`;
      const div = rand(3, 8);
      const quot = rand(4, 9);
      const rem = rand(1, div - 1);
      const dividend = div * quot + rem;

      question = `Thực hiện phép chia: ${dividend} : ${div} được thương và số dư là:`;
      const ansStr = `Thương ${quot}, dư ${rem}`;
      const opts = [
        ansStr,
        `Thương ${quot + 1}, dư ${rem}`,
        `Thương ${quot}, dư ${rem + 1}`,
        `Thương ${quot - 1}, dư 0`,
      ].sort(() => Math.random() - 0.5);
      correctIndex = opts.indexOf(ansStr);
      options = opts;
      hint = `Bé tìm số lớn nhất chia hết cho ${div} mà nhỏ hơn ${dividend}, rồi tìm phần dư.`;
      explanation = `Vì ${div} × ${quot} = ${div * quot} và ${dividend} - ${div * quot} = ${rem} nên ${dividend} : ${div} = ${quot} (dư ${rem}).`;
    }

    // 8. DẠNG: BẢNG NHÂN / BẢNG CHIA (2 đến 9, hoặc nhân chia 2, 3 chữ số)
    else if (normalized.includes('nhân') || normalized.includes('chia') || normalized.includes('phép nhân') || normalized.includes('phép chia')) {
      categoryIcon = '🔢';
      stageName = `Màn ${i}: Siêu sao tính nhẩm`;

      if (normalized.includes('ba chữ số') || normalized.includes('hai chữ số')) {
        // Nhân hoặc chia 2/3 chữ số
        if (i % 2 === 1) {
          const num2 = rand(102, 320);
          const mult = rand(2, 4);
          const prod = num2 * mult;
          question = `Tính: ${num2} × ${mult} = ?`;
          const ansStr = `${prod}`;
          const opts = [ansStr, `${prod + 10}`, `${prod - 20}`, `${prod + mult}`].sort(() => Math.random() - 0.5);
          correctIndex = opts.indexOf(ansStr);
          options = opts;
          hint = `Bé nhân lần lượt từ phải sang trái: ${mult} nhân hàng đơn vị, chục, rồi đến trăm.`;
          explanation = `Ta đặt tính rồi tính: ${num2} × ${mult} = ${prod}.`;
        } else {
          const mult = rand(2, 5);
          const quot = rand(102, 230);
          const dividend = mult * quot;
          question = `Kết quả của phép tính ${dividend} : ${mult} là:`;
          const ansStr = `${quot}`;
          const opts = [ansStr, `${quot + 10}`, `${quot - 10}`, `${quot + 2}`].sort(() => Math.random() - 0.5);
          correctIndex = opts.indexOf(ansStr);
          options = opts;
          hint = `Bé chia lần lượt từ hàng cao nhất (trăm) đến hàng đơn vị.`;
          explanation = `Ta có: ${dividend} : ${mult} = ${quot}.`;
        }
      } else {
        // Bảng nhân chia cơ bản
        let baseNum = 6;
        if (normalized.includes('6')) baseNum = 6;
        else if (normalized.includes('7')) baseNum = 7;
        else if (normalized.includes('8')) baseNum = 8;
        else if (normalized.includes('9')) baseNum = 9;
        else if (normalized.includes('2')) baseNum = 2;
        else if (normalized.includes('3')) baseNum = 3;
        else if (normalized.includes('4')) baseNum = 4;
        else if (normalized.includes('5')) baseNum = 5;
        else baseNum = rand(6, 9);

        if (i % 2 === 1) {
          const k = rand(3, 9);
          const ans = baseNum * k;
          question = `Kết quả của phép tính ${baseNum} × ${k} = ?`;
          const opts = [`${ans}`, `${ans - baseNum}`, `${ans + baseNum}`, `${ans - 1}`].sort(() => Math.random() - 0.5);
          correctIndex = opts.indexOf(`${ans}`);
          options = opts;
          hint = `Bé nhớ lại bảng nhân ${baseNum}: ${baseNum} nhân ${k} bằng bao nhiêu nhé!`;
          explanation = `Ta có: ${baseNum} × ${k} = ${ans}.`;
        } else {
          const k = rand(3, 9);
          const dividend = baseNum * k;
          question = `Kết quả của phép chia ${dividend} : ${baseNum} là:`;
          const opts = [`${k}`, `${k + 1}`, `${k - 1}`, `${k + 2}`].sort(() => Math.random() - 0.5);
          correctIndex = opts.indexOf(`${k}`);
          options = opts;
          hint = `Bé nhẩm xem: ${baseNum} nhân mấy thì bằng ${dividend}?`;
          explanation = `Ta có: ${dividend} : ${baseNum} = ${k} (vì ${baseNum} × ${k} = ${dividend}).`;
        }
      }
    }

    // 9. DẠNG MẶC ĐỊNH: SỐ ĐẾN 1000, CỘNG TRỪ
    else {
      categoryIcon = '💡';
      stageName = `Màn ${i}: Toán hay lớp 3`;
      if (i % 2 === 1) {
        const a = rand(150, 480);
        const b = rand(120, 390);
        const sum = a + b;
        question = `Tính tổng của hai số ${a} và ${b}:`;
        const opts = [`${sum}`, `${sum - 10}`, `${sum + 10}`, `${sum - 1}`].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(`${sum}`);
        options = opts;
        hint = `Bé cộng lần lượt từ hàng đơn vị, chục, đến trăm. Nhớ viết nhớ nếu có nhé!`;
        explanation = `Ta có: ${a} + ${b} = ${sum}.`;
      } else {
        const a = rand(450, 920);
        const b = rand(130, 380);
        const diff = a - b;
        question = `Tính hiệu của hai số ${a} và ${b}:`;
        const opts = [`${diff}`, `${diff - 10}`, `${diff + 10}`, `${diff + 2}`].sort(() => Math.random() - 0.5);
        correctIndex = opts.indexOf(`${diff}`);
        options = opts;
        hint = `Bé trừ từ phải sang trái: lấy ${a} trừ đi ${b}.`;
        explanation = `Ta có: ${a} - ${b} = ${diff}.`;
      }
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

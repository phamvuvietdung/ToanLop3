import { Question } from '../types';

export const MATH_QUESTIONS: Question[] = [
  {
    id: 1,
    stageName: 'Màn 1: Cửa Hàng Bút Chì',
    category: 'Phép nhân số có ba chữ số',
    categoryIcon: '✏️',
    question: 'Một cửa hàng có 8 hộp bút chì màu, mỗi hộp có 120 cái bút. Hỏi cửa hàng đó có tất cả bao nhiêu cái bút chì màu?',
    options: ['860 cái', '900 cái', '960 cái', '1000 cái'],
    correctIndex: 2, // 960 cái
    hint: 'Bé hãy lấy số bút trong mỗi hộp (120) nhân với số hộp (8) nhé: 120 × 8 = ?',
    explanation: 'Số bút chì màu cửa hàng có tất cả là: 120 × 8 = 960 (cái bút).'
  },
  {
    id: 2,
    stageName: 'Màn 2: Chia Vở Cho Lớp Học',
    category: 'Phép chia số có ba chữ số',
    categoryIcon: '📚',
    question: 'Cô giáo chia đều 840 quyển vở cho 4 lớp khối 3. Hỏi mỗi lớp nhận được bao nhiêu quyển vở?',
    options: ['200 quyển', '210 quyển', '220 quyển', '240 quyển'],
    correctIndex: 1, // 210 quyển
    hint: 'Để chia đều, bé hãy lấy tổng số quyển vở (840) chia cho số lớp (4) nhé: 840 : 4 = ?',
    explanation: 'Mỗi lớp nhận được số quyển vở là: 840 : 4 = 210 (quyển vở).'
  },
  {
    id: 3,
    stageName: 'Màn 3: Khu Vườn Xinh Xắn',
    category: 'Hình học - Chu vi hình chữ nhật',
    categoryIcon: '🏡',
    question: 'Một mảnh vườn hình chữ nhật có chiều dài 25m và chiều rộng 15m. Tính chu vi của mảnh vườn đó?',
    options: ['40m', '70m', '80m', '75m'],
    correctIndex: 2, // 80m
    hint: 'Muốn tính chu vi hình chữ nhật, bé lấy (Chiều dài + Chiều rộng) rồi nhân với 2: (25 + 15) × 2 = ?',
    explanation: 'Chu vi mảnh vườn hình chữ nhật là: (25 + 15) × 2 = 40 × 2 = 80 (m).'
  },
  {
    id: 4,
    stageName: 'Màn 4: Mẹ Làm Bánh Trứng',
    category: 'Toán lời văn hai phép tính',
    categoryIcon: '🥚',
    question: 'Mẹ mua 3 vỉ trứng, mỗi vỉ có 12 quả. Mẹ đã dùng hết 14 quả trứng để làm bánh. Hỏi mẹ còn lại bao nhiêu quả trứng?',
    options: ['18 quả', '22 quả', '26 quả', '30 quả'],
    correctIndex: 1, // 22 quả
    hint: 'Bước 1: Tính tổng số trứng mẹ mua (3 × 12). Bước 2: Lấy tổng số trứng trừ đi 14 quả đã dùng.',
    explanation: 'Tổng số trứng mẹ mua là: 3 × 12 = 36 (quả). Số trứng còn lại là: 36 - 14 = 22 (quả).'
  },
  {
    id: 5,
    stageName: 'Màn 5: Thử Thách Cạnh Vuông',
    category: 'Hình học - Diện tích hình vuông',
    categoryIcon: '📐',
    question: 'Cho một hình vuông có độ dài cạnh là 9 cm. Diện tích của hình vuông đó là bao nhiêu?',
    options: ['36 cm²', '72 cm²', '18 cm²', '81 cm²'],
    correctIndex: 3, // 81 cm²
    hint: 'Muốn tính diện tích hình vuông, bé lấy độ dài một cạnh nhân với chính nó (9 × 9 = ?). Đơn vị là cm² nhé!',
    explanation: 'Diện tích của hình vuông đó là: 9 × 9 = 81 (cm²).'
  }
];

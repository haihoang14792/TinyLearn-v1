import { AgeGroup, DevelopmentalDomainId } from './activityTypes.ts';

export type LessonActivityCategory =
  | 'Nhận biết – tập nói'
  | 'Hoạt động với đồ vật'
  | 'Vận động'
  | 'Âm nhạc'
  | 'Nghe kể chuyện – xem tranh'
  | 'Kỹ năng tự phục vụ'
  | 'Nhận biết môi trường xung quanh'
  | 'Hoạt động giác quan'
  | 'Trò chơi tương tác cô và trẻ';

export type LessonTopic =
  | 'Bé và gia đình'
  | 'Cô và các bạn'
  | 'Cơ thể của bé'
  | 'Đồ dùng của bé'
  | 'Đồ chơi'
  | 'Con vật gần gũi'
  | 'Rau – củ – quả'
  | 'Hoa và cây'
  | 'Phương tiện giao thông'
  | 'Ăn uống'
  | 'Vệ sinh'
  | 'Âm thanh quanh bé'
  | 'Thiên nhiên quanh bé';

export interface LessonTwoColumnStep {
  phaseTitle: string; // e.g. "1. Ổn định – gây hứng thú", "2. Hoạt động trọng tâm"
  teacherActivities: string[]; // Hoạt động của cô (lời nói, cử chỉ, dẫn dắt)
  childResponses: string[]; // Dự kiến hoạt động của trẻ (nhìn, chỉ, chạm, phát âm theo khả năng)
}

export interface DetailedLessonPlan {
  id: string; // GA01, GA02...
  code: string; // Mã giáo án e.g. "GA01"
  title: string; // Tên hoạt động
  ageGroup: AgeGroup; // "12-18" | "18-24"
  mainDomain: DevelopmentalDomainId; // Lĩnh vực chính
  combinedDomain?: DevelopmentalDomainId; // Lĩnh vực kết hợp
  category: LessonActivityCategory; // Loại hoạt động
  topic: LessonTopic; // Chủ đề mầm non
  durationMinutes: number; // 12-15 phút (nhà trẻ)

  // I. Mục đích - Yêu cầu (Chuẩn GDMN Nhà trẻ)
  objectives: {
    knowledge: string[]; // Nhận biết / kiến thức phù hợp lứa tuổi
    skills: string[]; // Kỹ năng (chú ý, nghe hiểu, chỉ, phát âm theo khả năng)
    attitude: string[]; // Thái độ (hứng thú, mạnh dạn)
  };

  // II. Chuẩn bị
  preparation: {
    teacher: string[]; // Đồ dùng của cô
    children: string[]; // Đồ dùng của trẻ
    realObjects: string[]; // Đồ vật thật / mô hình trải nghiệm
    tinyLearnApp?: string[]; // Ứng dụng TinyLearn (nếu có bài tương thích)
  };

  // III. Môi trường tổ chức
  environment: string; // Trẻ ngồi gần cô, không gian thảm xốp an toàn...

  // IV. Tiến hành hoạt động (Bảng 2 cột chuẩn)
  steps: LessonTwoColumnStep[];

  // 💻 Tích hợp ứng dụng TinyLearn (Chỉ là một bước kết hợp, không thay thế đồ vật thật)
  tinyLearnIntegration?: {
    gameActivityId?: string; // ID hoạt động trong kho TinyLearn để mở ngay
    promptText: string;
    screenDisplay: string;
    guidance: string;
  };

  // V. Tiêu chí quan sát của giáo viên (Checklist không chấm điểm)
  observationCriteria: string[];

  // Quản lý & Tùy biến
  isCustom?: boolean;
  isFavorite?: boolean;
  lastUsedAt?: number;
  updatedAt?: number;
}

export interface TodayPlanSlot {
  morningActivityId?: string; // Sáng: Nhận biết tập nói
  movementActivityId?: string; // Vận động: Lăn bóng, đi theo hướng thẳng...
  musicActivityId?: string; // Âm nhạc: Nghe hát, vỗ tay...
  date: string; // YYYY-MM-DD
  notes?: string;
}

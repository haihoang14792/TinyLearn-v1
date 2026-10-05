export type GameType =
  | 'listen_find' // Nghe và tìm (câu hỏi hoặc âm thanh -> chọn hình)
  | 'drag_drop' // Kéo thả (kéo hình ảnh vào bóng/đích tương ứng)
  | 'puzzle_jigsaw' // Ghép tranh (cô tùy chỉnh 2, 3, 4, 6 mảnh ghép)
  | 'team_battle' // Thi đấu 2 đội (chia đôi màn hình, thi chạm nhanh ghi điểm)
  | 'touch_explore' // Chạm để nghe (chạm vào hình -> phát âm thanh & tên)
  | 'match_similar' // Tìm hình giống nhau (hiện hình mẫu -> chọn hình giống)
  | 'who_disappeared' // Ai biến mất? (hiện 2-3 hình, 1 hình ẩn đi -> tìm hình vừa biến mất)
  | 'knowledge_bubbles' // Bong bóng kiến thức (chạm bong bóng chứa đáp án)
  | 'color_match'; // Chọn màu sắc (chọn vật phẩm đúng màu yêu cầu)

export interface TopicChoice {
  id: string;
  name: string; // Tên hiển thị: Quả chuối, Con mèo, v.v.
  label?: string;
  imageUrl: string;
  bgColor?: string;
  isCorrect: boolean; // Đúng / Sai
}

export interface TopicItem {
  id: string;
  name: string; // Tên đối tượng: Mèo, Chó, Vịt, Táo, Đỏ...
  imageUrl: string; // Data URL or Image URL or SVG
  soundText: string; // "Meo meo", "Gâu gâu", "Cạp cạp"
  questionText: string; // "Con gì kêu meo meo?"
  audioUrl?: string; // MP3/WAV uploaded or recorded voice (base64 data URL)
  praiseAudioUrl?: string; // Optional custom audio "Giỏi quá"
  bgColor?: string; // Pastel background
  colorName?: string;
  // Extended preschool pedagogy fields
  movementSuggestion?: string; // Gợi ý vận động: "Làm động tác mèo rửa mặt", "Vỗ cánh như chú vịt"
  readingSentence?: string; // Câu đọc cho trẻ: "Đây là con mèo. Mèo kêu meo meo."
  praisePhrase?: string; // Câu khen: "Giỏi quá! Bé tìm đúng bạn Mèo rồi!"
  encouragementPhrase?: string; // Câu động viên: "Bé nghe lại tiếng kêu và thử lại nhé!"
  // Cho phép mỗi câu hỏi có danh sách đáp án riêng biệt (2-6 đáp án)
  choices?: TopicChoice[];
  shuffleChoices?: boolean;
}

export interface TopicGame {
  id: string;
  title: string; // Tên trò chơi: "Bé nghe và tìm con vật"
  topic: string; // "Con vật", "Trái cây", "Màu sắc", "Phương tiện", "Cơ thể bé"...
  category?: string; // 'animals' | 'fruits' | 'vegetables' | 'colors' | 'vehicles' | 'family' | 'objects' | 'body' | 'music' | 'nature'
  ageRange: '12–18 tháng' | '18–24 tháng' | '12–24 tháng';
  gameType: GameType;
  description: string;
  objectives?: string; // Mục tiêu hoạt động: nhận biết, ngôn ngữ, vận động
  isBuiltIn?: boolean;
  choicesCount: number; // Số lượng lựa chọn mặc định (2, 3, 4, v.v.)
  defaultChoiceCount?: number;
  shuffleChoices?: boolean; // Xáo trộn vị trí đáp án khi chơi
  answerType?: 'single' | 'multiple'; // Một đáp án đúng hay nhiều đáp án đúng
  puzzlePieces?: 2 | 3 | 4 | 6; // Số mảnh ghép cho trò ghép tranh (mặc định 4)
  items: TopicItem[];
  createdAt: number;
  lessonPlanId?: string; // ID giáo án liên kết
  isPublic?: boolean;
}

export interface PreschoolSettings {
  autoAdvanceSeconds: number; // 0 = manual, 2 = 2s, 3 = 3s
  speechRate: number; // 0.85 (chậm và dịu dàng)
  speechPitch: number; // 1.0 (tự nhiên)
  voiceMode: 'ai_preferred' | 'browser_only';
  preferredVoiceURI: string;
  enableSSML: boolean; // Bật ngắt nghỉ tự nhiên
  ssmlBreakDurationMs: number; // 450ms
  topicPracticeMode: boolean; // Chế độ Luyện tập theo chủ đề
  audioPromptRepetitions: number; // Số lần lặp lại tự động (1, 2, 3)
  repetitionIntervalSeconds: number; // Khoảng nghỉ giữa các lần lặp (giây)
  enableVisualHintAfterRepeat?: boolean; // Tự động hiển thị viền sáng nhấp nháy đáp án đúng sau lần 2
  enableHaptics: boolean;
  enableSoundEffects: boolean;
  childLockEnabled: boolean;
  teacherPin: string; // Mã PIN giáo viên (mặc định "1234")
  touchTVMode: boolean; // Chế độ TV cảm ứng (nút siêu to, ẩn nút cài đặt)
}

export interface ItemStat {
  name: string;
  correct: number;
  wrong: number;
}

export interface TopicProgressStat {
  topicId: string;
  topicTitle: string;
  correctCount: number;
  wrongCount: number;
  completedRounds: number;
  lastPlayedAt: number;
  itemStats: Record<string, ItemStat>;
}

// ==========================================
// HỒ SƠ TRẺ & THEO DÕI SỰ PHÁT TRIỂN
// ==========================================
export interface ChildProfile {
  id: string;
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  className: string; // "Nhà trẻ D1 (12–18m)", "Nhà trẻ D2 (18–24m)"
  avatarEmoji: string;
  avatarBgColor: string;
  notes?: string;
  createdAt: number;
}

export interface ChildActivityResult {
  id: string;
  childId: string;
  childName: string;
  gameId: string;
  gameTitle: string;
  gameType: GameType;
  correctCount: number;
  attemptCount: number;
  supportCount: number; // Số lần cần viền sáng gợi ý hoặc nhắc lại
  durationSeconds: number;
  skillsDemonstrated: string[]; // ['Nhận biết âm thanh', 'Phối hợp tay - mắt', 'Vận động mô phỏng']
  playedAt: number;
}

// ==========================================
// GIÁO ÁN MẦM NON CHUẨN BỘ GD&ĐT
// ==========================================
export interface LessonPlan {
  id: string;
  gameId: string;
  title: string;
  topic: string;
  ageRange: string;
  durationMinutes: number; // 15–20 phút
  objectives: {
    knowledge: string[]; // Kiến thức
    skills: string[]; // Kỹ năng
    attitude: string[]; // Thái độ
  };
  preparations: {
    teacher: string[]; // Đồ dùng của cô
    children: string[]; // Đồ dùng của trẻ
    itApplication: string[]; // Ứng dụng CNTT (TinyLearn trên TV/Tablet)
  };
  steps: {
    phase: string; // 1. Gây hứng thú, 2. Hoạt động trọng tâm, 3. Trò chơi củng cố, 4. Kết thúc
    duration: string; // "2-3 phút", "10-12 phút"
    activities: string; // Nội dung hoạt động
    teacherGuidance: string; // Hướng dẫn của cô
    childrenResponse: string; // Trẻ phản hồi & hành động
  }[];
  evaluation: string; // Đánh giá & Điều chỉnh theo khả năng từng trẻ
  createdAt: number;
}

// ==========================================
// THƯ VIỆN HỌC LIỆU
// ==========================================
export interface MediaItem {
  id: string;
  title: string;
  category:
    | 'animals'
    | 'fruits'
    | 'vegetables'
    | 'colors'
    | 'vehicles'
    | 'family'
    | 'objects'
    | 'body'
    | 'music'
    | 'nature';
  imageUrl: string;
  soundText: string;
  sampleQuestion: string;
  soundAudioUrl?: string;
  isCustom?: boolean;
}

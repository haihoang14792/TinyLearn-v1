export type AgeGroup = '12-18' | '18-24';

export type DevelopmentalDomainId =
  | 'cognitive' // Phát triển nhận thức
  | 'language' // Phát triển ngôn ngữ
  | 'physical' // Phát triển thể chất
  | 'socio_emotional_aesthetic'; // Phát triển tình cảm, kỹ năng xã hội và thẩm mỹ

export interface DevelopmentalDomain {
  id: DevelopmentalDomainId;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}

export const DEVELOPMENTAL_DOMAINS: DevelopmentalDomain[] = [
  {
    id: 'cognitive',
    name: 'Phát triển nhận thức',
    icon: '💡',
    color: '#D97706',
    bgColor: '#FEF3C7',
    description: 'Nhận biết tập nói về đồ vật, hoa quả, con vật, các bộ phận cơ thể quen thuộc.',
  },
  {
    id: 'language',
    name: 'Phát triển ngôn ngữ',
    icon: '🗣️',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    description: 'Nghe hiểu câu lệnh đơn giản, tập phát âm từ đơn, cụm từ, nhận biết âm thanh.',
  },
  {
    id: 'physical',
    name: 'Phát triển thể chất',
    icon: '🏃',
    color: '#16A34A',
    bgColor: '#DCFCE7',
    description: 'Vận động cơ thể, phối hợp tay - mắt, các cử động mô phỏng vui vẻ.',
  },
  {
    id: 'socio_emotional_aesthetic',
    name: 'Tình cảm, kỹ năng xã hội & Thẩm mỹ',
    icon: '💖',
    color: '#DB2777',
    bgColor: '#FCE7F3',
    description: 'Giao tiếp với cô và bạn, chào hỏi, chia sẻ đồ chơi, cảm thụ âm nhạc & cái đẹp.',
  },
];

export type ActivityTypeId =
  | 'listen-find' // Bé nghe và tìm
  | 'sound-guess' // Bé nghe tiếng đoán hình
  | 'imitation-speak' // Bé tập nói / bắt chước
  | 'movement' // Bé cùng vận động
  | 'habit-social' // Bé tập kỹ năng / giao tiếp
  | 'music-movement'; // Bé nghe nhạc và vận động

export interface ChoiceItem {
  id: string;
  name: string;
  image: string; // SVG Data URL
  correct: boolean;
  soundText?: string;
  bgColor?: string;
}

export interface PreschoolActivity {
  id: string;
  ageGroup: AgeGroup;
  domain: DevelopmentalDomainId[];
  topic: string;
  activityType: ActivityTypeId;
  title: string;
  objectives: string[];
  preparation: string[];
  teacherPrompt: string; // Câu lệnh rất ngắn gọn, tự nhiên
  encouragement: string[];
  retryPrompt: string;
  choices: ChoiceItem[];
  realLifeExtension: string[]; // 🌱 Gợi ý mở rộng ngoài đời thực
  observationCriteria: string[]; // Tiêu chí quan sát của giáo viên
  imitationWord?: string; // Dành cho hoạt động tập nói
  soundSample?: string; // Dành cho tiếng động vật / âm thanh
  actionDescription?: string; // Hướng dẫn động tác cô làm mẫu
}

export interface ActivityObservationRecord {
  id: string;
  date: string;
  ageGroup: AgeGroup;
  activityId: string;
  activityTitle: string;
  topic: string;
  domainName: string;
  participationLevel: 'Hứng thú tham gia' | 'Tham gia khi có hỗ trợ' | 'Chưa hứng thú';
  executionAbility: 'Tự thực hiện được' | 'Thực hiện khi có hỗ trợ' | 'Cần thêm cơ hội trải nghiệm';
  teacherNotes: string;
  timestamp: number;
}

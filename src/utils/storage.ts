import {
  PreschoolSettings,
  TopicGame,
  TopicProgressStat,
  LessonPlan,
  ChildProfile,
  ChildActivityResult,
  MediaItem,
} from '../types.ts';
import { DEFAULT_GAMES } from '../data/defaultTopics.ts';
import {
  saveGameToFirestore,
  saveChildToFirestore,
  saveProgressToFirestore,
} from './firebaseStorage.ts';

const STORAGE_KEY_GAMES = 'tinylearn_games_v2';
const STORAGE_KEY_SETTINGS = 'tinylearn_settings_v2';
const STORAGE_KEY_STATS = 'tinylearn_progress_stats_v2';
const STORAGE_KEY_PLANS = 'tinylearn_lesson_plans_v1';
const STORAGE_KEY_CHILDREN = 'tinylearn_children_v1';
const STORAGE_KEY_ACTIVITY = 'tinylearn_activity_results_v1';
const STORAGE_KEY_MEDIA = 'tinylearn_media_v1';

export const DEFAULT_SETTINGS: PreschoolSettings = {
  autoAdvanceSeconds: 2, // 2s before auto advancing after correct answer
  speechRate: 0.88,
  speechPitch: 1.0, // Natural human pitch
  voiceMode: 'ai_preferred',
  preferredVoiceURI: '',
  enableSSML: true, // Natural toddler SSML pacing enabled by default
  ssmlBreakDurationMs: 450, // 450ms pause between question & instruction
  topicPracticeMode: true, // Chế độ Luyện tập theo chủ đề
  audioPromptRepetitions: 2, // Lặp lại 2 lần tự động để bé 12-24m ghi nhớ tốt hơn
  repetitionIntervalSeconds: 3, // Nghỉ 3 giây giữa các lần nhắc
  enableVisualHintAfterRepeat: true, // Tự động hiển thị viền sáng nhấp nháy lên hình đúng sau lần phát lại thứ hai
  enableHaptics: true,
  enableSoundEffects: true,
  childLockEnabled: false,
  teacherPin: '1234',
  touchTVMode: false,
};

// ==========================================
// GAMES STORAGE
// ==========================================
export function loadStoredGames(): TopicGame[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GAMES);
    let parsed: TopicGame[] = [];
    if (!raw) {
      // Check v1
      const v1 = localStorage.getItem('tinylearn_games_v1');
      if (v1) {
        const v1Parsed = JSON.parse(v1);
        if (Array.isArray(v1Parsed) && v1Parsed.length > 0) {
          parsed = v1Parsed;
        }
      }
      if (parsed.length === 0) {
        saveStoredGames(DEFAULT_GAMES);
        return DEFAULT_GAMES;
      }
    } else {
      parsed = JSON.parse(raw);
    }

    if (Array.isArray(parsed) && parsed.length > 0) {
      const tomatoPreset = DEFAULT_GAMES.find((g) => g.id === 'game-tomato');

      // Self-healing: if any game has topic/title mentioning "cà chua", but items are Quả Táo, fix them!
      let hasFixed = false;
      parsed = parsed.map((g) => {
        const lower = ((g.title || '') + ' ' + (g.topic || '')).toLowerCase();
        if (lower.includes('cà chua') || lower.includes('tomato')) {
          const firstItemName = (g.items?.[0]?.name || '').toLowerCase();
          if (!firstItemName.includes('cà chua') && tomatoPreset) {
            hasFixed = true;
            return {
              ...g,
              topic: 'Quả Cà Chua',
              category: 'fruits',
              items: tomatoPreset.items,
            };
          }
        }
        return g;
      });

      // Ensure all built-in games (including tomato, drag-drop, puzzle, battle) are present
      DEFAULT_GAMES.forEach((dg) => {
        if (dg.isBuiltIn && !parsed.some((g) => g.id === dg.id)) {
          parsed.push(dg);
          hasFixed = true;
        }
      });

      if (hasFixed) {
        saveStoredGames(parsed);
      }

      return parsed;
    }
  } catch (e) {
    console.error('Failed to load games from localStorage:', e);
  }
  return DEFAULT_GAMES;
}

export function saveStoredGames(games: TopicGame[]) {
  try {
    localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(games));
    // Asynchronously sync customized games to Firestore
    games.forEach((g) => {
      saveGameToFirestore(g).catch(() => {});
    });
  } catch (e) {
    console.error('Failed to save games to localStorage:', e);
  }
}

// ==========================================
// SETTINGS STORAGE
// ==========================================
export function loadStoredSettings(): PreschoolSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
    // Check v1
    const v1 = localStorage.getItem('tinylearn_settings_v1');
    if (v1) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(v1) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: PreschoolSettings) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

// ==========================================
// LESSON PLANS STORAGE
// ==========================================
const DEFAULT_LESSON_PLANS: LessonPlan[] = [
  {
    id: 'plan_default_1',
    gameId: 'game-animals',
    title: 'Kế hoạch hoạt động: Nhận biết tập nói con Mèo, con Chó',
    topic: 'Con vật nuôi',
    ageRange: '12–24 tháng',
    durationMinutes: 15,
    objectives: {
      knowledge: [
        'Trẻ nhận biết và gọi tên đúng con Mèo, con Chó.',
        'Trẻ nhận biết tiếng kêu: Mèo kêu meo meo, Chó sủa gâu gâu.',
        'Trẻ chỉ đúng hình ảnh con vật trên màn hình tương tác.',
      ],
      skills: [
        'Rèn luyện phát âm từ đơn: "Mèo", "Chó", "Meo meo", "Gâu gâu".',
        'Phát triển khả năng định hướng thị giác và phối hợp tay - mắt.',
        'Rèn động tác vận động mô phỏng: Mèo rửa mặt, Chó vẫy tai.',
      ],
      attitude: [
        'Trẻ vui tươi, hứng thú tham gia cùng cô và các bạn.',
        'Yêu quý và không sợ hãi các con vật nuôi quen thuộc.',
      ],
    },
    preparations: {
      teacher: [
        'Mô hình gấu bông bạn Mèo, bạn Chó.',
        'Hộp quà bí mật đựng đồ chơi.',
        'Smart TV cảm ứng mở sẵn phần mềm TinyLearn.',
      ],
      children: [
        'Trang phục gọn gàng, tâm thế vui vẻ.',
        'Thảm xốp mềm ngồi theo hình vòng cung.',
      ],
      itApplication: [
        'Ứng dụng TinyLearn bài "Bé nghe và tìm con vật nuôi" (chế độ viền sáng trợ giúp).',
      ],
    },
    steps: [
      {
        phase: '1. Ổn định - Gây hứng thú',
        duration: '2–3 phút',
        activities: 'Hộp quà bí mật & tiếng kêu bí ẩn',
        teacherGuidance:
          'Cô tạo âm thanh "Meo meo", đố trẻ tiếng gì phát ra từ chiếc hộp quà bí mật. Kích thích sự tò mò của trẻ.',
        childrenResponse: 'Trẻ hào hứng đoán và gọi tên: "Mèo! Mèo!"',
      },
      {
        phase: '2. Hoạt động trọng tâm',
        duration: '7–8 phút',
        activities: 'Dạy trẻ nhận biết, tập nói & làm động tác',
        teacherGuidance:
          'Cô đưa mô hình Mèo ra, cho trẻ sờ lông mềm, phát âm mẫu: "Mèo ơi", hướng dẫn cả lớp làm động tác mèo rửa mặt. Tương tự với bạn Chó sủa "Gâu gâu".',
        childrenResponse: 'Trẻ phát âm theo cô và làm động tác mèo rửa mặt rất đáng yêu.',
      },
      {
        phase: '3. Trò chơi củng cố trên TinyLearn',
        duration: '3–4 phút',
        activities: 'Tương tác trực tiếp trên màn hình TV/Tablet',
        teacherGuidance:
          'Cô mở TinyLearn trên màn hình cảm ứng, mời từng nhóm 2–3 trẻ lên nghe giọng đọc và dùng ngón tay chạm vào bạn Mèo, bạn Chó.',
        childrenResponse: 'Trẻ tự tin chạm vào màn hình, reo hò khi nhận được ngôi sao vàng.',
      },
      {
        phase: '4. Kết thúc hoạt động',
        duration: '1–2 phút',
        activities: 'Khen ngợi & chuyển tiếp',
        teacherGuidance:
          'Cô khen cả lớp giỏi, cùng trẻ làm chú mèo ngoan đi nhẹ nhàng về góc chơi.',
        childrenResponse: 'Trẻ vỗ tay vui vẻ và chào cô.',
      },
    ],
    evaluation:
      'Đa số trẻ nhận biết và phát âm tốt; cô chú ý khích lệ các trẻ còn rụt rè trong hoạt động góc buổi chiều.',
    createdAt: Date.now() - 86400000,
  },
];

export function loadStoredLessonPlans(): LessonPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLANS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load lesson plans:', e);
  }
  return DEFAULT_LESSON_PLANS;
}

export function saveStoredLessonPlans(plans: LessonPlan[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
  } catch (e) {
    console.error('Failed to save lesson plans:', e);
  }
}

export function saveSingleLessonPlan(plan: LessonPlan) {
  const existing = loadStoredLessonPlans();
  const index = existing.findIndex((p) => p.id === plan.id);
  if (index >= 0) {
    existing[index] = plan;
  } else {
    existing.unshift(plan);
  }
  saveStoredLessonPlans(existing);
}

// ==========================================
// CHILDREN PROFILES STORAGE
// ==========================================
const DEFAULT_CHILDREN: ChildProfile[] = [
  {
    id: 'child_1',
    fullName: 'Nguyễn Minh An (Bé Bon)',
    birthDate: '2025-02-15',
    className: 'Nhà trẻ D1 (12–18m)',
    avatarEmoji: '🦁',
    avatarBgColor: '#FEF3C7',
    notes: 'Phản xạ thính giác rất tốt, rất thích tiếng kêu của các bạn động vật.',
    createdAt: Date.now() - 1000000,
  },
  {
    id: 'child_2',
    fullName: 'Trần Bảo Ngọc (Bé Na)',
    birthDate: '2024-09-10',
    className: 'Nhà trẻ D2 (18–24m)',
    avatarEmoji: '🐰',
    avatarBgColor: '#FCE7F3',
    notes: 'Rất thích phân biệt màu sắc, phát âm từ đơn rõ ràng.',
    createdAt: Date.now() - 2000000,
  },
  {
    id: 'child_3',
    fullName: 'Lê Hoàng Nam (Bé Sóc)',
    birthDate: '2025-01-20',
    className: 'Nhà trẻ D1 (12–18m)',
    avatarEmoji: '🐻',
    avatarBgColor: '#E0F2FE',
    notes: 'Đang tập nói từ đơn, cần cô nhắc lại 2 lần kết hợp viền sáng.',
    createdAt: Date.now() - 3000000,
  },
  {
    id: 'child_4',
    fullName: 'Phạm Tuệ Nhi (Bé Bơ)',
    birthDate: '2024-07-05',
    className: 'Nhà trẻ D2 (18–24m)',
    avatarEmoji: '🐱',
    avatarBgColor: '#DCFCE7',
    notes: 'Nhanh nhẹn, thao tác chạm màn hình cảm ứng rất khéo léo.',
    createdAt: Date.now() - 4000000,
  },
];

export function loadStoredChildren(): ChildProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHILDREN);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load children:', e);
  }
  return DEFAULT_CHILDREN;
}

export function saveStoredChildren(children: ChildProfile[]) {
  try {
    localStorage.setItem(STORAGE_KEY_CHILDREN, JSON.stringify(children));
    // Asynchronously sync children to Firestore
    children.forEach((c) => {
      saveChildToFirestore(c).catch(() => {});
    });
  } catch (e) {
    console.error('Failed to save children:', e);
  }
}

// ==========================================
// ACTIVITY RESULTS TRACKING
// ==========================================
export function loadStoredActivityResults(): ChildActivityResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVITY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load activity results:', e);
  }
  return [];
}

export function saveStoredActivityResults(results: ChildActivityResult[]) {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(results));
  } catch (e) {
    console.error('Failed to save activity results:', e);
  }
}

export function recordChildActivityResult(record: Omit<ChildActivityResult, 'id'>) {
  const existing = loadStoredActivityResults();
  const newEntry: ChildActivityResult = {
    ...record,
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
  };
  existing.unshift(newEntry);
  // Keep last 100 entries
  if (existing.length > 100) existing.length = 100;
  saveStoredActivityResults(existing);
}

// ==========================================
// MEDIA LIBRARY STORAGE
// ==========================================
export function loadStoredMedia(): MediaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEDIA);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load media:', e);
  }
  return [];
}

export function saveStoredMedia(items: MediaItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY_MEDIA, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save media:', e);
  }
}

// ==========================================
// TOPIC STATS
// ==========================================
export function loadProgressStats(): Record<string, TopicProgressStat> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load progress stats:', e);
  }
  return {};
}

export function saveProgressStats(stats: Record<string, TopicProgressStat>) {
  try {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    // Asynchronously sync stats to Firestore
    Object.values(stats).forEach((s) => {
      saveProgressToFirestore(s).catch(() => {});
    });
  } catch (e) {
    console.error('Failed to save progress stats:', e);
  }
}

export function recordTopicAttempt(
  topicId: string,
  topicTitle: string,
  itemId: string,
  itemName: string,
  isCorrect: boolean
) {
  const allStats = loadProgressStats();
  const current = allStats[topicId] || {
    topicId,
    topicTitle,
    correctCount: 0,
    wrongCount: 0,
    completedRounds: 0,
    lastPlayedAt: Date.now(),
    itemStats: {},
  };

  current.topicTitle = topicTitle;
  current.lastPlayedAt = Date.now();

  if (isCorrect) {
    current.correctCount = (current.correctCount || 0) + 1;
  } else {
    current.wrongCount = (current.wrongCount || 0) + 1;
  }

  if (!current.itemStats) {
    current.itemStats = {};
  }

  const itStat = current.itemStats[itemId] || { name: itemName, correct: 0, wrong: 0 };
  itStat.name = itemName;
  if (isCorrect) {
    itStat.correct += 1;
  } else {
    itStat.wrong += 1;
  }
  current.itemStats[itemId] = itStat;

  allStats[topicId] = current;
  saveProgressStats(allStats);
}

export function recordTopicCompleted(topicId: string, topicTitle: string) {
  const allStats = loadProgressStats();
  const current = allStats[topicId] || {
    topicId,
    topicTitle,
    correctCount: 0,
    wrongCount: 0,
    completedRounds: 0,
    lastPlayedAt: Date.now(),
    itemStats: {},
  };

  current.topicTitle = topicTitle;
  current.completedRounds = (current.completedRounds || 0) + 1;
  current.lastPlayedAt = Date.now();
  allStats[topicId] = current;
  saveProgressStats(allStats);
}

export function resetProgressStats() {
  try {
    localStorage.removeItem(STORAGE_KEY_STATS);
  } catch (e) {
    console.error('Failed to reset stats:', e);
  }
}

// ==========================================
// EXPORT UTILITIES (BACKUP & RESTORE)
// ==========================================
export function exportGamesToJson(games: TopicGame[]) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(games, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `tinylearn_bai_hoc_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export async function importGamesFromJsonFile(file: File): Promise<TopicGame[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          resolve(parsed);
        } else if (parsed && typeof parsed === 'object' && parsed.items) {
          resolve([parsed]);
        } else {
          reject(new Error('Định dạng file không hợp lệ'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}

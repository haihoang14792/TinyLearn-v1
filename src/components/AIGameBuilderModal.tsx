import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Play,
  Volume2,
  FileText,
  QrCode,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Image as ImageIcon,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { TopicGame, TopicItem, GameType, PreschoolSettings } from '../types.ts';
import { getSvgForNameOrKey } from '../data/illustrations.ts';
import { audioEngine } from '../utils/audio.ts';

interface AIGameBuilderModalProps {
  isOpen: boolean;
  initialTopic?: string;
  settings: PreschoolSettings;
  onClose: () => void;
  onSaveAndPublish: (game: TopicGame, generateLessonPlanToo: boolean) => void;
}

export const AIGameBuilderModal: React.FC<AIGameBuilderModalProps> = ({
  isOpen,
  initialTopic = '',
  settings,
  onClose,
  onSaveAndPublish,
}) => {
  const [topic, setTopic] = useState(initialTopic || 'Con vật đáng yêu');
  const [ageRange, setAgeRange] = useState<'12–18 tháng' | '18–24 tháng' | '12–24 tháng'>('12–24 tháng');
  const [questionCount, setQuestionCount] = useState(4);
  const [gameType, setGameType] = useState<GameType>('listen_find');
  const [goal, setGoal] = useState('Bé nghe âm thanh nhận biết con vật và bắt chước động tác mô phỏng.');

  const [isLoading, setIsLoading] = useState(false);
  const [generatedGame, setGeneratedGame] = useState<TopicGame | null>(null);
  const [isSynthesizingTTS, setIsSynthesizingTTS] = useState(false);
  const [ttsProgress, setTtsProgress] = useState('');
  const [wantLessonPlan, setWantLessonPlan] = useState(true);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim() || 'Con vật đáng yêu',
          ageRange,
          questionCount,
          gameType,
          goal,
        }),
      });

      const data = await response.json();
      if (data && data.game) {
        const gameData: TopicGame = {
          id: `game_${Date.now()}`,
          title: data.game.title || `Bé Khám Phá: ${topic}`,
          topic: data.game.topic || topic,
          category: data.game.category || 'animals',
          ageRange,
          gameType,
          description: data.game.description || `Trò chơi tương tác chủ đề ${topic} cho trẻ ${ageRange}.`,
          objectives: data.game.objectives || goal,
          choicesCount: ageRange === '12–18 tháng' ? 2 : 3,
          createdAt: Date.now(),
          items: (data.game.items || []).map((it: any, idx: number) => ({
            id: `item_${Date.now()}_${idx}`,
            name: it.name || `Đối tượng ${idx + 1}`,
            soundText: it.soundText || '',
            questionText: it.questionText || `Tìm ${it.name} nào!`,
            readingSentence: it.readingSentence || `Đây là ${it.name}.`,
            movementSuggestion: it.movementSuggestion || 'Làm động tác mô phỏng vui vẻ',
            praisePhrase: it.praisePhrase || 'Giỏi quá! Bé đúng rồi!',
            encouragementPhrase: it.encouragementPhrase || 'Con thử lại nhé!',
            imageUrl: it.imageUrl || getSvgForNameOrKey(it.name || it.suggestedSvgKey || 'star'),
            bgColor: it.bgColor || '#FEF3C7',
          })),
        };
        setGeneratedGame(gameData);
      }
    } catch (err) {
      console.error('Error generating AI game:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSynthesizeAllTTS = async () => {
    if (!generatedGame) return;
    setIsSynthesizingTTS(true);
    setTtsProgress('Đang tạo giọng nữ chuẩn cho câu hỏi...');

    try {
      const updatedItems = [...generatedGame.items];
      for (let i = 0; i < updatedItems.length; i++) {
        const it = updatedItems[i];
        setTtsProgress(`Đang tạo giọng ${i + 1}/${updatedItems.length}: "${it.name}"...`);
        try {
          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: it.questionText }),
          });
          const d = await res.json();
          if (d && d.audioUrl) {
            it.audioUrl = d.audioUrl;
          }
        } catch (e) {
          console.warn('TTS item error:', e);
        }
      }
      setGeneratedGame({ ...generatedGame, items: updatedItems });
      setTtsProgress('✓ Đã nạp đầy đủ giọng nữ người Việt Nam chuẩn!');
      setTimeout(() => setTtsProgress(''), 3000);
    } finally {
      setIsSynthesizingTTS(false);
    }
  };

  const handlePublish = () => {
    if (!generatedGame) return;
    onSaveAndPublish(generatedGame, wantLessonPlan);
  };

  const handleTestItemVoice = (text: string, audioUrl?: string) => {
    if (audioUrl) {
      const a = new Audio(audioUrl);
      a.play().catch(() => {});
    } else {
      audioEngine.speakVietnamese(text);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-4xl shadow-2xl border-4 border-amber-300 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 border-b border-amber-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950 text-white flex items-center justify-center font-black text-xl shadow-xs">
              ✨
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-950">
                AI Tạo Hoạt Động & Trò Chơi Mầm Non
              </h2>
              <p className="text-xs font-bold text-amber-900/80">
                Quy trình 1 phút: Nhập chủ đề → Sinh trò chơi + Giọng nữ Việt + Giáo án + Mã QR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: PROMPT INPUT FORM */}
          {!generatedGame && (
            <div className="space-y-5">
              {/* Topic Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-extrabold text-slate-800">
                  1. Tên chủ đề bài học:
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ví dụ: Con vật nuôi trong nhà, Trái cây ngọt thơm, Màu sắc quanh bé..."
                  className="w-full px-4 py-3.5 text-base font-bold text-slate-900 bg-amber-50/40 border-2 border-amber-200 rounded-2xl focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all shadow-xs"
                />
              </div>

              {/* Age Range & Game Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-800">
                    2. Độ tuổi của trẻ:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['12–18 tháng', '18–24 tháng', '12–24 tháng'] as const).map((age) => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => setAgeRange(age)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                          ageRange === age
                            ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-xs scale-102'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500">
                    {ageRange === '12–18 tháng'
                      ? '✓ Tối đa 2 lựa chọn, câu hỏi siêu ngắn, hình lớn.'
                      : '✓ 3 lựa chọn, câu đọc mở rộng, rèn phản xạ ngôn ngữ.'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-800">
                    3. Dạng trò chơi mong muốn:
                  </label>
                  <select
                    value={gameType}
                    onChange={(e) => setGameType(e.target.value as GameType)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                  >
                    <option value="listen_find">1. Nghe và tìm hình (Chuẩn mầm non)</option>
                    <option value="drag_drop">2. Kéo thả vào bóng / giỏ (Rèn vận động tinh)</option>
                    <option value="puzzle_jigsaw">3. Ghép tranh (Set 2, 3, 4, 6 mảnh)</option>
                    <option value="team_battle">4. Thi đấu 2 đội (Thỏ Trắng vs Gấu Nâu)</option>
                    <option value="touch_explore">5. Chạm để nghe (12–18 tháng)</option>
                    <option value="match_similar">6. Tìm hình giống mẫu (18–24 tháng)</option>
                    <option value="who_disappeared">7. Ai biến mất? (Luyện trí nhớ)</option>
                    <option value="knowledge_bubbles">8. Bong bóng kiến thức (Chạm nổ)</option>
                    <option value="color_match">9. Phân biệt màu sắc (Đỏ, Vàng, Xanh)</option>
                  </select>
                </div>
              </div>

              {/* Number of questions & Goal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-800">
                    4. Số lượng câu hỏi:
                  </label>
                  <div className="flex items-center gap-2">
                    {[3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuestionCount(num)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                          questionCount === num
                            ? 'bg-amber-400 border-amber-500 text-amber-950 font-black'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {num} câu
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-800">
                    5. Mục tiêu hoạt động trọng tâm:
                  </label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="Mục tiêu nhận biết, phát âm từ đơn, vận động thô..."
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              {/* GENERATE ACTION BUTTON */}
              <div className="pt-4">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleGenerate}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-amber-700 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>AI đang soạn thảo trò chơi & câu đố...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 fill-white" />
                      <span>✨ Bấm tạo hoạt động bằng AI (1 phút)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & CUSTOMIZE GENERATED GAME */}
          {generatedGame && (
            <div className="space-y-6">
              {/* Game Header Bar */}
              <div className="p-4 bg-amber-50 rounded-3xl border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-xs">
                      {generatedGame.ageRange}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      {generatedGame.items.length} câu hỏi
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                    {generatedGame.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Mục tiêu: {generatedGame.objectives}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setGeneratedGame(null)}
                  className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tạo lại từ đầu</span>
                </button>
              </div>

              {/* Items List Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
                    Danh sách câu hỏi & gợi ý vận động kèm theo:
                  </span>
                  <span className="text-xs text-slate-500">
                    Giáo viên có thể sửa câu hỏi trực tiếp
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {generatedGame.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-white rounded-2xl border-2 border-slate-200 hover:border-amber-300 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-14 h-14 rounded-2xl p-1.5 shrink-0 flex items-center justify-center border border-slate-200"
                          style={{ backgroundColor: item.bgColor }}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-400">Câu {idx + 1}</span>
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              {item.soundText || item.name}
                            </span>
                          </div>
                          <h4 className="font-black text-base text-slate-900 truncate">{item.name}</h4>
                        </div>
                      </div>

                      {/* Question Text */}
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                          Câu hỏi đọc cho trẻ:
                        </label>
                        <input
                          type="text"
                          value={item.questionText}
                          onChange={(e) => {
                            const newItems = [...generatedGame.items];
                            newItems[idx].questionText = e.target.value;
                            setGeneratedGame({ ...generatedGame, items: newItems });
                          }}
                          className="w-full text-xs font-bold text-slate-900 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200"
                        />
                      </div>

                      {/* Movement Suggestion */}
                      {item.movementSuggestion && (
                        <div className="p-2 bg-emerald-50/80 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-1.5">
                          <span className="text-xs shrink-0">🤸</span>
                          <span>
                            <strong>Vận động: </strong>
                            {item.movementSuggestion}
                          </span>
                        </div>
                      )}

                      {/* Test Voice Button */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleTestItemVoice(item.questionText, item.audioUrl)}
                          className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 rounded-lg cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                          <span>Nghe thử câu này</span>
                        </button>
                        {item.audioUrl && (
                          <span className="text-[10px] font-bold text-emerald-700">✓ Đã nạp MP3</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* QUICK ACTIONS BAR */}
              <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-xs uppercase text-slate-700">
                      Tùy chọn tạo kèm tự động:
                    </span>
                    <p className="text-xs text-slate-500">
                      Giúp hoàn tất trọn bộ học liệu chỉ trong 1 lần nhấn
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={wantLessonPlan}
                        onChange={(e) => setWantLessonPlan(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded-sm cursor-pointer"
                      />
                      <span>Tự động sinh Giáo Án Mầm Non</span>
                    </label>

                    <button
                      type="button"
                      disabled={isSynthesizingTTS}
                      onClick={handleSynthesizeAllTTS}
                      className="px-3.5 py-2 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-1.5 active:scale-95 transition-all shadow-2xs cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4 text-amber-600" />
                      <span>Tạo giọng nữ chuẩn toàn bài</span>
                    </button>
                  </div>
                </div>

                {ttsProgress && (
                  <div className="p-2.5 bg-amber-100/80 rounded-xl text-xs font-bold text-amber-950 flex items-center gap-2 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
                    <span>{ttsProgress}</span>
                  </div>
                )}
              </div>

              {/* FINAL PUBLISH BUTTON */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-2xl border-2 border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Đóng lại
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base rounded-2xl shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>🚀 Lưu & Xuất Bản Ngay (Hiện QR)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

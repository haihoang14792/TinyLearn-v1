import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Volume2,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Info,
  AlertTriangle,
  Image as ImageIcon,
  CheckCircle2,
  Shuffle,
  Layers,
  Settings2,
} from 'lucide-react';
import { TopicGame, TopicItem, TopicChoice, GameType, PreschoolSettings } from '../types.ts';
import { getSvgForNameOrKey, ILLUSTRATIONS } from '../data/illustrations.ts';
import { audioEngine } from '../utils/audio.ts';
import { audioManager } from '../services/audioManager.ts';

interface AIGameBuilderModalProps {
  isOpen: boolean;
  initialTopic?: string;
  settings: PreschoolSettings;
  onClose: () => void;
  onSaveAndPublish: (game: TopicGame, generateLessonPlanToo: boolean) => void;
}

const PRESET_ICONS = [
  'cat', 'dog', 'duck', 'chicken', 'cow', 'sheep', 'pig', 'rabbit',
  'apple', 'banana', 'orange', 'watermelon', 'strawberry', 'tomato', 'carrot',
  'car', 'bus', 'train', 'airplane', 'ball', 'star', 'sun', 'flower', 'heart',
];

export const AIGameBuilderModal: React.FC<AIGameBuilderModalProps> = ({
  isOpen,
  initialTopic = '',
  settings,
  onClose,
  onSaveAndPublish,
}) => {
  // Setup state
  const [topic, setTopic] = useState(initialTopic || 'Con vật đáng yêu');
  const [ageRange, setAgeRange] = useState<'12–18 tháng' | '18–24 tháng' | '12–24 tháng'>('12–18 tháng');
  const [questionCount, setQuestionCount] = useState(4);
  const [gameType, setGameType] = useState<GameType>('listen_find');
  const [goal, setGoal] = useState('Bé nghe âm thanh nhận biết con vật và bắt chước động tác mô phỏng.');

  // Choice count configuration
  const [choiceMode, setChoiceMode] = useState<'2' | '3' | '4' | 'custom'>('2');
  const [customChoiceCount, setCustomChoiceCount] = useState(2);
  const [answerType, setAnswerType] = useState<'single' | 'multiple'>('single');
  const [shuffleChoices, setShuffleChoices] = useState(false);

  // Generation state
  const [isLoading, setIsLoading] = useState(false);
  const [generatedGame, setGeneratedGame] = useState<TopicGame | null>(null);
  const [isSynthesizingTTS, setIsSynthesizingTTS] = useState(false);
  const [ttsProgress, setTtsProgress] = useState('');
  const [wantLessonPlan, setWantLessonPlan] = useState(true);

  // Safety alert modal / message
  const [safetyAlert, setSafetyAlert] = useState<string | null>(null);
  const [confirmBulkChange, setConfirmBulkChange] = useState<{ targetCount: number } | null>(null);

  // Icon picker state: { itemIdx: number, choiceIdx: number } | null
  const [iconPickerTarget, setIconPickerTarget] = useState<{ itemIdx: number; choiceIdx: number } | null>(null);

  if (!isOpen) return null;

  // Calculate effective choices count
  const effectiveChoicesCount =
    choiceMode === 'custom' ? customChoiceCount : parseInt(choiceMode, 10);

  // Handle age range change with pedagogical defaults
  const handleAgeRangeChange = (newAge: '12–18 tháng' | '18–24 tháng' | '12–24 tháng') => {
    setAgeRange(newAge);
    if (newAge === '12–18 tháng') {
      setChoiceMode('2');
      setShuffleChoices(false);
    } else if (newAge === '18–24 tháng') {
      setChoiceMode('2');
      setShuffleChoices(true);
    }
  };

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
          choicesCount: effectiveChoicesCount,
          answerType,
          shuffleChoices,
        }),
      });

      const data = await response.json();
      if (data && data.game) {
        const rawItems = data.game.items || [];
        const builtItems: TopicItem[] = rawItems.map((it: any, idx: number) => {
          // Normalize choices
          let choices: TopicChoice[] = (it.choices || []).map((c: any, cIdx: number) => ({
            id: c.id || `choice_${Date.now()}_${idx}_${cIdx}`,
            name: c.name || `Lựa chọn ${cIdx + 1}`,
            imageUrl: c.imageUrl || getSvgForNameOrKey(c.suggestedSvgKey || c.name || 'star'),
            bgColor: c.bgColor || (c.isCorrect ? '#FEF3C7' : '#F1F5F9'),
            isCorrect: typeof c.isCorrect === 'boolean' ? c.isCorrect : cIdx === 0,
          }));

          // Fallback if choices length doesn't match
          if (choices.length === 0) {
            const pool = ['Mèo', 'Chó', 'Vịt', 'Gà', 'Táo', 'Cam', 'Bóng'];
            const distractors = pool.filter((p) => p !== it.name);
            choices = [
              {
                id: `choice_${Date.now()}_${idx}_0`,
                name: it.name || `Đáp án ${idx + 1}`,
                imageUrl: it.imageUrl || getSvgForNameOrKey(it.name || 'star'),
                bgColor: '#FEF3C7',
                isCorrect: true,
              },
              ...distractors.slice(0, effectiveChoicesCount - 1).map((d, dIdx) => ({
                id: `choice_${Date.now()}_${idx}_${dIdx + 1}`,
                name: d,
                imageUrl: getSvgForNameOrKey(d),
                bgColor: '#F1F5F9',
                isCorrect: false,
              })),
            ];
          }

          return {
            id: it.id || `item_${Date.now()}_${idx}`,
            name: it.name || `Đối tượng ${idx + 1}`,
            soundText: it.soundText || '',
            questionText: it.questionText || `Tìm ${it.name} nào!`,
            readingSentence: it.readingSentence || `Đây là ${it.name}.`,
            movementSuggestion: it.movementSuggestion || 'Làm động tác mô phỏng vui vẻ',
            praisePhrase: it.praisePhrase || 'Giỏi quá! Bé đúng rồi!',
            encouragementPhrase: it.encouragementPhrase || 'Con thử lại nhé!',
            imageUrl: it.imageUrl || getSvgForNameOrKey(it.name || it.suggestedSvgKey || 'star'),
            bgColor: it.bgColor || '#FEF3C7',
            choices,
            shuffleChoices,
          };
        });

        const gameData: TopicGame = {
          id: `game_${Date.now()}`,
          title: data.game.title || `Bé Khám Phá: ${topic}`,
          topic: data.game.topic || topic,
          category: data.game.category || 'animals',
          ageRange,
          gameType,
          description: data.game.description || `Trò chơi tương tác chủ đề ${topic} cho trẻ ${ageRange}.`,
          objectives: data.game.objectives || goal,
          choicesCount: effectiveChoicesCount,
          defaultChoiceCount: effectiveChoicesCount,
          answerType,
          shuffleChoices,
          createdAt: Date.now(),
          items: builtItems,
        };
        setGeneratedGame(gameData);
      }
    } catch (err) {
      console.error('Error generating AI game:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit question text
  const handleUpdateQuestionText = (itemIdx: number, text: string) => {
    if (!generatedGame) return;
    const newItems = [...generatedGame.items];
    newItems[itemIdx].questionText = text;
    setGeneratedGame({ ...generatedGame, items: newItems });
  };

  // Edit choice name
  const handleUpdateChoiceName = (itemIdx: number, choiceIdx: number, newName: string) => {
    if (!generatedGame) return;
    const newItems = [...generatedGame.items];
    const currentChoices = [...(newItems[itemIdx].choices || [])];
    currentChoices[choiceIdx] = {
      ...currentChoices[choiceIdx],
      name: newName,
      imageUrl: getSvgForNameOrKey(newName),
    };
    newItems[itemIdx].choices = currentChoices;
    setGeneratedGame({ ...generatedGame, items: newItems });
  };

  // Toggle correctness of choice
  const handleToggleCorrectness = (itemIdx: number, choiceIdx: number) => {
    if (!generatedGame) return;
    const newItems = [...generatedGame.items];
    const choices = [...(newItems[itemIdx].choices || [])];

    if (generatedGame.answerType === 'multiple') {
      // Allow multiple correct, but ensure at least one remains correct
      const isCurrentlyCorrect = choices[choiceIdx].isCorrect;
      const totalCorrect = choices.filter((c) => c.isCorrect).length;
      if (isCurrentlyCorrect && totalCorrect <= 1) {
        setSafetyAlert('Mỗi câu hỏi phải có ít nhất 1 đáp án đúng.');
        return;
      }
      choices[choiceIdx].isCorrect = !isCurrentlyCorrect;
    } else {
      // Single correct answer
      choices.forEach((c, idx) => {
        c.isCorrect = idx === choiceIdx;
      });
      // Also update item target name and icon to match the correct choice
      newItems[itemIdx].name = choices[choiceIdx].name;
      newItems[itemIdx].imageUrl = choices[choiceIdx].imageUrl;
    }

    newItems[itemIdx].choices = choices;
    setGeneratedGame({ ...generatedGame, items: newItems });
  };

  // Safe delete choice
  const handleDeleteChoice = (itemIdx: number, choiceIdx: number) => {
    if (!generatedGame) return;
    const item = generatedGame.items[itemIdx];
    const choices = item.choices || [];

    if (choices.length <= 2) {
      setSafetyAlert('Mỗi câu hỏi cần tối thiểu 2 lựa chọn để trẻ quan sát.');
      return;
    }

    const targetChoice = choices[choiceIdx];
    if (targetChoice.isCorrect) {
      const correctCount = choices.filter((c) => c.isCorrect).length;
      if (correctCount <= 1) {
        setSafetyAlert('Đây là đáp án đúng. Vui lòng chọn đáp án đúng khác trước khi xóa.');
        return;
      }
    }

    const updatedChoices = choices.filter((_, idx) => idx !== choiceIdx);
    const newItems = [...generatedGame.items];
    newItems[itemIdx].choices = updatedChoices;
    setGeneratedGame({ ...generatedGame, items: newItems });
  };

  // Add choice to single question
  const handleAddChoice = (itemIdx: number) => {
    if (!generatedGame) return;
    const item = generatedGame.items[itemIdx];
    const choices = item.choices || [];

    if (choices.length >= 6) {
      setSafetyAlert('Tối đa 6 lựa chọn cho một câu hỏi.');
      return;
    }

    const newChoice: TopicChoice = {
      id: `choice_${Date.now()}_${choices.length}`,
      name: `Lựa chọn ${choices.length + 1}`,
      imageUrl: getSvgForNameOrKey('star'),
      bgColor: '#F1F5F9',
      isCorrect: false,
    };

    const newItems = [...generatedGame.items];
    newItems[itemIdx].choices = [...choices, newChoice];
    setGeneratedGame({ ...generatedGame, items: newItems });
  };

  // Move choice up or down
  const handleMoveChoice = (itemIdx: number, choiceIdx: number, direction: 'up' | 'down') => {
    if (!generatedGame) return;
    const item = generatedGame.items[itemIdx];
    const choices = [...(item.choices || [])];
    const targetIdx = direction === 'up' ? choiceIdx - 1 : choiceIdx + 1;

    if (targetIdx < 0 || targetIdx >= choices.length) return;

    const temp = choices[choiceIdx];
    choices[choiceIdx] = choices[targetIdx];
    choices[targetIdx] = temp;

    const newItems = [...generatedGame.items];
    newItems[itemIdx].choices = choices;
    setGeneratedGame({ ...generatedGame, items: newItems });
  };

  // Apply target choice count to all questions safely
  const handleApplyToAllQuestions = (targetCount: number) => {
    if (!generatedGame) return;
    const hasItemsWithMore = generatedGame.items.some((it) => (it.choices || []).length > targetCount);

    if (hasItemsWithMore) {
      setConfirmBulkChange({ targetCount });
    } else {
      executeBulkChange(targetCount);
    }
  };

  const executeBulkChange = (targetCount: number) => {
    if (!generatedGame) return;
    const newItems = generatedGame.items.map((it) => {
      let choices = [...(it.choices || [])];

      if (choices.length > targetCount) {
        // Safe reduction: preserve correct answers first, drop extra wrong answers
        const correctAnswers = choices.filter((c) => c.isCorrect);
        const wrongAnswers = choices.filter((c) => !c.isCorrect);

        const neededWrong = Math.max(0, targetCount - correctAnswers.length);
        choices = [...correctAnswers, ...wrongAnswers.slice(0, neededWrong)];

        // If somehow still more (e.g. multiple correct > targetCount), trim while keeping at least 1 correct
        if (choices.length > targetCount) {
          choices = choices.slice(0, targetCount);
        }
      } else if (choices.length < targetCount) {
        // Add distractors
        const pool = ['Quả Táo', 'Quả Chuối', 'Quả Cam', 'Bạn Mèo', 'Bạn Chó', 'Bóng Tròn'];
        while (choices.length < targetCount) {
          const name = pool[choices.length % pool.length] + ` ${choices.length}`;
          choices.push({
            id: `choice_bulk_${Date.now()}_${choices.length}`,
            name,
            imageUrl: getSvgForNameOrKey(name),
            bgColor: '#F1F5F9',
            isCorrect: false,
          });
        }
      }

      return {
        ...it,
        choices,
      };
    });

    setGeneratedGame({
      ...generatedGame,
      choicesCount: targetCount,
      defaultChoiceCount: targetCount,
      items: newItems,
    });
    setConfirmBulkChange(null);
  };

  // Select SVG icon for choice
  const handleSelectIconForChoice = (iconKey: string) => {
    if (!iconPickerTarget || !generatedGame) return;
    const { itemIdx, choiceIdx } = iconPickerTarget;
    const newItems = [...generatedGame.items];
    const choices = [...(newItems[itemIdx].choices || [])];
    choices[choiceIdx] = {
      ...choices[choiceIdx],
      imageUrl: getSvgForNameOrKey(iconKey),
    };
    newItems[itemIdx].choices = choices;
    setGeneratedGame({ ...generatedGame, items: newItems });
    setIconPickerTarget(null);
  };

  // Synthesize TTS
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
    audioManager.playVoice(text, audioUrl);
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
                Tạo Bài Tập AI & Tùy Chỉnh Số Lượng Đáp Án
              </h2>
              <p className="text-xs font-bold text-amber-900/80">
                Trọng tâm trẻ nhà trẻ 12–24 tháng • Tùy chỉnh số lượng lựa chọn linh hoạt từng câu
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
          {/* STEP 1: CONFIGURATION FORM */}
          {!generatedGame && (
            <div className="space-y-6">
              {/* 1. Tên chủ đề bài học */}
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

              {/* 2. Nhóm tuổi & Số lượng câu hỏi */}
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
                        onClick={() => handleAgeRangeChange(age)}
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
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-800">
                    3. Số lượng câu hỏi:
                  </label>
                  <div className="flex items-center gap-2">
                    {[3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuestionCount(num)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                          questionCount === num
                            ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {num} câu
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. SỐ LƯỢNG ĐÁP ÁN / HÌNH LỰA CHỌN (TRỌNG TÂM YÊU CẦU) */}
              <div className="p-4 bg-amber-50/70 rounded-3xl border-2 border-amber-300 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="block text-sm font-black text-amber-950">
                    4. Số lượng đáp án / hình lựa chọn mỗi câu:
                  </label>
                  <span className="text-[11px] font-bold text-amber-800">
                    Mặc định: 2 đáp án (phù hợp lứa tuổi)
                  </span>
                </div>

                {/* Radio options */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['2', '3', '4', 'custom'] as const).map((opt) => {
                    const isSelected = choiceMode === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setChoiceMode(opt)}
                        className={`py-3 px-3 rounded-2xl border-2 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500 border-amber-600 text-white shadow-md scale-102'
                            : 'bg-white border-amber-200 text-slate-700 hover:bg-amber-100/50'
                        }`}
                      >
                        <span>○</span>
                        <span>{opt === 'custom' ? 'Tùy chỉnh' : `${opt} đáp án`}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Choice Stepper [-] [count] [+] */}
                {choiceMode === 'custom' && (
                  <div className="p-3 bg-white rounded-2xl border border-amber-300 flex items-center justify-between gap-4">
                    <span className="text-xs font-bold text-slate-700">
                      Chọn số lượng đáp án mong muốn:
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setCustomChoiceCount(Math.max(2, customChoiceCount - 1))}
                        disabled={customChoiceCount <= 2}
                        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-black text-lg text-slate-800 flex items-center justify-center cursor-pointer"
                      >
                        –
                      </button>
                      <span className="w-8 text-center text-base font-black text-amber-900">
                        {customChoiceCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCustomChoiceCount(Math.min(6, customChoiceCount + 1))}
                        disabled={customChoiceCount >= 6}
                        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-black text-lg text-slate-800 flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Gợi ý sư phạm theo độ tuổi */}
                {ageRange === '12–18 tháng' && (
                  <div className="p-3 bg-white/80 rounded-2xl border border-amber-300 text-xs font-semibold text-amber-950 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      “Với trẻ 12–18 tháng, nên sử dụng 2 hình lựa chọn để trẻ dễ quan sát và nhận biết.”
                    </span>
                  </div>
                )}

                {ageRange === '18–24 tháng' && effectiveChoicesCount === 4 && (
                  <div className="p-3 bg-amber-100/90 rounded-2xl border border-amber-400 text-xs font-semibold text-amber-950 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      “4 lựa chọn có thể làm hoạt động khó hơn đối với trẻ nhà trẻ.”
                    </span>
                  </div>
                )}

                {effectiveChoicesCount > 4 && (
                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-300 text-xs font-semibold text-rose-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>
                      “TinyLearn khuyến nghị chỉ sử dụng 2–4 lựa chọn cho trẻ nhà trẻ.”
                    </span>
                  </div>
                )}
              </div>

              {/* 4. KIỂU ĐÁP ÁN & XÁO TRỘN VỊ TRÍ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kiểu đáp án */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-extrabold text-slate-800">
                    5. Kiểu đáp án đúng:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setAnswerType('single')}
                      className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                        answerType === 'single'
                          ? 'bg-amber-400 border-amber-500 text-amber-950 font-black shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      ○ Một đáp án đúng
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnswerType('multiple')}
                      className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                        answerType === 'multiple'
                          ? 'bg-amber-400 border-amber-500 text-amber-950 font-black shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      ○ Nhiều đáp án đúng
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {answerType === 'single'
                      ? '✓ Khuyến nghị ưu tiên cho lứa tuổi 12–24 tháng.'
                      : 'Hoạt động nâng cao cho trẻ luyện phân nhóm đối tượng.'}
                  </p>
                </div>

                {/* Xáo trộn vị trí */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-slate-800">
                      6. Thứ tự vị trí đáp án:
                    </label>
                    {ageRange === '18–24 tháng' && (
                      <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Mặc định bật
                      </span>
                    )}
                  </div>
                  <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={shuffleChoices}
                      onChange={(e) => setShuffleChoices(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded-sm cursor-pointer"
                    />
                    <span>Xáo trộn vị trí đáp án</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    {shuffleChoices
                      ? '✓ Bật xáo trộn: Đáp án đúng sẽ đổi vị trí ngẫu nhiên giữa các hình.'
                      : '○ Vị trí cố định (phù hợp cho trẻ 12–18 tháng nhận biết bước đầu).'}
                  </p>
                </div>
              </div>

              {/* 5. TÓM TẮT TRƯỚC KHI TẠO (SUMMARY CARD) */}
              <div className="p-4 bg-gradient-to-r from-amber-100/90 via-yellow-100/70 to-amber-50 rounded-2xl border-2 border-amber-300 space-y-2">
                <span className="text-xs font-black uppercase text-amber-950 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Tóm tắt cấu hình bài tập:</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-bold text-slate-800">
                  <div>Độ tuổi: <span className="text-amber-900">{ageRange}</span></div>
                  <div>Chủ đề: <span className="text-amber-900">{topic || 'Con vật'}</span></div>
                  <div>Số câu: <span className="text-amber-900">{questionCount} câu</span></div>
                  <div>Số lựa chọn: <span className="text-amber-900 font-black">{effectiveChoicesCount} đáp án/câu</span></div>
                  <div>Đáp án đúng: <span className="text-amber-900">{answerType === 'single' ? '1 đáp án' : 'Nhiều'}</span></div>
                  <div>Giọng đọc: <span className="text-amber-900">Nữ tiếng Việt</span></div>
                </div>
              </div>

              {/* GENERATE ACTION BUTTON */}
              <div>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleGenerate}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>AI đang tạo đúng {effectiveChoicesCount} đáp án mỗi câu...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 fill-white" />
                      <span>✨ TẠO BÀI TẬP BẰNG AI ({effectiveChoicesCount} ĐÁP ÁN)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & CUSTOMIZE INDIVIDUAL QUESTIONS & CHOICES */}
          {generatedGame && (
            <div className="space-y-6">
              {/* Game Header Bar & Bulk Control */}
              <div className="p-4 bg-amber-50 rounded-3xl border-2 border-amber-300 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-xs">
                        {generatedGame.ageRange}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">
                        {generatedGame.items.length} câu hỏi
                      </span>
                      <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
                        {generatedGame.choicesCount} đáp án/câu mặc định
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                      {generatedGame.title}
                    </h3>
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

                {/* BULK APPLY BUTTON: "ÁP DỤNG CHO TẤT CẢ CÂU" */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-700">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>Đổi số đáp án mặc định:</span>
                    <div className="flex items-center gap-1">
                      {[2, 3, 4].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => handleApplyToAllQuestions(cnt)}
                          className={`px-3 py-1 rounded-xl font-bold border transition-all cursor-pointer ${
                            generatedGame.choicesCount === cnt
                              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {cnt} đáp án
                        </button>
                      ))}
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 italic">
                    * Bạn cũng có thể thêm/bớt đáp án riêng lẻ cho từng câu ở bên dưới.
                  </span>
                </div>
              </div>

              {/* QUESTIONS LIST WITH INTERACTIVE CHOICES */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
                    Danh sách câu hỏi & các lựa chọn:
                  </span>
                  <span className="text-xs text-slate-500">
                    Chỉnh sửa tự do, không bắt buộc các câu phải giống nhau
                  </span>
                </div>

                {generatedGame.items.map((item, itemIdx) => {
                  const choices = item.choices || [];
                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 bg-white rounded-3xl border-2 border-slate-200 hover:border-amber-300 shadow-xs space-y-4"
                    >
                      {/* Question Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-xl bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center">
                            {itemIdx + 1}
                          </span>
                          <span className="font-black text-sm text-slate-900">
                            Đối tượng: {item.name}
                          </span>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                            {choices.length} đáp án
                          </span>
                        </div>

                        {/* Test Voice Button */}
                        <button
                          type="button"
                          onClick={() => handleTestItemVoice(item.questionText, item.audioUrl)}
                          className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1.5 px-3 py-1 bg-amber-100 hover:bg-amber-200 rounded-xl cursor-pointer self-start sm:self-auto"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                          <span>Nghe thử câu này</span>
                        </button>
                      </div>

                      {/* Question Text Input */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                          Lời đọc câu hỏi:
                        </label>
                        <input
                          type="text"
                          value={item.questionText}
                          onChange={(e) => handleUpdateQuestionText(itemIdx, e.target.value)}
                          className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-400 focus:bg-white"
                        />
                      </div>

                      {/* Choices List for this Question */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                          <span>Các hình lựa chọn cho câu này:</span>
                          <button
                            type="button"
                            onClick={() => handleAddChoice(itemIdx)}
                            className="text-amber-800 hover:text-amber-950 flex items-center gap-1 text-xs font-black cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>➕ Thêm đáp án</span>
                          </button>
                        </div>

                        {/* Responsive choices layout based on choices.length */}
                        <div
                          className={`grid gap-2.5 ${
                            choices.length === 2
                              ? 'grid-cols-1 sm:grid-cols-2'
                              : choices.length === 3
                              ? 'grid-cols-1 sm:grid-cols-3'
                              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
                          }`}
                        >
                          {choices.map((choice, choiceIdx) => (
                            <div
                              key={choice.id}
                              className={`p-3 rounded-2xl border-2 flex flex-col justify-between gap-2.5 transition-all ${
                                choice.isCorrect
                                  ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              {/* Choice Image & Change Button */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setIconPickerTarget({ itemIdx, choiceIdx })}
                                  className="w-12 h-12 rounded-xl p-1 bg-white border border-slate-200 flex items-center justify-center shrink-0 hover:border-amber-400 cursor-pointer shadow-2xs group relative"
                                  title="Bấm để đổi hình ảnh"
                                >
                                  <img
                                    src={choice.imageUrl}
                                    alt={choice.name}
                                    className="w-full h-full object-contain"
                                  />
                                  <span className="absolute inset-0 bg-slate-900/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                                    Đổi
                                  </span>
                                </button>

                                <div className="flex-1 min-w-0">
                                  <input
                                    type="text"
                                    value={choice.name}
                                    onChange={(e) => handleUpdateChoiceName(itemIdx, choiceIdx, e.target.value)}
                                    className="w-full text-xs font-bold text-slate-800 bg-white px-2 py-1 rounded-lg border border-slate-200 focus:outline-hidden focus:border-amber-400"
                                  />
                                </div>
                              </div>

                              {/* Correct toggle & Control buttons */}
                              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                                {/* Toggle Correct / Wrong button */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleCorrectness(itemIdx, choiceIdx)}
                                  className={`px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer transition-all ${
                                    choice.isCorrect
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                  }`}
                                >
                                  {choice.isCorrect ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Đúng</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>○</span>
                                      <span>Sai</span>
                                    </>
                                  )}
                                </button>

                                {/* Move Up, Down, Delete buttons */}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveChoice(itemIdx, choiceIdx, 'up')}
                                    disabled={choiceIdx === 0}
                                    className="p-1 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                                    title="Đưa lên"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveChoice(itemIdx, choiceIdx, 'down')}
                                    disabled={choiceIdx === choices.length - 1}
                                    className="p-1 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                                    title="Đưa xuống"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteChoice(itemIdx, choiceIdx)}
                                    className="p-1 rounded-md text-rose-500 hover:bg-rose-100 cursor-pointer"
                                    title="Xóa đáp án này"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* QUICK ACTIONS BAR */}
              <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-xs uppercase text-slate-700">
                      Tùy chọn tạo kèm tự động:
                    </span>
                    <p className="text-xs text-slate-500">
                      Giúp hoàn tất trọn bộ học liệu mầm non chỉ trong 1 lần nhấn
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

      {/* ICON PICKER MODAL */}
      {iconPickerTarget && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full border-2 border-amber-300 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-black text-sm text-slate-800">Chọn hình ảnh thay thế:</span>
              <button
                type="button"
                onClick={() => setIconPickerTarget(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto p-1">
              {PRESET_ICONS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectIconForChoice(key)}
                  className="w-12 h-12 p-1.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 flex items-center justify-center cursor-pointer transition-all"
                  title={key}
                >
                  <img
                    src={getSvgForNameOrKey(key)}
                    alt={key}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SAFETY ALERT MODAL */}
      {safetyAlert && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-amber-300 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-amber-600 font-black text-base">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Lưu ý sư phạm</span>
            </div>
            <p className="text-sm font-semibold text-slate-700 leading-relaxed">
              {safetyAlert}
            </p>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSafetyAlert(null)}
                className="px-5 py-2 bg-amber-500 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM BULK REDUCE MODAL */}
      {confirmBulkChange && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-amber-300 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-amber-800 font-black text-base">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Xác nhận áp dụng cho tất cả câu</span>
            </div>
            <p className="text-sm font-semibold text-slate-700 leading-relaxed">
              Bạn muốn đưa tất cả câu về <strong>{confirmBulkChange.targetCount} lựa chọn</strong>?
              Hệ thống sẽ giữ nguyên đáp án đúng và tự động loại bớt các đáp án sai.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmBulkChange(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => executeBulkChange(confirmBulkChange.targetCount)}
                className="px-5 py-2 bg-amber-500 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
              >
                Đồng ý thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

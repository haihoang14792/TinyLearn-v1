import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Upload,
  Mic,
  MicOff,
  Volume2,
  Play,
  Save,
  Download,
  FolderOpen,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Settings2,
  Image as ImageIcon,
  Check,
  Radio,
  BarChart2,
  TrendingUp,
  Award,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { TopicGame, TopicItem, PreschoolSettings, TopicProgressStat, GameType } from '../types.ts';
import { ILLUSTRATIONS, PRESET_LIBRARY, svgToDataUrl } from '../data/illustrations.ts';
import { audioEngine, AvailableVoice, VietnameseFemaleVoiceOption } from '../utils/audio.ts';
import { stripSSML, buildToddlerQuestionSSML } from '../utils/ssml.ts';
import { hapticsEngine } from '../utils/haptics.ts';
import { VoiceRecorder } from '../utils/recorder.ts';
import { exportGamesToJson, importGamesFromJsonFile, loadProgressStats, resetProgressStats } from '../utils/storage.ts';

interface TeacherStudioProps {
  isOpen: boolean;
  games: TopicGame[];
  currentGameId: string;
  settings: PreschoolSettings;
  onSaveGames: (games: TopicGame[]) => void;
  onSelectGame: (game: TopicGame) => void;
  onUpdateSettings: (settings: PreschoolSettings) => void;
  onClose: () => void;
}

export const TeacherStudio: React.FC<TeacherStudioProps> = ({
  isOpen,
  games,
  currentGameId,
  settings,
  onSaveGames,
  onSelectGame,
  onUpdateSettings,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'settings' | 'stats'>('create');
  const [progressStats, setProgressStats] = useState<Record<string, TopicProgressStat>>({});

  useEffect(() => {
    if (isOpen) {
      setProgressStats(loadProgressStats());
    }
  }, [isOpen, activeTab]);

  const handleResetProgress = () => {
    if (window.confirm('Cô có chắc chắn muốn đặt lại toàn bộ số liệu thống kê của bé không? Dữ liệu sẽ được làm mới về 0.')) {
      resetProgressStats();
      setProgressStats({});
      setToastMessage('Đã làm mới dữ liệu thống kê tiến bộ của bé!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // FAST GENERATOR FORM STATE (Tên trò chơi → chủ đề → 3 hình → 3 câu hỏi → âm thanh → đáp án)
  const [formTitle, setFormTitle] = useState('Bé tìm đồ chơi yêu thích');
  const [formTopic, setFormTopic] = useState('Đồ dùng & Con vật');
  const [formGameType, setFormGameType] = useState<GameType>('listen_find');
  const [formPuzzlePieces, setFormPuzzlePieces] = useState<2 | 3 | 4 | 6>(4);
  const [formChoicesCount, setFormChoicesCount] = useState<2 | 3>(3);
  const [formItems, setFormItems] = useState<TopicItem[]>([
    {
      id: 'item-1',
      name: 'Mèo',
      soundText: 'Meo meo',
      questionText: 'Con gì kêu meo meo? Tìm bạn Mèo nào!',
      imageUrl: svgToDataUrl(ILLUSTRATIONS.cat),
      bgColor: '#FEF3C7'
    },
    {
      id: 'item-2',
      name: 'Chó',
      soundText: 'Gâu gâu',
      questionText: 'Con gì kêu gâu gâu? Tìm bạn Chó nào!',
      imageUrl: svgToDataUrl(ILLUSTRATIONS.dog),
      bgColor: '#FFEDD5'
    },
    {
      id: 'item-3',
      name: 'Vịt',
      soundText: 'Cạp cạp',
      questionText: 'Con gì kêu cạp cạp? Tìm bạn Vịt nào!',
      imageUrl: svgToDataUrl(ILLUSTRATIONS.duck),
      bgColor: '#FEF9C3'
    }
  ]);

  // Voice recording state
  const [recordingItemId, setRecordingItemId] = useState<string | null>(null);
  const recorderRef = useRef<VoiceRecorder | null>(null);

  // Library picker modal state
  const [presetPickerIndex, setPresetPickerIndex] = useState<number | null>(null);

  // Success message toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Available voices detected on client
  const [availableVoices, setAvailableVoices] = useState<AvailableVoice[]>([]);
  const [vietnameseFemaleVoices, setVietnameseFemaleVoices] = useState<VietnameseFemaleVoiceOption[]>([]);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [testPhrase, setTestPhrase] = useState('Con gì kêu meo meo? Tìm bạn Mèo nào!');

  useEffect(() => {
    if (isOpen) {
      const vList = audioEngine.getAvailableVoices();
      setAvailableVoices(vList);
      const hqVoices = audioEngine.getHighQualityVietnameseFemaleVoices();
      setVietnameseFemaleVoices(hqVoices);
      audioEngine.setVoiceMode(settings.voiceMode || 'ai_preferred');
      if (settings.preferredVoiceURI) {
        audioEngine.setPreferredVoice(settings.preferredVoiceURI);
      } else if (hqVoices.length > 0) {
        audioEngine.setPreferredVoice(hqVoices[0].voiceURI);
      }
    }
  }, [isOpen, settings.voiceMode, settings.preferredVoiceURI]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!isOpen) return null;

  // Handle uploading local photo
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, itemIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormItems((prev) => {
        const next = [...prev];
        next[itemIndex] = { ...next[itemIndex], imageUrl: dataUrl };
        return next;
      });
      showToast(`Đã tải ảnh lên cho mục ${formItems[itemIndex].name || itemIndex + 1}!`);
    };
    reader.readAsDataURL(file);
  };

  // Handle uploading local audio file (MP3/WAV)
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>, itemIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormItems((prev) => {
        const next = [...prev];
        next[itemIndex] = { ...next[itemIndex], audioUrl: dataUrl };
        return next;
      });
      showToast(`Đã đính kèm file âm thanh cho ${formItems[itemIndex].name}!`);
      // Preview audio immediately
      audioEngine.playAudioUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Start live voice recording
  const startRecording = async (itemIndex: number) => {
    const item = formItems[itemIndex];
    if (!recorderRef.current) {
      recorderRef.current = new VoiceRecorder();
    }
    const ok = await recorderRef.current.start();
    if (ok) {
      setRecordingItemId(item.id);
      showToast('Đang thu âm giọng cô... Hãy nói to, rõ ràng nhé!');
    } else {
      alert('Không thể truy cập microphone. Vui lòng cho phép quyền truy cập micro trong trình duyệt.');
    }
  };

  // Stop live voice recording
  const stopRecording = async (itemIndex: number) => {
    if (!recorderRef.current) return;
    try {
      const audioBase64 = await recorderRef.current.stop();
      setRecordingItemId(null);
      setFormItems((prev) => {
        const next = [...prev];
        next[itemIndex] = { ...next[itemIndex], audioUrl: audioBase64 };
        return next;
      });
      showToast('Đã lưu bản thu âm giọng cô thành công!');
      // Playback review
      audioEngine.playAudioUrl(audioBase64);
    } catch {
      setRecordingItemId(null);
      alert('Thu âm thất bại, vui lòng thử lại.');
    }
  };

  // Listen to item voice preview (uploaded or speech synthesis)
  const handleTestAudio = (item: TopicItem) => {
    if (item.audioUrl) {
      audioEngine.playAudioUrl(item.audioUrl);
    } else {
      audioEngine.speakVietnamese(item.questionText || `${item.name}. ${item.soundText}`, {
        rate: settings.speechRate,
        pitch: settings.speechPitch
      });
    }
  };

  // Pick preset from library
  const handleSelectPreset = (preset: typeof PRESET_LIBRARY[0]) => {
    if (presetPickerIndex === null) return;
    const svgStr = ILLUSTRATIONS[preset.id];
    const imgUrl = svgStr ? svgToDataUrl(svgStr) : '';

    setFormItems((prev) => {
      const next = [...prev];
      next[presetPickerIndex] = {
        ...next[presetPickerIndex],
        name: preset.name,
        soundText: preset.sound,
        questionText: preset.question,
        imageUrl: imgUrl || next[presetPickerIndex].imageUrl
      };
      return next;
    });

    setPresetPickerIndex(null);
    showToast(`Đã áp dụng mẫu: ${preset.name}!`);
  };

  // Add another card (allow up to 6 items)
  const handleAddItem = () => {
    if (formItems.length >= 6) {
      alert('Mỗi bài học cho trẻ 12–24 tháng nên có tối đa 6 đối tượng để bé không bị quá tải.');
      return;
    }
    const newIdx = formItems.length + 1;
    const colors = ['#FEF3C7', '#FFEDD5', '#FEF9C3', '#FEE2E2', '#E0F2FE', '#DCFCE7'];
    const chosenColor = colors[newIdx % colors.length];

    setFormItems((prev) => [
      ...prev,
      {
        id: `custom-item-${Date.now()}-${newIdx}`,
        name: `Đối tượng ${newIdx}`,
        soundText: '',
        questionText: `Bé hãy tìm hình này nào!`,
        imageUrl: svgToDataUrl(ILLUSTRATIONS.apple),
        bgColor: chosenColor
      }
    ]);
  };

  // Remove an item (keep at least 2 or 3)
  const handleRemoveItem = (index: number) => {
    if (formItems.length <= 2) {
      alert('Trò chơi cần ít nhất 2 đối tượng để trẻ lựa chọn.');
      return;
    }
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  };

  // SUBMIT FORM: Tự sinh trò chơi & chơi ngay!
  const handleGenerateGame = () => {
    if (!formTitle.trim()) {
      alert('Vui lòng nhập tên trò chơi!');
      return;
    }

    // Validate items
    for (let i = 0; i < formItems.length; i++) {
      if (!formItems[i].name.trim()) {
        alert(`Vui lòng nhập tên cho hình số ${i + 1}`);
        return;
      }
      if (!formItems[i].questionText.trim()) {
        formItems[i].questionText = `Đâu là bạn ${formItems[i].name}? Bé tìm nào!`;
      }
    }

    const newGame: TopicGame = {
      id: `game-custom-${Date.now()}`,
      title: formTitle.trim(),
      topic: formTopic.trim() || 'Chủ đề mầm non',
      ageRange: '12–24 tháng',
      gameType: formGameType,
      puzzlePieces: formPuzzlePieces,
      description: `Trò chơi tương tác do cô giáo tạo cho trẻ 12-24 tháng.`,
      choicesCount: formChoicesCount,
      items: formItems,
      createdAt: Date.now()
    };

    const updatedGames = [newGame, ...games];
    onSaveGames(updatedGames);
    onSelectGame(newGame);
    onClose();
    audioEngine.playSuccessChime();
  };

  // Load a game into the form for editing
  const handleEditGameInForm = (g: TopicGame) => {
    setFormTitle(g.title);
    setFormTopic(g.topic);
    setFormGameType(g.gameType || 'listen_find');
    setFormPuzzlePieces(g.puzzlePieces || 4);
    setFormChoicesCount(g.choicesCount || 3);
    setFormItems(g.items.map((it) => ({ ...it })));
    setActiveTab('create');
    showToast(`Đã nạp bài học "${g.title}" vào bảng tạo!`);
  };

  // Delete a game
  const handleDeleteGame = (gameId: string) => {
    if (games.length <= 1) {
      alert('Không thể xoá hết bài học, cần ít nhất 1 bài để bé chơi.');
      return;
    }
    if (confirm('Cô giáo có chắc muốn xoá chủ đề này không?')) {
      const filtered = games.filter((g) => g.id !== gameId);
      onSaveGames(filtered);
      if (currentGameId === gameId) {
        onSelectGame(filtered[0]);
      }
      showToast('Đã xoá chủ đề.');
    }
  };

  // Handle JSON import
  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importGamesFromJsonFile(file);
      const combined = [...imported, ...games.filter((g) => !imported.some((imp) => imp.id === g.id))];
      onSaveGames(combined);
      onSelectGame(imported[0]);
      showToast(`Đã nhập thành công ${imported.length} bài học từ file!`);
    } catch {
      alert('Lỗi: File JSON không đúng định dạng TinyLearn.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-4xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border-4 border-amber-300 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* HEADER */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 flex items-center justify-between border-b-2 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-2xl">
              🎓
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-950">
                Góc Giáo Viên & Phụ Huynh TinyLearn
              </h2>
              <p className="text-xs sm:text-sm font-bold text-amber-900">
                Tự sinh trò chơi nghe & chọn hình cho trẻ 12–24 tháng mà không cần sửa code!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-white/80 hover:bg-white text-amber-950 flex items-center justify-center active:scale-95 transition-all shadow-xs"
            aria-label="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-sm sm:text-base rounded-t-2xl border-t-2 border-x-2 transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white border-amber-400 text-amber-950 shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>⚡ Form Tự Sinh Trò Chơi</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-sm sm:text-base rounded-t-2xl border-t-2 border-x-2 transition-all cursor-pointer ${
              activeTab === 'manage'
                ? 'bg-white border-amber-400 text-amber-950 shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-sky-500" />
            <span>📚 Quản Lý Giáo Án ({games.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-sm sm:text-base rounded-t-2xl border-t-2 border-x-2 transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-white border-amber-400 text-amber-950 shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-purple-600" />
            <span>📊 Tiến Bộ Của Bé</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-sm sm:text-base rounded-t-2xl border-t-2 border-x-2 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white border-amber-400 text-amber-950 shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings2 className="w-4 h-4 text-emerald-500" />
            <span>⚙️ Cài Đặt Âm Thanh & Trẻ Em</span>
          </button>
        </div>

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-center text-sm font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* TAB 1: FORM TỰ SINH TRÒ CHƠI CHO GIÁO VIÊN */}
        {activeTab === 'create' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Guide banner */}
            <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="text-xs sm:text-sm text-slate-700">
                <span className="font-bold text-amber-900">Quy trình tự sinh trò chơi: </span>
                Nhập <strong>Tên trò chơi → Chủ đề → 3 hình ảnh → 3 câu hỏi → Âm thanh → Đáp án</strong>.
                Bấm nút <strong>&ldquo;Tự Sinh Trò Chơi & Chơi Ngay&rdquo;</strong>, hệ thống TinyLearn sẽ tự dựng giao diện tương tác lớn, phát âm thanh và hiệu ứng khen ngợi cho bé!
              </div>
            </div>

            {/* Basic metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  1. Tên trò chơi:
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Bé nghe tiếng con vật, Bé nhận biết quả ngọt..."
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-hidden font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  2. Chủ đề:
                </label>
                <select
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-hidden font-bold text-slate-800 bg-white"
                >
                  <option value="Con vật">Con vật quen thuộc</option>
                  <option value="Trái cây">Trái cây màu sắc</option>
                  <option value="Màu sắc">Màu sắc cơ bản</option>
                  <option value="Phương tiện giao thông">Phương tiện giao thông</option>
                  <option value="Đồ dùng trong lớp">Đồ dùng trong lớp</option>
                  <option value="Bộ phận cơ thể">Bộ phận cơ thể</option>
                  <option value="Tự do">Chủ đề khác...</option>
                </select>
              </div>
            </div>

            {/* Layout & Game Type choice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-700">
                  Dạng hoạt động tương tác:
                </label>
                <select
                  value={formGameType}
                  onChange={(e) => setFormGameType(e.target.value as GameType)}
                  className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl font-bold text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                >
                  <option value="listen_find">1. Nghe và tìm hình (Chuẩn mầm non)</option>
                  <option value="drag_drop">2. Kéo thả vào bóng / giỏ (Rèn vận động tinh)</option>
                  <option value="puzzle_jigsaw">3. Ghép tranh (Set 2, 3, 4, 6 mảnh)</option>
                  <option value="team_battle">4. Thi đấu 2 đội (Thỏ Trắng vs Gấu Nâu)</option>
                  <option value="touch_explore">5. Chạm để nghe (12–18 tháng)</option>
                  <option value="match_similar">6. Tìm hình giống mẫu (18–24 tháng)</option>
                  <option value="who_disappeared">7. Ai biến mất? (Luyện trí nhớ)</option>
                </select>

                {formGameType === 'puzzle_jigsaw' && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Số mảnh ghép:</span>
                    {([2, 3, 4, 6] as const).map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setFormPuzzlePieces(cnt)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black border transition-all ${
                          formPuzzlePieces === cnt
                            ? 'bg-purple-500 border-purple-600 text-white'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {cnt} mảnh
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="font-bold text-xs uppercase text-slate-700 block mb-1">
                    Số lượng hình lựa chọn:
                  </span>
                  <p className="text-xs text-slate-500 mb-2">Trẻ 12–15 tháng nên dùng 2 hình, 18–24 tháng dùng 3 hình.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormChoicesCount(2)}
                    className={`flex-1 px-3 py-1.5 rounded-xl font-bold text-xs border-2 transition-all ${
                      formChoicesCount === 2
                        ? 'bg-amber-400 border-amber-500 text-amber-950'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    2 Hình lớn
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormChoicesCount(3)}
                    className={`flex-1 px-3 py-1.5 rounded-xl font-bold text-xs border-2 transition-all ${
                      formChoicesCount === 3
                        ? 'bg-amber-400 border-amber-500 text-amber-950'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    3 Hình (Chuẩn)
                  </button>
                </div>
              </div>
            </div>

            {/* THE 3-6 ITEM CARDS FORM */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                  <span>3. Thiết lập các hình ảnh, âm thanh & câu hỏi ({formItems.length} đối tượng):</span>
                </h3>
                {formItems.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-xs active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm hình thứ {formItems.length + 1}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border-3 border-amber-200/90 p-4 shadow-sm flex flex-col justify-between relative group hover:border-amber-400 transition-all"
                  >
                    {/* Item badge number */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-7 h-7 rounded-xl bg-amber-400 text-amber-950 font-black text-sm flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {formItems.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="w-7 h-7 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center active:scale-90"
                          title="Xoá hình này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Image Preview & Pickers */}
                    <div className="mb-3">
                      <div className="w-full h-36 rounded-2xl bg-amber-50/60 border-2 border-dashed border-amber-200 flex items-center justify-center p-2 overflow-hidden relative">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Image Action buttons: Pick from library or Upload from phone/PC */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setPresetPickerIndex(idx)}
                          className="py-1.5 px-2 bg-slate-100 hover:bg-amber-100 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95"
                          title="Chọn từ thư viện vẽ sẵn"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Chọn mẫu</span>
                        </button>

                        <label className="py-1.5 px-2 bg-slate-100 hover:bg-amber-100 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-95 text-center">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải ảnh lên</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileUpload(e, idx)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Name & Sound */}
                    <div className="space-y-2 mb-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">
                          Tên đối tượng (đáp án):
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormItems((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], name: val };
                              return next;
                            });
                          }}
                          placeholder="Mèo, Chó, Vịt..."
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:border-amber-400 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">
                          Âm thanh / Mô tả ngắn:
                        </label>
                        <input
                          type="text"
                          value={item.soundText}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormItems((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], soundText: val };
                              return next;
                            });
                          }}
                          placeholder="Meo meo, Gâu gâu..."
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:border-amber-400 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase">
                            Câu hỏi đọc cho bé nghe:
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const current = item.questionText || '';
                              const updated = current ? `${current} <break time="450ms"/> ` : '<break time="450ms"/> ';
                              setFormItems((prev) => {
                                const next = [...prev];
                                next[idx] = { ...next[idx], questionText: updated };
                                return next;
                              });
                            }}
                            className="text-[10px] px-1.5 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-bold transition-all active:scale-95"
                            title="Thêm khoảng dừng tự nhiên để bé kịp nghe hiểu"
                          >
                            + Ngắt nghỉ (&lt;break/&gt;)
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={item.questionText}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormItems((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], questionText: val };
                              return next;
                            });
                          }}
                          placeholder="Con gì kêu meo meo? Tìm bạn Mèo nào!"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 focus:border-amber-400 focus:outline-hidden resize-none"
                        />
                      </div>
                    </div>

                    {/* Audio & Voice Recording Controls */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                      <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                        <span>Âm thanh câu hỏi:</span>
                        {item.audioUrl ? (
                          <span className="text-emerald-600 font-bold">✓ Đã có file âm thanh</span>
                        ) : (
                          <span className="text-amber-700">Dùng giọng Việt chuẩn</span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        {/* Record Voice Button */}
                        {recordingItemId === item.id ? (
                          <button
                            type="button"
                            onClick={() => stopRecording(idx)}
                            className="py-1.5 px-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95 animate-pulse"
                            title="Bấm để dừng và lưu bản thu"
                          >
                            <MicOff className="w-3.5 h-3.5" />
                            <span>Dừng thu</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startRecording(idx)}
                            className="py-1.5 px-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95"
                            title="Ghi âm giọng cô bằng micro"
                          >
                            <Mic className="w-3.5 h-3.5" />
                            <span>Thu âm</span>
                          </button>
                        )}

                        {/* Upload MP3/WAV */}
                        <label className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-95 text-center">
                          <Upload className="w-3.5 h-3.5" />
                          <span>MP3/WAV</span>
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleAudioFileUpload(e, idx)}
                            className="hidden"
                          />
                        </label>

                        {/* Preview Audio */}
                        <button
                          type="button"
                          onClick={() => handleTestAudio(item)}
                          className="py-1.5 px-2 bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95"
                          title="Nghe thử âm thanh phát ra cho bé"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Nghe thử</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION: GENERATE GAME AND PLAY IMMEDIATELY */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                ✨ Trò chơi tự động lưu vào bộ nhớ trình duyệt, có thể xuất thành file để chia sẻ cho các cô giáo khác.
              </div>

              <button
                type="button"
                onClick={handleGenerateGame}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl shadow-lg border-b-4 border-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Sparkles className="w-6 h-6" />
                <span>TỰ SINH TRÒ CHƠI & CHƠI NGAY!</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: QUẢN LÝ CÁC CHỦ ĐỀ & GIÁO ÁN */}
        {activeTab === 'manage' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2">
              <div>
                <h3 className="font-black text-lg text-slate-900">Danh sách bài học TinyLearn</h3>
                <p className="text-xs text-slate-500">Giáo viên có thể xuất giáo án ra file để gửi qua Zalo/Drive hoặc tải giáo án của đồng nghiệp vào.</p>
              </div>

              {/* Import/Export buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportGamesToJson(games)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs active:scale-95 transition-all shadow-2xs"
                  title="Tải toàn bộ giáo án ra file .json"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Xuất file JSON</span>
                </button>

                <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs active:scale-95 transition-all shadow-2xs cursor-pointer">
                  <Upload className="w-4 h-4 text-sky-600" />
                  <span>Nhập file JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {games.map((g) => (
                <div
                  key={g.id}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                    g.id === currentGameId
                      ? 'bg-amber-50/80 border-amber-400 shadow-sm'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                        {g.topic}
                      </span>
                      {g.isBuiltIn && (
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          Mặc định
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-black text-slate-900 mb-1">{g.title}</h4>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{g.description}</p>

                    {/* Previews */}
                    <div className="flex items-center gap-2 mb-4">
                      {g.items.slice(0, 4).map((it) => (
                        <div
                          key={it.id}
                          className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center overflow-hidden"
                        >
                          <img src={it.imageUrl} alt={it.name} className="w-full h-full object-contain" />
                        </div>
                      ))}
                      <span className="text-xs font-bold text-slate-500">
                        ({g.items.length} hình)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        onSelectGame(g);
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Cho bé chơi</span>
                    </button>

                    <button
                      onClick={() => handleEditGameInForm(g)}
                      className="py-2 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl active:scale-95 transition-all"
                      title="Chỉnh sửa bài học này trong Form"
                    >
                      Sửa
                    </button>

                    {games.length > 1 && (
                      <button
                        onClick={() => handleDeleteGame(g.id)}
                        className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl active:scale-95 transition-all cursor-pointer"
                        title="Xoá bài học này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BẢNG ĐIỀU KHIỂN TIẾN BỘ CỦA BÉ */}
        {activeTab === 'stats' && (() => {
          const statEntries = Object.values(progressStats);
          const totalCorrect = statEntries.reduce((sum, s) => sum + (s.correctCount || 0), 0);
          const totalWrong = statEntries.reduce((sum, s) => sum + (s.wrongCount || 0), 0);
          const totalAttempts = totalCorrect + totalWrong;
          const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
          const totalRoundsCompleted = statEntries.reduce((sum, s) => sum + (s.completedRounds || 0), 0);

          return (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* TOP HEADER & RESET BUTTON */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200">
                <div>
                  <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                    <span>Bảng Theo Dõi Tiến Bộ Của Bé</span>
                    <span className="text-xs bg-purple-100 text-purple-900 font-bold px-2.5 py-0.5 rounded-full">
                      Dành cho Giáo viên & Phụ huynh
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Ghi nhận tự động số lần bé chọn đúng và sai theo từng chủ đề để giáo viên nắm bắt khả năng phản xạ và từ vựng của trẻ.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetProgress}
                  disabled={totalAttempts === 0}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-rose-200 active:scale-95 transition-all flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-40 disabled:pointer-events-none"
                  title="Đặt lại toàn bộ số liệu thống kê để bắt đầu buổi theo dõi mới"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Làm mới số liệu</span>
                </button>
              </div>

              {/* OVERVIEW KPI CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* Correct */}
                <div className="bg-emerald-50/90 border-2 border-emerald-200 p-4 rounded-3xl flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-800 uppercase">Chọn đúng</span>
                    <span className="text-xl">🌟</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-950">{totalCorrect}</div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1">Lần bé nhận diện đúng</div>
                </div>

                {/* Wrong */}
                <div className="bg-rose-50/90 border-2 border-rose-200 p-4 rounded-3xl flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-rose-800 uppercase">Cần thử lại</span>
                    <span className="text-xl">💛</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-rose-950">{totalWrong}</div>
                  <div className="text-[11px] text-rose-700 font-semibold mt-1">Lần bé chọn nhầm</div>
                </div>

                {/* Accuracy */}
                <div className="bg-amber-50/90 border-2 border-amber-200 p-4 rounded-3xl flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-800 uppercase">Độ chính xác</span>
                    <span className="text-xl">🎯</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-amber-950">{overallAccuracy}%</div>
                  <div className="text-[11px] text-amber-800 font-semibold mt-1">
                    {totalAttempts === 0
                      ? 'Chưa có lượt chơi'
                      : overallAccuracy >= 80
                      ? 'Rất xuất sắc! 👏'
                      : overallAccuracy >= 60
                      ? 'Đang tiến bộ tốt 👍'
                      : 'Cần luyện tập thêm 🌱'}
                  </div>
                </div>

                {/* Completed Rounds */}
                <div className="bg-purple-50/90 border-2 border-purple-200 p-4 rounded-3xl flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-purple-800 uppercase">Vòng hoàn thành</span>
                    <span className="text-xl">🏆</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-purple-950">{totalRoundsCompleted}</div>
                  <div className="text-[11px] text-purple-700 font-semibold mt-1">Lần hoàn thành trọn bộ</div>
                </div>
              </div>

              {/* EMPTY STATE */}
              {totalAttempts === 0 && (
                <div className="bg-amber-50/60 border-2 border-dashed border-amber-300 rounded-3xl p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl mx-auto shadow-2xs">
                    🎈
                  </div>
                  <h4 className="font-black text-slate-800 text-base sm:text-lg">
                    Chưa có lượt chơi nào được ghi nhận
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                    Hãy bấm vào một chủ đề bên dưới hoặc chọn chủ đề trên màn hình chính để bé bắt đầu nghe và chạm vào hình. Hệ thống sẽ tự động cập nhật số lần đúng/sai tại đây!
                  </p>
                </div>
              )}

              {/* DETAILED STATS PER TOPIC */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <span>Thống kê chi tiết theo từng chủ đề ({games.length})</span>
                  </h4>
                  <span className="text-xs font-semibold text-slate-500">
                    Cập nhật thời gian thực
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {games.map((game) => {
                    const stat = progressStats[game.id];
                    const correct = stat ? stat.correctCount || 0 : 0;
                    const wrong = stat ? stat.wrongCount || 0 : 0;
                    const attempts = correct + wrong;
                    const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
                    const rounds = stat ? stat.completedRounds || 0 : 0;
                    const itemStats = stat ? stat.itemStats || {} : {};

                    return (
                      <div
                        key={game.id}
                        className={`bg-white rounded-3xl border-2 p-5 space-y-4 transition-all shadow-xs ${
                          attempts > 0 ? 'border-slate-200 hover:border-amber-400' : 'border-slate-100 opacity-90'
                        }`}
                      >
                        {/* Topic Header & Accuracy Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-lg font-black shadow-2xs">
                              🐾
                            </div>
                            <div>
                              <div className="text-xs font-bold text-amber-700">{game.topic}</div>
                              <h5 className="font-black text-slate-900 text-base">{game.title}</h5>
                            </div>
                          </div>

                          {attempts > 0 ? (
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                                accuracy >= 80
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : accuracy >= 60
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-rose-100 text-rose-900 border-rose-300'
                              }`}
                            >
                              {accuracy}% đúng
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                              Chưa chơi
                            </span>
                          )}
                        </div>

                        {/* Dual-Color Progress Bar */}
                        {attempts > 0 ? (
                          <div className="space-y-1.5">
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                              <div
                                style={{ width: `${accuracy}%` }}
                                className="h-full bg-emerald-500 transition-all duration-500"
                                title={`Đúng: ${correct} lần (${accuracy}%)`}
                              />
                              <div
                                style={{ width: `${100 - accuracy}%` }}
                                className="h-full bg-rose-400 transition-all duration-500"
                                title={`Cần thử lại: ${wrong} lần (${100 - accuracy}%)`}
                              />
                            </div>

                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-emerald-700 flex items-center gap-1">
                                <span>🌟 Đúng:</span>
                                <span>{correct} lần</span>
                              </span>
                              <span className="text-rose-700 flex items-center gap-1">
                                <span>💛 Thử lại:</span>
                                <span>{wrong} lần</span>
                              </span>
                              <span className="text-purple-700 flex items-center gap-1">
                                <span>🏆 Hoàn thành:</span>
                                <span>{rounds} vòng</span>
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-2 px-3 bg-slate-50 rounded-xl text-xs text-slate-500 italic">
                            Chưa có dữ liệu lượt chơi cho chủ đề này.
                          </div>
                        )}

                        {/* Item-by-item breakdown if available */}
                        {game.items && game.items.length > 0 && attempts > 0 && (
                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">
                              Chi tiết từng thẻ hình:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {game.items.map((it) => {
                                const itStat = itemStats[it.id];
                                const itCorrect = itStat ? itStat.correct : 0;
                                const itWrong = itStat ? itStat.wrong : 0;
                                const itTotal = itCorrect + itWrong;
                                const itRate = itTotal > 0 ? Math.round((itCorrect / itTotal) * 100) : 0;

                                return (
                                  <div
                                    key={it.id}
                                    className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 border font-semibold ${
                                      itTotal === 0
                                        ? 'bg-slate-50 text-slate-400 border-slate-200'
                                        : itRate >= 75
                                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                        : itRate >= 50
                                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                                        : 'bg-rose-50 text-rose-900 border-rose-200'
                                    }`}
                                  >
                                    <span className="font-bold text-slate-800">{it.name}:</span>
                                    {itTotal > 0 ? (
                                      <span>
                                        {itCorrect} đúng / {itWrong} sai ({itRate}%)
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-400">chưa chạm</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Play Now Button */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectGame(game);
                              onClose();
                            }}
                            className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-xl font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-2xs"
                          >
                            <Play className="w-3.5 h-3.5 fill-amber-950" />
                            <span>Mở chủ đề cho bé chơi ngay</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 3: CÀI ĐẶT MẦM NON & GIỌNG NÓI TIẾNG VIỆT */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-6">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Cấu hình Giọng Đọc Chuẩn Tiếng Việt</h3>
                <p className="text-xs text-slate-500">
                  Tối ưu cho trẻ 12–24 tháng nghe rõ từng từ, ngữ điệu truyền cảm, phát âm tròn vành rõ chữ.
                </p>
              </div>

              {/* VOICE MODE SELECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">1. Chế độ nguồn giọng đọc:</span>
                  {audioEngine.getIsAIFallbackActive() && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span>✓</span>
                      <span>Đang tự động dùng Giọng Trình Duyệt ổn định</span>
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...settings, voiceMode: 'ai_preferred' as const };
                      onUpdateSettings(updated);
                      audioEngine.setVoiceMode('ai_preferred');
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      (settings.voiceMode || 'ai_preferred') === 'ai_preferred'
                        ? 'bg-amber-50/90 border-amber-500 ring-3 ring-amber-200 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-amber-950 flex items-center gap-1.5">
                        <span>🌟</span>
                        <span>Giọng Nữ Người Việt Nam Chuẩn</span>
                      </span>
                      {(settings.voiceMode || 'ai_preferred') === 'ai_preferred' && (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      100% giọng nữ người Việt Nam bản xứ (chuẩn Hà Nội), phát âm tròn vành rõ chữ mọi thanh dấu (hỏi, ngã, nặng, sắc, huyền), ngọt ngào cho trẻ mầm non.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...settings, voiceMode: 'browser_only' as const };
                      onUpdateSettings(updated);
                      audioEngine.setVoiceMode('browser_only');
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      settings.voiceMode === 'browser_only'
                        ? 'bg-amber-50/90 border-amber-500 ring-3 ring-amber-200 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <span>💻</span>
                        <span>Giọng Máy Trình Duyệt</span>
                      </span>
                      {settings.voiceMode === 'browser_only' && (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      Sử dụng giọng tiếng Việt cài đặt sẵn trên máy tính, iPad hoặc điện thoại của giáo viên.
                    </p>
                  </button>
                </div>
              </div>

              {/* BROWSER HIGH QUALITY VIETNAMESE FEMALE VOICES DROPDOWN & TESTING */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                        2. Giọng Nữ Tiếng Việt Trình Duyệt (Web Speech API)
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {vietnameseFemaleVoices.length > 0
                          ? `${vietnameseFemaleVoices.length} giọng nữ sẵn sàng`
                          : 'Tự động chọn giọng nữ tối ưu'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Menu thả xuống chỉ liệt kê các giọng đọc nữ tiếng Việt chất lượng cao (loại bỏ hoàn toàn giọng nam và giọng lơ lớ).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const vList = audioEngine.getAvailableVoices();
                      setAvailableVoices(vList);
                      const hqVoices = audioEngine.getHighQualityVietnameseFemaleVoices();
                      setVietnameseFemaleVoices(hqVoices);
                      showToast(`Đã quét lại! Tìm thấy ${hqVoices.length} giọng nữ tiếng Việt.`);
                    }}
                    className="text-xs text-amber-900 hover:text-amber-950 font-bold bg-white hover:bg-amber-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-300 transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-2xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Quét lại giọng</span>
                  </button>
                </div>

                {/* THE DROPDOWN SELECT */}
                <div className="space-y-1.5">
                  <label htmlFor="vietnamese-voice-dropdown" className="block text-xs font-bold text-slate-700">
                    Danh sách giọng đọc nữ tiếng Việt (Chọn giọng phù hợp nhất cho trẻ):
                  </label>

                  <div className="relative">
                    <select
                      id="vietnamese-voice-dropdown"
                      value={settings.preferredVoiceURI || (vietnameseFemaleVoices[0]?.voiceURI || '')}
                      onChange={(e) => {
                        const newVoiceURI = e.target.value;
                        const updated = { ...settings, preferredVoiceURI: newVoiceURI };
                        onUpdateSettings(updated);
                        audioEngine.setPreferredVoice(newVoiceURI);
                        showToast('Đã chọn giọng đọc ưu tiên cho bé!');
                      }}
                      className="w-full bg-white border-2 border-slate-300 hover:border-amber-400 focus:border-amber-500 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 shadow-xs appearance-none focus:outline-hidden focus:ring-4 focus:ring-amber-200/50 transition-all cursor-pointer pr-10"
                    >
                      {vietnameseFemaleVoices.length > 0 ? (
                        vietnameseFemaleVoices.map((v) => (
                          <option key={v.voiceURI} value={v.voiceURI}>
                            {v.isRecommended ? '🌟 ' : '👩 '}
                            {v.displayName} — [{v.provider} • {v.qualityRating}]
                          </option>
                        ))
                      ) : (
                        <option value="">
                          🌟 Tự động chọn giọng nữ tiếng Việt chuẩn trên thiết bị
                        </option>
                      )}
                    </select>

                    <div className="absolute inset-y-0 right-0 flex items-center px-3.5 pointer-events-none text-slate-500">
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                </div>

                {/* TESTING PANEL FOR TEACHERS */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
                        <span>Chọn câu mẫu mầm non để nghe thử:</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'Con gì kêu meo meo? Tìm bạn Mèo nào!',
                          'Bé giỏi quá! Hoan hô con!',
                          'Quả táo màu đỏ ở đâu nào?'
                        ].map((phrase) => (
                          <button
                            key={phrase}
                            type="button"
                            onClick={() => setTestPhrase(phrase)}
                            className={`text-xs px-2.5 py-1 rounded-xl border font-semibold transition-all cursor-pointer ${
                              testPhrase === phrase
                                ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-2xs font-bold'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {phrase}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* BIG TEST BUTTON */}
                    <button
                      type="button"
                      disabled={isTestingVoice}
                      onClick={() => {
                        setIsTestingVoice(true);
                        const selectedURI = settings.preferredVoiceURI || (vietnameseFemaleVoices[0]?.voiceURI || '');
                        if (selectedURI) {
                          audioEngine.setPreferredVoice(selectedURI);
                        }
                        audioEngine.speakBrowserVietnamese(testPhrase, {
                          rate: settings.speechRate || 0.88,
                          pitch: settings.speechPitch || 1.04,
                          onEnd: () => setIsTestingVoice(false),
                        });
                      }}
                      className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs shrink-0 disabled:opacity-50 cursor-pointer"
                      title="Bấm để kiểm tra ngữ điệu phát âm của giọng đọc đã chọn"
                    >
                      {isTestingVoice ? (
                        <>
                          <Volume2 className="w-4 h-4 animate-bounce text-amber-950" />
                          <span>Đang phát giọng...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-amber-950" />
                          <span>🔊 Nghe thử giọng này</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {vietnameseFemaleVoices.length === 0 && (
                  <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <span className="text-lg shrink-0">💡</span>
                    <div>
                      <span className="font-bold">Mẹo cho giáo viên: </span>
                      Trình duyệt hiện tại chưa tải gói giọng tiếng Việt ngoại tuyến. TinyLearn sẽ tự động chuyển sang <strong>Giọng Nữ Người Việt Nam Bản Xứ</strong> (chuẩn phát âm Hà Nội 100%) để đảm bảo bé nghe rõ từng thanh dấu mà không bị lơ lớ!
                    </div>
                  </div>
                )}
              </div>

              {/* SPEECH RATE & PITCH SLIDERS */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">3. Điều chỉnh tốc độ & cao độ:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const reset = { ...settings, speechRate: 0.88, speechPitch: 1.0 };
                      onUpdateSettings(reset);
                    }}
                    className="text-xs text-slate-500 hover:text-amber-800 font-bold underline"
                  >
                    Đặt lại mặc định chuẩn
                  </button>
                </div>

                {/* Rate */}
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div>
                    <div className="font-bold text-xs text-slate-800">Tốc độ đọc cho bé</div>
                    <div className="text-[11px] text-slate-500">0.85x – 0.90x là tốc độ lý tưởng cho trẻ 12–24 tháng</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0.75}
                      max={1.05}
                      step={0.03}
                      value={settings.speechRate}
                      onChange={(e) =>
                        onUpdateSettings({ ...settings, speechRate: parseFloat(e.target.value) })
                      }
                      className="w-28 accent-amber-500"
                    />
                    <span className="text-xs font-black text-amber-900 w-12 text-right">
                      {settings.speechRate.toFixed(2)}x
                    </span>
                  </div>
                </div>

                {/* Pitch */}
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div>
                    <div className="font-bold text-xs text-slate-800">Cao độ âm điệu (Pitch)</div>
                    <div className="text-[11px] text-slate-500">1.0x là giọng người thật chuẩn, 1.05x giọng ngọt ngào</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0.85}
                      max={1.15}
                      step={0.03}
                      value={settings.speechPitch}
                      onChange={(e) =>
                        onUpdateSettings({ ...settings, speechPitch: parseFloat(e.target.value) })
                      }
                      className="w-28 accent-amber-500"
                    />
                    <span className="text-xs font-black text-amber-900 w-12 text-right">
                      {settings.speechPitch.toFixed(2)}x
                    </span>
                  </div>
                </div>
              </div>

              {/* SSML PROSODY & NATURAL PAUSES SECTION */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 p-4 rounded-2xl border-2 border-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🎙️</span>
                    <div>
                      <div className="font-black text-sm text-amber-950 flex items-center gap-2">
                        <span>Hỗ trợ SSML (Speech Synthesis Markup Language)</span>
                        <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full uppercase">
                          Chuẩn Mầm Non
                        </span>
                      </div>
                      <p className="text-xs text-amber-900/80">
                        Tự động chèn thẻ ngắt nghỉ (&lt;break&gt;), điều chỉnh cao độ (&lt;prosody&gt;) và nhấn âm (&lt;emphasis&gt;) giúp câu đọc ấm áp, tự nhiên, không bị dồn dập.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableSSML ?? true}
                      onChange={(e) => {
                        const updated = { ...settings, enableSSML: e.target.checked };
                        onUpdateSettings(updated);
                        audioEngine.setSSMLConfig(e.target.checked, settings.ssmlBreakDurationMs);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Break duration selection */}
                {(settings.enableSSML ?? true) && (
                  <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-amber-950">
                      Thời gian ngắt nghỉ giữa câu hỏi và chỉ dẫn (&lt;break time=&quot;...&quot;/&gt;):
                    </span>
                    <div className="flex items-center gap-2">
                      {[300, 450, 600].map((ms) => (
                        <button
                          key={ms}
                          type="button"
                          onClick={() => {
                            const updated = { ...settings, ssmlBreakDurationMs: ms };
                            onUpdateSettings(updated);
                            audioEngine.setSSMLConfig(settings.enableSSML ?? true, ms);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            (settings.ssmlBreakDurationMs ?? 450) === ms
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {ms}ms {ms === 450 ? '(Khuyên dùng)' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comparison Test Buttons */}
                <div className="bg-white/80 p-3 rounded-xl border border-amber-200 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-700">Thử nghiệm so sánh:</span>
                  <button
                    type="button"
                    onClick={() =>
                      audioEngine.speakVietnamese('Con gì kêu meo meo? Tìm bạn Mèo nào!')
                    }
                    className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 rounded-lg font-bold flex items-center gap-1 active:scale-95"
                  >
                    <span>▶️</span>
                    <span>Nghe chuẩn SSML mầm non</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      audioEngine.speakBrowserVietnamese('Con gì kêu meo meo tìm bạn mèo nào')
                    }
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg active:scale-95"
                  >
                    <span>▶️</span>
                    <span>Nghe thường (không ngắt nghỉ)</span>
                  </button>
                </div>
              </div>

              {/* QUICK LISTEN TESTS */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2">
                <span className="font-black text-xs uppercase text-amber-900">
                  4. Nghe thử các câu mẫu tiếng Việt ngay tại đây:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      audioEngine.speakVietnamese('Con gì kêu meo meo? Tìm bạn Mèo nào!', {
                        rate: settings.speechRate,
                        pitch: settings.speechPitch,
                      })
                    }
                    className="px-3 py-2 bg-white hover:bg-amber-100 text-amber-950 font-bold text-xs rounded-xl border border-amber-300 shadow-2xs active:scale-95 flex items-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>&ldquo;Con gì kêu meo meo? Tìm bạn Mèo nào!&rdquo;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      audioEngine.playPraise(undefined, () => {})
                    }
                    className="px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 shadow-2xs active:scale-95 flex items-center gap-1.5"
                  >
                    <span>🔔</span>
                    <span>&ldquo;Giỏi quá! Bé giỏi quá!&rdquo;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      audioEngine.playEncouragement(() => {})
                    }
                    className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-900 font-bold text-xs rounded-xl border border-rose-300 shadow-2xs active:scale-95 flex items-center gap-1.5"
                  >
                    <span>💛</span>
                    <span>&ldquo;Con thử lại nhé!&rdquo;</span>
                  </button>
                </div>
              </div>

              {/* TOPIC PRACTICE MODE & REPETITION SETTINGS */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50/70 p-4 rounded-2xl border-2 border-amber-300 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <div className="font-black text-sm text-amber-950 flex items-center gap-2">
                        <span>Chế độ Luyện tập theo chủ đề</span>
                        <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full uppercase">
                          Phương pháp Lặp lại
                        </span>
                      </div>
                      <p className="text-xs text-amber-900/80">
                        Tự động nhắc lại câu hỏi và âm thanh mẫu để trẻ 12–24 tháng khắc sâu phản xạ thính giác trước khi chạm hình.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.topicPracticeMode ?? true}
                      onChange={(e) => {
                        const updated = { ...settings, topicPracticeMode: e.target.checked };
                        onUpdateSettings(updated);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Sub-settings when enabled */}
                {(settings.topicPracticeMode ?? true) && (
                  <div className="space-y-3 pt-3 border-t border-amber-200">
                    {/* Repetition Count */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs text-amber-950">Số lần tự động lặp lại câu hỏi:</div>
                        <div className="text-[11px] text-amber-800/80">Dừng lại ngay khi bé chạm vào hình</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {[
                          { count: 1, label: '1 lần (Không lặp)' },
                          { count: 2, label: '2 lần (Chuẩn 12–18m)' },
                          { count: 3, label: '3 lần (Luyện tập sâu)' },
                        ].map((opt) => (
                          <button
                            key={opt.count}
                            type="button"
                            onClick={() => {
                              onUpdateSettings({ ...settings, audioPromptRepetitions: opt.count });
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              (settings.audioPromptRepetitions || 2) === opt.count
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Interval Between Repetitions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-amber-200/60">
                      <div>
                        <div className="font-bold text-xs text-amber-950">Khoảng nghỉ chờ giữa các lần nhắc:</div>
                        <div className="text-[11px] text-amber-800/80">Cho bé thời gian quan sát hình ảnh và suy nghĩ</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {[2, 3, 4].map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => {
                              onUpdateSettings({ ...settings, repetitionIntervalSeconds: sec });
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              (settings.repetitionIntervalSeconds || 3) === sec
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            {sec} giây {sec === 3 ? '(Khuyên dùng)' : ''}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Visual Hint After Repeat Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-amber-200/60">
                      <div>
                        <div className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                          <span>Gợi ý viền sáng / nhấp nháy đáp án đúng:</span>
                          <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.5 rounded-md">
                            Mới ✨
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-800/80">
                          Tự động chiếu sáng viền và nhấp nháy (pulse) hình ảnh đúng sau khi âm thanh câu hỏi được phát lại lần 2 nếu trẻ chưa chọn được.
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                        <input
                          type="checkbox"
                          checked={settings.enableVisualHintAfterRepeat ?? true}
                          onChange={(e) => {
                            const updated = { ...settings, enableVisualHintAfterRepeat: e.target.checked };
                            onUpdateSettings(updated);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* AUTO ADVANCE TIME */}
              <div className="flex items-center justify-between py-3 border-t border-slate-100">
                <div>
                  <div className="font-bold text-slate-800 text-sm">Tự động chuyển câu sau khi bé chọn đúng</div>
                  <p className="text-xs text-slate-500">Giúp bé nhỏ không cần tự bấm nút &ldquo;Câu tiếp theo&rdquo;.</p>
                </div>
                <select
                  value={settings.autoAdvanceSeconds}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, autoAdvanceSeconds: Number(e.target.value) })
                  }
                  className="px-3 py-2 rounded-xl border border-slate-200 font-bold text-sm bg-white"
                >
                  <option value={0}>Không tự chuyển (Bấm tay)</option>
                  <option value={1.5}>1.5 giây</option>
                  <option value={2}>2.0 giây (Khuyên dùng)</option>
                  <option value={3}>3.0 giây (Chậm rãi)</option>
                </select>
              </div>

              {/* HAPTIC FEEDBACK SETTINGS */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">📳</span>
                    <div>
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <span>Rung phản hồi xúc giác (Haptic Feedback)</span>
                        {hapticsEngine.hasHapticsSupport() ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            Thiết bị có hỗ trợ
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                            Tự động kích hoạt trên Điện thoại / iPad
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Rung 2 nhịp vui nhộn khi bé chọn đúng, rung nhẹ êm ái khi bé chọn nhầm để kích thích tương tác giác quan.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableHaptics ?? true}
                      onChange={(e) => {
                        const updated = { ...settings, enableHaptics: e.target.checked };
                        onUpdateSettings(updated);
                        if (e.target.checked) {
                          hapticsEngine.triggerTap(true);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Quick test buttons for teacher */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 text-xs">
                  <span className="font-bold text-slate-700">Rung thử nghiệm:</span>
                  <button
                    type="button"
                    onClick={() => hapticsEngine.triggerSuccess(true)}
                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span>🌟</span>
                    <span>Rung khi chọn đúng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => hapticsEngine.triggerWrong(true)}
                    className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span>💛</span>
                    <span>Rung khi chọn sai</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => hapticsEngine.triggerTap(true)}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span>👆</span>
                    <span>Rung chạm nhẹ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRESET SVG LIBRARY MODAL */}
      {presetPickerIndex !== null && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xl w-full shadow-2xl border-4 border-amber-300 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-black text-slate-900 text-lg">
                Chọn hình vẽ mầm non có sẵn ({PRESET_LIBRARY.length} mẫu)
              </h4>
              <button
                onClick={() => setPresetPickerIndex(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto p-1">
              {PRESET_LIBRARY.map((preset) => {
                const svgStr = ILLUSTRATIONS[preset.id];
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className="p-3 rounded-2xl border-2 border-slate-200 hover:border-amber-400 bg-amber-50/30 hover:bg-amber-100/50 flex flex-col items-center gap-1.5 transition-all active:scale-95 text-center cursor-pointer"
                  >
                    <div
                      className="w-14 h-14"
                      dangerouslySetInnerHTML={{ __html: svgStr }}
                    />
                    <span className="font-black text-xs text-slate-800">{preset.name}</span>
                    <span className="text-[10px] text-amber-700 font-bold">{preset.sound}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

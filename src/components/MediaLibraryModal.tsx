import React, { useState, useRef } from 'react';
import {
  X,
  Search,
  Upload,
  Mic,
  MicOff,
  Volume2,
  Play,
  Plus,
  Trash2,
  Check,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { MediaItem } from '../types.ts';
import { PRESET_LIBRARY, getSvgForNameOrKey } from '../data/illustrations.ts';
import { audioEngine } from '../utils/audio.ts';
import { VoiceRecorder } from '../utils/recorder.ts';

interface MediaLibraryModalProps {
  isOpen: boolean;
  mediaList: MediaItem[];
  onClose: () => void;
  onSaveMediaList: (list: MediaItem[]) => void;
  onSelectItem?: (item: MediaItem) => void;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  mediaList,
  onClose,
  onSaveMediaList,
  onSelectItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // New item form state
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState<MediaItem['category']>('animals');
  const [customSoundText, setCustomSoundText] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [customImage, setCustomImage] = useState<string>('');
  const [customAudio, setCustomAudio] = useState<string>('');

  // Recorder state
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<VoiceRecorder | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'animals', label: '🐾 Con vật' },
    { id: 'fruits', label: '🍎 Trái cây' },
    { id: 'vegetables', label: '🥕 Rau củ' },
    { id: 'colors', label: '🎨 Màu sắc' },
    { id: 'vehicles', label: '🚗 Phương tiện' },
    { id: 'family', label: '👨‍👩‍👧 Gia đình' },
    { id: 'objects', label: '🧸 Đồ dùng' },
    { id: 'body', label: '👀 Cơ thể bé' },
    { id: 'music', label: '🎵 Âm nhạc' },
    { id: 'nature', label: '🌻 Thiên nhiên' },
  ];

  // Base built-in presets mapped to MediaItems
  const allMediaItems: MediaItem[] = [
    ...PRESET_LIBRARY.map((p) => {
      let cat: MediaItem['category'] = 'animals';
      if (p.category === 'Trái cây') cat = 'fruits';
      else if (p.category === 'Phương tiện') cat = 'vehicles';
      else if (p.category === 'Rau củ') cat = 'vegetables';
      else if (p.category === 'Thiên nhiên') cat = 'nature';
      else if (p.category === 'Đồ dùng') cat = 'objects';

      return {
        id: `preset_${p.id}`,
        title: p.name,
        category: cat,
        imageUrl: getSvgForNameOrKey(p.id),
        soundText: p.sound,
        sampleQuestion: p.question,
      };
    }),
    ...mediaList,
  ];

  const filteredItems = allMediaItems.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.soundText.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleTestAudio = (text: string, audioUrl?: string) => {
    if (audioUrl) {
      const a = new Audio(audioUrl);
      a.play().catch(() => {});
    } else {
      audioEngine.speakVietnamese(text);
    }
  };

  const handleStartRecording = async () => {
    try {
      const rec = new VoiceRecorder();
      await rec.start();
      recorderRef.current = rec;
      setIsRecording(true);
    } catch {
      alert('Không thể mở micro. Vui lòng cấp quyền micro cho trình duyệt!');
    }
  };

  const handleStopRecording = async () => {
    if (recorderRef.current) {
      const dataUrl = await recorderRef.current.stop();
      setIsRecording(false);
      setCustomAudio(dataUrl);
      recorderRef.current = null;
    }
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const newItem: MediaItem = {
      id: `custom_media_${Date.now()}`,
      title: customTitle.trim(),
      category: customCategory,
      imageUrl: customImage || getSvgForNameOrKey(customTitle),
      soundText: customSoundText || customTitle,
      sampleQuestion: customQuestion || `Con gì đây? Tìm ${customTitle} nào!`,
      soundAudioUrl: customAudio,
      isCustom: true,
    };

    onSaveMediaList([newItem, ...mediaList]);
    setCustomTitle('');
    setCustomSoundText('');
    setCustomQuestion('');
    setCustomImage('');
    setCustomAudio('');
    setIsAddingCustom(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-4xl shadow-2xl border-4 border-purple-300 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-500 via-indigo-400 to-sky-300 border-b border-purple-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-purple-800 flex items-center justify-center font-black text-xl shadow-xs">
              📚
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Thư Viện Học Liệu Mầm Non
              </h2>
              <p className="text-xs font-bold text-purple-950/80">
                10 Chủ đề giáo dục • Minh họa sắc nét • Thu âm trực tiếp
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

        {/* SEARCH & CATEGORY FILTER */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm con vật, trái cây, màu sắc, âm thanh..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-2xl focus:outline-hidden focus:border-purple-500"
              />
            </div>

            <button
              onClick={() => setIsAddingCustom(!isAddingCustom)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingCustom ? 'Đóng form thêm' : 'Thêm học liệu mới'}</span>
            </button>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* ADD CUSTOM MEDIA FORM */}
          {isAddingCustom && (
            <form onSubmit={handleSaveCustomItem} className="p-5 bg-purple-50/80 rounded-3xl border-2 border-purple-200 space-y-4 animate-in fade-in duration-200">
              <h4 className="font-black text-sm text-purple-950">
                Thêm đối tượng học liệu mới vào kho trường:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tên đối tượng:</label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Ví dụ: Bạn Thỏ, Quả Dâu..."
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-purple-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Chủ đề:</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-purple-200 rounded-xl"
                  >
                    <option value="animals">🐾 Con vật</option>
                    <option value="fruits">🍎 Trái cây</option>
                    <option value="vegetables">🥕 Rau củ</option>
                    <option value="colors">🎨 Màu sắc</option>
                    <option value="vehicles">🚗 Phương tiện</option>
                    <option value="family">👨‍👩‍👧 Gia đình</option>
                    <option value="objects">🧸 Đồ dùng</option>
                    <option value="body">👀 Cơ thể bé</option>
                    <option value="music">🎵 Âm nhạc</option>
                    <option value="nature">🌻 Thiên nhiên</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Âm thanh / Tiếng kêu:</label>
                  <input
                    type="text"
                    value={customSoundText}
                    onChange={(e) => setCustomSoundText(e.target.value)}
                    placeholder="Ví dụ: Nhảy nhót, Meo meo..."
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-purple-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Upload image & Record audio row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Image upload */}
                <div className="p-3 bg-white rounded-2xl border border-purple-200 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {customImage ? (
                      <img src={customImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-purple-900 cursor-pointer hover:underline block">
                      Tải ảnh riêng từ máy (hoặc dùng icon chuẩn)
                      <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
                    </label>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WebP hoặc SVG</span>
                  </div>
                </div>

                {/* Direct Teacher Voice Recording */}
                <div className="p-3 bg-white rounded-2xl border border-purple-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Thu âm giọng cô trực tiếp:</div>
                      <div className="text-[10px] text-slate-400">
                        {customAudio ? '✓ Đã ghi âm xong' : isRecording ? 'Đang thu âm...' : 'Chưa có bản ghi âm'}
                      </div>
                    </div>
                  </div>

                  {isRecording ? (
                    <button
                      type="button"
                      onClick={handleStopRecording}
                      className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-xl animate-pulse"
                    >
                      Dừng thu
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl"
                    >
                      Bấm thu âm
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-xs"
                >
                  Lưu vào thư viện
                </button>
              </div>
            </form>
          )}

          {/* MEDIA GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-white rounded-3xl border-2 border-slate-100 hover:border-purple-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="w-full aspect-square rounded-2xl bg-amber-50/50 p-3 flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 truncate">{item.title}</h4>
                    <span className="text-[11px] font-bold text-purple-700 block truncate">
                      {item.soundText}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTestAudio(item.sampleQuestion, item.soundAudioUrl)}
                    className="flex-1 py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-950 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Nghe âm</span>
                  </button>

                  {onSelectItem && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectItem(item);
                        onClose();
                      }}
                      className="py-1.5 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] rounded-xl shadow-2xs cursor-pointer"
                    >
                      Chọn
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

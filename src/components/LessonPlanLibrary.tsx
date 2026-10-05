import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Play,
  Filter,
  Search,
  Clock,
  Sparkles,
  ArrowLeft,
  X,
  Printer,
  Download,
  Copy,
  Check,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  Volume2,
  HelpCircle,
  Eye,
  CheckCircle2,
  Save,
  Layers,
  Heart,
  Calendar,
} from 'lucide-react';
import { DetailedLessonPlan, LessonActivityCategory, LessonTopic } from '../data/lessonPlansTypes.ts';
import { DEVELOPMENTAL_DOMAINS, DevelopmentalDomainId, AgeGroup } from '../data/activityTypes.ts';
import { LESSON_PLANS_12_18 } from '../data/lessonPlans-12-18.ts';
import { LESSON_PLANS_18_24 } from '../data/lessonPlans-18-24.ts';
import { LessonPlanViewer } from './LessonPlanViewer.tsx';
import { audioEngine } from '../utils/audio.ts';
import { getSvgForNameOrKey } from '../data/illustrations.ts';

interface LessonPlanLibraryProps {
  onBack?: () => void;
  onLaunchGame?: (gameId?: string) => void;
}

export const LessonPlanLibrary: React.FC<LessonPlanLibraryProps> = ({
  onBack,
  onLaunchGame,
}) => {
  // Combine all 60 built-in preschool lesson plans
  const allLessonPlans = [...LESSON_PLANS_12_18, ...LESSON_PLANS_18_24];

  // Filtering states
  const [selectedAge, setSelectedAge] = useState<AgeGroup | 'all'>('all');
  const [selectedDomain, setSelectedDomain] = useState<DevelopmentalDomainId | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected plan to view in 2-column mode
  const [activePlanForView, setActivePlanForView] = useState<DetailedLessonPlan | null>(null);

  // Teaching presentation mode (Slide mode)
  const [presentingPlan, setPresentingPlan] = useState<DetailedLessonPlan | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showTeacherNotes, setShowTeacherNotes] = useState(true);

  // Post-session observation form state
  const [observationData, setObservationData] = useState({
    engagementLevel: 'high' as 'high' | 'supported' | 'low',
    abilityLevel: 'independent' as 'independent' | 'supported' | 'needs_practice',
    behaviors: {
      listening: true,
      watching: true,
      pointing: false,
      soundImitation: false,
      speaking: false,
      realObjectEngagement: true,
    },
    teacherNotes: '',
  });
  const [observationSaved, setObservationSaved] = useState(false);

  // Categories list
  const categories: LessonActivityCategory[] = [
    'Nhận biết – tập nói',
    'Hoạt động với đồ vật',
    'Vận động',
    'Âm nhạc',
    'Nghe kể chuyện – xem tranh',
    'Kỹ năng tự phục vụ',
    'Nhận biết môi trường xung quanh',
    'Hoạt động giác quan',
    'Trò chơi tương tác cô và trẻ',
  ];

  // Filter plans
  const filteredPlans = allLessonPlans.filter((plan) => {
    if (selectedAge !== 'all' && plan.ageGroup !== selectedAge) return false;
    if (selectedDomain !== 'all' && plan.mainDomain !== selectedDomain && plan.combinedDomain !== selectedDomain)
      return false;
    if (selectedCategory !== 'all' && plan.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = plan.title.toLowerCase().includes(q);
      const matchTopic = plan.topic.toLowerCase().includes(q);
      const matchCode = plan.code.toLowerCase().includes(q);
      if (!matchTitle && !matchTopic && !matchCode) return false;
    }
    return true;
  });

  // Start Teaching Slideshow Presentation
  const handleStartTeachingSession = (plan: DetailedLessonPlan) => {
    audioEngine.playPop();
    setPresentingPlan(plan);
    setCurrentSlideIndex(0);
    setShowTeacherNotes(true);
    setObservationSaved(false);
  };

  // Build slides from lesson plan steps
  const teachingSlides = presentingPlan ? presentingPlan.steps : [];
  const currentStep = teachingSlides[currentSlideIndex];

  // Read aloud slide prompt
  const handleSpeakSlide = (text: string) => {
    audioEngine.speakVietnamese(text);
  };

  // Save observation
  const handleSaveObservation = () => {
    if (!presentingPlan) return;
    const historyKey = 'tinylearn_pedagogy_observations';
    const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const record = {
      id: `obs_${Date.now()}`,
      lessonCode: presentingPlan.code,
      lessonTitle: presentingPlan.title,
      ageGroup: presentingPlan.ageGroup,
      date: new Date().toISOString(),
      ...observationData,
    };
    localStorage.setItem(historyKey, JSON.stringify([record, ...existing]));
    setObservationSaved(true);
    audioEngine.playSuccessChime();
    setTimeout(() => {
      setObservationSaved(false);
      setPresentingPlan(null);
    }, 2000);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-amber-50/60 flex flex-col p-3 sm:p-6 select-none font-sans">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & NAVIGATION                                      */}
      {/* ============================================================== */}
      <header className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b-2 border-amber-200">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-white hover:bg-amber-50 text-slate-700 border-2 border-amber-200 shadow-xs active:scale-95 transition-all cursor-pointer"
              title="Quay lại"
            >
              <ArrowLeft className="w-5 h-5 text-amber-900" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-500 text-white font-black text-base flex items-center justify-center shadow-xs">
                📘
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight">
                Kho Giáo Án Nhà Trẻ & Giáo Án Điện Tử
              </h1>
            </div>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              Chương trình GDMN Nhà trẻ (12–24 tháng) • Cấu trúc 2 cột chuẩn • Trình chiếu tiết dạy lấy trẻ làm trung tâm
            </p>
          </div>
        </div>

        {/* Stats summary */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs">
            Tổng cộng: {allLessonPlans.length} giáo án chuẩn
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs">
            Đang lọc: {filteredPlans.length} bài
          </span>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. FILTER CONTROLS (AGE, DOMAIN, CATEGORY, SEARCH)            */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto w-full space-y-4 mb-6">
        {/* TẦNG 1: NHÓM TUỔI */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-2xl border-2 border-slate-200 shadow-xs">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider pl-2 pr-1">
            Độ tuổi:
          </span>
          <button
            type="button"
            onClick={() => setSelectedAge('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedAge === 'all'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            Tất cả lứa tuổi ({allLessonPlans.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedAge('12-18')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedAge === '12-18'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span>👶</span>
            <span>Nhóm 12–18 tháng ({LESSON_PLANS_12_18.length} bài)</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedAge('18-24')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedAge === '18-24'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span>🧒</span>
            <span>Nhóm 18–24 tháng ({LESSON_PLANS_18_24.length} bài)</span>
          </button>
        </div>

        {/* TẦNG 2: 4 LĨNH VỰC PHÁT TRIỂN GDMN */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => setSelectedDomain('all')}
            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2 ${
              selectedDomain === 'all'
                ? 'bg-amber-100/90 border-amber-500 shadow-xs'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <span className="text-xl">🌈</span>
            <div>
              <div className="text-xs font-black text-slate-900">Tất cả lĩnh vực</div>
              <div className="text-[10px] text-slate-500 font-semibold">Toàn diện 4 lĩnh vực</div>
            </div>
          </button>

          {DEVELOPMENTAL_DOMAINS.map((domain) => {
            const isSelected = selectedDomain === domain.id;
            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => setSelectedDomain(domain.id)}
                className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'border-current shadow-xs scale-102'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
                style={isSelected ? { backgroundColor: domain.bgColor, color: domain.color } : {}}
              >
                <span className="text-xl">{domain.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs font-black truncate">{domain.name}</div>
                  <div className="text-[10px] opacity-80 truncate">{domain.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* TẦNG 3: LOẠI HOẠT ĐỘNG & TÌM KIẾM TỪ KHÓA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border-2 border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1">
            <span className="text-xs font-black text-slate-500 shrink-0">Loại hoạt động:</span>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo con vật, quả, tên bài..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-800 border border-slate-200 focus:outline-hidden focus:border-amber-400 focus:bg-white"
            />
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. LESSON PLANS GRID DISPLAY                                   */}
      {/* ============================================================== */}
      <main className="max-w-7xl mx-auto w-full flex-1">
        {filteredPlans.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border-2 border-slate-200 space-y-3">
            <div className="text-4xl">🔍</div>
            <h3 className="text-lg font-black text-slate-800">Không tìm thấy giáo án phù hợp</h3>
            <p className="text-xs text-slate-500">
              Hãy thử chọn "Tất cả lứa tuổi" hoặc xóa bộ lọc tìm kiếm để xem đầy đủ kho giáo án nhé.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map((plan) => {
              const domain =
                DEVELOPMENTAL_DOMAINS.find((d) => d.id === plan.mainDomain) || DEVELOPMENTAL_DOMAINS[0];

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-3xl border-2 border-amber-200/80 hover:border-amber-400 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                >
                  {/* Top Badges */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-black text-[11px] uppercase tracking-wider">
                        {plan.code}
                      </span>
                      <span
                        style={{ backgroundColor: domain.bgColor, color: domain.color }}
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold border border-current truncate max-w-[180px]"
                      >
                        {domain.name}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {plan.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                      <span>👶 {plan.ageGroup === '12-18' ? '12–18 tháng' : '18–24 tháng'}</span>
                      <span>•</span>
                      <span>📁 {plan.topic}</span>
                      <span>•</span>
                      <span>⏱ {plan.durationMinutes}p</span>
                    </div>
                  </div>

                  {/* Objective preview */}
                  <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/60 text-xs text-slate-700 space-y-1">
                    <div className="font-bold text-amber-950 flex items-center gap-1">
                      <span>🎯</span>
                      <span>Mục tiêu nổi bật:</span>
                    </div>
                    <p className="line-clamp-2 italic">
                      {plan.objectives.knowledge[0] || 'Làm quen đối tượng quen thuộc'}
                    </p>
                  </div>

                  {/* TinyLearn Integration Badge */}
                  {plan.tinyLearnIntegration && (
                    <div className="px-3 py-1.5 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center gap-2 text-[11px] font-bold text-indigo-900">
                      <Smartphone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">
                        Bước C: “{plan.tinyLearnIntegration.promptText}”
                      </span>
                    </div>
                  )}

                  {/* 2 Main Action Buttons: VIEW 2-COLUMN or START TEACHING */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActivePlanForView(plan)}
                      className="py-2.5 px-3 bg-white hover:bg-amber-50 text-amber-950 font-black text-xs rounded-xl border-2 border-amber-300 shadow-2xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                      <span>Xem giáo án 2 cột</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartTeachingSession(plan)}
                      className="py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>▶ Bắt đầu tiết dạy</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* 4. MODAL: DETAILED 2-COLUMN LESSON PLAN VIEWER                 */}
      {/* ============================================================== */}
      {activePlanForView && (
        <LessonPlanViewer
          isModal
          plan={activePlanForView}
          allPlans={allLessonPlans}
          onClose={() => setActivePlanForView(null)}
          onStartTinyLearn={(p) => {
            setActivePlanForView(null);
            handleStartTeachingSession(p);
          }}
        />
      )}

      {/* ============================================================== */}
      {/* 5. FULLSCREEN ELECTRONIC CLASSROOM SLIDESHOW MODE               */}
      {/* ============================================================== */}
      {presentingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden text-white font-sans animate-in fade-in duration-200">
          {/* Top Bar for Teacher */}
          <div className="px-4 sm:px-8 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-xs">
                {presentingPlan.code} • {presentingPlan.ageGroup === '12-18' ? '12–18m' : '18–24m'}
              </span>
              <h2 className="text-base sm:text-xl font-black text-white truncate max-w-md">
                {presentingPlan.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTeacherNotes(!showTeacherNotes)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  showTeacherNotes
                    ? 'bg-amber-400 text-amber-950 font-black'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                <span>👩‍🏫</span>
                <span>Gợi ý cho cô</span>
              </button>

              <button
                type="button"
                onClick={() => setPresentingPlan(null)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer shadow-xs"
                title="Thoát tiết dạy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Slide Workspace */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-5xl mx-auto w-full overflow-y-auto">
            {currentStep ? (
              <div className="w-full flex flex-col items-center text-center space-y-6">
                {/* Step Stage Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 text-amber-300 rounded-full border border-amber-400/40 text-xs sm:text-sm font-black uppercase tracking-wider">
                  <span>📌</span>
                  <span>{currentStep.phaseTitle}</span>
                </div>

                {/* Big Illustration or Icon */}
                <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-4xl bg-gradient-to-tr from-amber-400/20 to-yellow-300/10 border-4 border-amber-400/50 flex items-center justify-center p-4 shadow-2xl animate-in zoom-in-95">
                  <img
                    src={getSvgForNameOrKey(presentingPlan.title)}
                    alt={presentingPlan.title}
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                </div>

                {/* Large Toddler Instruction / Speech Bubble */}
                <div className="max-w-2xl bg-slate-900/90 border-3 border-amber-400/80 rounded-3xl p-5 sm:p-7 shadow-2xl relative">
                  <div className="text-xl sm:text-3xl font-black text-amber-200 leading-relaxed">
                    “{currentStep.teacherActivities[0] || presentingPlan.title}”
                  </div>

                  {/* Audio Speak Button */}
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleSpeakSlide(currentStep.teacherActivities[0] || presentingPlan.title)}
                      className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm rounded-full shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Volume2 className="w-5 h-5" />
                      <span>Phát âm thanh câu này</span>
                    </button>
                  </div>
                </div>

                {/* Teacher Pedagogical Guidance Callout */}
                {showTeacherNotes && (
                  <div className="max-w-2xl w-full bg-slate-900 border-2 border-emerald-400/50 rounded-2xl p-4 text-left space-y-2 text-xs sm:text-sm animate-in fade-in">
                    <div className="font-black text-emerald-300 flex items-center gap-1.5">
                      <span>👩‍🏫</span>
                      <span>Gợi ý sư phạm cho giáo viên:</span>
                    </div>
                    <ul className="space-y-1 text-slate-300">
                      {currentStep.teacherActivities.map((act, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold mt-0.5">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-1 text-amber-300 font-bold text-xs italic">
                      Dự kiến phản xạ của trẻ: {currentStep.childResponses.join('; ')}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* FINAL OBSERVATION STEP */
              <div className="w-full max-w-2xl bg-slate-900 rounded-3xl border-3 border-emerald-400 p-6 sm:p-8 space-y-5 animate-in zoom-in-95 text-left">
                <div className="text-center space-y-1 border-b border-slate-800 pb-4">
                  <div className="text-3xl">🎉</div>
                  <h3 className="text-xl sm:text-2xl font-black text-emerald-300">
                    Hoàn Thành Tiết Dạy!
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">
                    Ghi nhận quan sát sau hoạt động (Hỗ trợ sư phạm • Không chấm điểm số)
                  </p>
                </div>

                {/* Mức độ tham gia */}
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase text-amber-300">
                    1. Mức độ tham gia của trẻ:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'high', label: 'Hứng thú tham gia' },
                      { key: 'supported', label: 'Tham gia khi có hỗ trợ' },
                      { key: 'low', label: 'Chưa hứng thú' },
                    ].map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() =>
                          setObservationData({ ...observationData, engagementLevel: m.key as any })
                        }
                        className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          observationData.engagementLevel === m.key
                            ? 'bg-emerald-500 text-white border-emerald-400 font-black'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Khả năng thực hiện */}
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase text-amber-300">
                    2. Khả năng thực hiện:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'independent', label: 'Tự thực hiện được' },
                      { key: 'supported', label: 'Thực hiện có hỗ trợ' },
                      { key: 'needs_practice', label: 'Cần thêm cơ hội' },
                    ].map((a) => (
                      <button
                        key={a.key}
                        type="button"
                        onClick={() =>
                          setObservationData({ ...observationData, abilityLevel: a.key as any })
                        }
                        className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          observationData.abilityLevel === a.key
                            ? 'bg-emerald-500 text-white border-emerald-400 font-black'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Biểu hiện quan sát được */}
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase text-amber-300">
                    3. Biểu hiện quan sát được:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { key: 'listening', label: 'Trẻ chú ý nghe' },
                      { key: 'watching', label: 'Trẻ quan sát hình' },
                      { key: 'pointing', label: 'Trẻ chỉ/chọn đúng đối tượng' },
                      { key: 'soundImitation', label: 'Trẻ bắt chước âm thanh' },
                      { key: 'speaking', label: 'Trẻ phát âm theo khả năng' },
                      { key: 'realObjectEngagement', label: 'Trẻ tham gia hoạt động thật' },
                    ].map((b) => (
                      <label
                        key={b.key}
                        className="flex items-center gap-2 p-2 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer text-slate-200"
                      >
                        <input
                          type="checkbox"
                          checked={(observationData.behaviors as any)[b.key]}
                          onChange={(e) =>
                            setObservationData({
                              ...observationData,
                              behaviors: {
                                ...observationData.behaviors,
                                [b.key]: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 accent-emerald-500 rounded-sm"
                        />
                        <span>{b.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Ghi chú của cô */}
                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase text-amber-300">
                    4. Ghi chú của giáo viên:
                  </label>
                  <textarea
                    rows={2}
                    value={observationData.teacherNotes}
                    onChange={(e) =>
                      setObservationData({ ...observationData, teacherNotes: e.target.value })
                    }
                    placeholder="Ví dụ: Bé hào hứng khi sờ mô hình, còn rụt rè khi phát âm từ đơn..."
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-400"
                  />
                </div>

                {/* Save button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveObservation}
                    disabled={observationSaved}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-80 text-white font-black text-sm rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {observationSaved ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>✓ Đã lưu nhật ký hoạt động!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>💾 Lưu nhật ký sư phạm</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation for Slides */}
          <div className="px-4 sm:px-8 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Bước trước</span>
            </button>

            <span className="text-xs sm:text-sm font-black text-slate-400">
              Bước {Math.min(currentSlideIndex + 1, teachingSlides.length)} / {teachingSlides.length}
            </span>

            <button
              type="button"
              onClick={() => setCurrentSlideIndex(currentSlideIndex + 1)}
              disabled={currentSlideIndex >= teachingSlides.length}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-md"
            >
              <span>{currentSlideIndex >= teachingSlides.length - 1 ? 'Ghi nhận sau tiết' : 'Tiếp theo'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  AgeGroup,
  DevelopmentalDomainId,
  PreschoolActivity,
  DEVELOPMENTAL_DOMAINS,
} from '../../data/activityTypes.ts';
import { getActivitiesByDomain, getActivitiesByAge } from '../../data/activitiesManager.ts';
import { LESSON_PLANS_12_18 } from '../../data/lessonPlans-12-18.ts';
import { LESSON_PLANS_18_24 } from '../../data/lessonPlans-18-24.ts';
import { LessonPlanViewer } from '../LessonPlanViewer.tsx';
import { AgeSelector } from './AgeSelector.tsx';
import { DomainSelector } from './DomainSelector.tsx';
import { ActivityPreview } from './ActivityPreview.tsx';
import { ActivityHistory } from './ActivityHistory.tsx';
import {
  BookOpen,
  History,
  Settings,
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  Sparkles,
} from 'lucide-react';
import { audioEngine } from '../../utils/audio.ts';

interface TeacherPedagogyHubProps {
  onStartActivity: (activity: PreschoolActivity, soundEnabled: boolean) => void;
  onGoHome: () => void;
  onOpenAdvancedStudio: () => void;
}

export const TeacherPedagogyHub: React.FC<TeacherPedagogyHubProps> = ({
  onStartActivity,
  onGoHome,
  onOpenAdvancedStudio,
}) => {
  const [selectedAge, setSelectedAge] = useState<AgeGroup>('12-18');
  const [selectedDomain, setSelectedDomain] = useState<DevelopmentalDomainId | 'all'>('cognitive');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showLessonPlanViewer, setShowLessonPlanViewer] = useState<boolean>(false);

  // Available activities based on age and domain
  const activitiesForAge = getActivitiesByAge(selectedAge);
  const filteredActivities =
    selectedDomain === 'all'
      ? activitiesForAge
      : activitiesForAge.filter((a) => a.domain.includes(selectedDomain));

  const [activeActivityId, setActiveActivityId] = useState<string>(
    filteredActivities[0]?.id || activitiesForAge[0]?.id
  );

  // Active activity
  const activeActivity =
    filteredActivities.find((a) => a.id === activeActivityId) ||
    filteredActivities[0] ||
    activitiesForAge[0];

  // Matched detailed lesson plan
  const allLessonPlans = [...LESSON_PLANS_12_18, ...LESSON_PLANS_18_24];
  const matchedLessonPlan =
    allLessonPlans.find(
      (p) =>
        p.ageGroup === selectedAge &&
        (activeActivity?.title && p.title.toLowerCase().includes(activeActivity.title.toLowerCase().slice(0, 6)))
    ) ||
    allLessonPlans.find((p) => p.ageGroup === selectedAge) ||
    allLessonPlans[0];

  const handleAgeChange = (age: AgeGroup) => {
    setSelectedAge(age);
    const newActivities = getActivitiesByAge(age);
    const matched =
      selectedDomain === 'all'
        ? newActivities
        : newActivities.filter((a) => a.domain.includes(selectedDomain));
    if (matched.length > 0) {
      setActiveActivityId(matched[0].id);
    }
  };

  const handleDomainChange = (domain: DevelopmentalDomainId | 'all') => {
    setSelectedDomain(domain);
    const matched =
      domain === 'all'
        ? activitiesForAge
        : activitiesForAge.filter((a) => a.domain.includes(domain));
    if (matched.length > 0) {
      setActiveActivityId(matched[0].id);
    }
  };

  if (showHistory) {
    return <ActivityHistory onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 animate-fadeIn select-none">
      {/* 1. TOP TEACHER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-amber-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-amber-50 rounded-2xl border-2 border-amber-200 text-amber-950 font-black text-xs sm:text-sm shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-amber-600" />
            <span>Trang chủ</span>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-amber-950 flex items-center gap-2">
              <span>👩‍🏫</span>
              <span>Quản Lý Hoạt Động Giáo Dục Mầm Non</span>
            </h1>
            <p className="text-xs text-slate-500">
              Chương trình Nhà Trẻ (12–24 Tháng) • Lấy trẻ làm trung tâm • Học thông qua chơi
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all ${
              soundEnabled
                ? 'bg-amber-100 border-amber-300 text-amber-950'
                : 'bg-slate-100 border-slate-300 text-slate-500'
            }`}
            title="Bật/tắt âm thanh câu lệnh"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">Âm thanh</span>
          </button>

          {/* Nhật ký quan sát */}
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-black text-xs sm:text-sm rounded-xl border border-indigo-200 shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            title="Xem nhật ký quan sát sư phạm"
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>📋 Nhật ký</span>
          </button>

          {/* Giáo án bảng 2 cột */}
          <button
            type="button"
            onClick={() => setShowLessonPlanViewer(true)}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black text-xs sm:text-sm rounded-xl border border-emerald-300 shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            title="Xem giáo án chi tiết bảng 2 cột chuẩn Bộ GD&ĐT"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>📚 Giáo án (2 cột)</span>
          </button>

          {/* Studio giáo án AI & QR */}
          <button
            type="button"
            onClick={onOpenAdvancedStudio}
            className="px-3 py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs sm:text-sm rounded-xl border border-amber-500 shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            title="Mở bộ công cụ mở rộng: Giáo án AI, Thư viện học liệu, QR TV"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Studio</span>
          </button>
        </div>
      </div>

      {/* 2. AGE & DOMAIN SELECTORS */}
      <div className="space-y-4 mb-6">
        <AgeSelector selectedAge={selectedAge} onSelectAge={handleAgeChange} />
        <DomainSelector selectedDomain={selectedDomain} onSelectDomain={handleDomainChange} />
      </div>

      {/* 3. MAIN WORKSPACE: ACTIVITY LIST ON LEFT, FULL PEDAGOGICAL PREVIEW ON RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: ACTIVITY LIST */}
        <div className="lg:col-span-4 bg-white rounded-3xl border-2 border-slate-200 p-4 shadow-xs max-h-[580px] flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <span className="font-black text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Danh Sách Hoạt Động ({filteredActivities.length})</span>
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              {selectedAge === '12-18' ? '12–18m' : '18–24m'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredActivities.map((act) => {
              const isSelected = act.id === activeActivity?.id;
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setActiveActivityId(act.id)}
                  className={`w-full p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col ${
                    isSelected
                      ? 'bg-amber-100/90 border-amber-500 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <span className="font-black text-xs sm:text-sm text-slate-900 leading-snug">
                    {act.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span>{act.choices.length} hình</span>
                    <span>•</span>
                    <span className="italic truncate">"{act.teacherPrompt}"</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED PEDAGOGICAL PREVIEW & START BUTTON */}
        <div className="lg:col-span-8">
          {activeActivity ? (
            <ActivityPreview
              activity={activeActivity}
              onStart={() => onStartActivity(activeActivity, soundEnabled)}
              onViewLessonPlan={() => setShowLessonPlanViewer(true)}
            />
          ) : (
            <div className="p-8 bg-white rounded-3xl text-center text-slate-500">
              Vui lòng chọn một hoạt động.
            </div>
          )}
        </div>
      </div>

      {/* DETAILED LESSON PLAN VIEWER MODAL */}
      {showLessonPlanViewer && (
        <LessonPlanViewer
          isModal
          plan={matchedLessonPlan}
          allPlans={allLessonPlans}
          onClose={() => setShowLessonPlanViewer(false)}
          onStartTinyLearn={() => {
            setShowLessonPlanViewer(false);
            onStartActivity(activeActivity, soundEnabled);
          }}
        />
      )}
    </div>
  );
};

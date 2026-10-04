import React, { useState } from 'react';
import {
  Printer,
  Download,
  Copy,
  Check,
  Smartphone,
  Play,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  Package,
  Target,
  Users,
  Eye,
  ArrowRight,
  BookOpen,
  ChevronDown,
  Layers,
  Heart,
  X,
  ExternalLink,
} from 'lucide-react';
import { DetailedLessonPlan, LessonTwoColumnStep } from '../data/lessonPlansTypes.ts';
import { DEVELOPMENTAL_DOMAINS } from '../data/activityTypes.ts';
import { LESSON_PLANS_12_18 } from '../data/lessonPlans-12-18.ts';
import { LESSON_PLANS_18_24 } from '../data/lessonPlans-18-24.ts';
import { audioEngine } from '../utils/audio.ts';

export interface LessonPlanViewerProps {
  plan?: DetailedLessonPlan;
  allPlans?: DetailedLessonPlan[];
  onSelectPlan?: (plan: DetailedLessonPlan) => void;
  onStartTinyLearn?: (plan: DetailedLessonPlan) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const LessonPlanViewer: React.FC<LessonPlanViewerProps> = ({
  plan: initialPlan,
  allPlans,
  onSelectPlan,
  onStartTinyLearn,
  onClose,
  isModal = false,
}) => {
  // Combine all default plans if not provided
  const combinedPlans = allPlans || [...LESSON_PLANS_12_18, ...LESSON_PLANS_18_24];

  // Active plan state
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    initialPlan?.id || combinedPlans[0]?.id || 'GA01'
  );

  const [copied, setCopied] = useState<boolean>(false);
  const [filterAge, setFilterAge] = useState<'all' | '12-18' | '18-24'>('all');

  const currentPlan =
    (initialPlan && initialPlan.id === selectedPlanId ? initialPlan : null) ||
    combinedPlans.find((p) => p.id === selectedPlanId) ||
    combinedPlans[0];

  if (!currentPlan) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
        Không tìm thấy giáo án phù hợp.
      </div>
    );
  }

  const domain =
    DEVELOPMENTAL_DOMAINS.find((d) => d.id === currentPlan.mainDomain) ||
    DEVELOPMENTAL_DOMAINS[0];

  const combinedDomainInfo = currentPlan.combinedDomain
    ? DEVELOPMENTAL_DOMAINS.find((d) => d.id === currentPlan.combinedDomain)
    : null;

  // Handle plan selection
  const handleSelectPlan = (newPlan: DetailedLessonPlan) => {
    setSelectedPlanId(newPlan.id);
    if (onSelectPlan) {
      onSelectPlan(newPlan);
    }
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Copy text function
  const handleCopyText = () => {
    const text = `
GIÁO ÁN MẦM NON NHÀ TRẺ (CHƯƠNG TRÌNH GDMN VIỆT NAM)
TÊN HOẠT ĐỘNG: ${currentPlan.title.toUpperCase()}
Mã số: ${currentPlan.code}
Độ tuổi: ${currentPlan.ageGroup === '12-18' ? '12–18 tháng' : '18–24 tháng'}
Lĩnh vực chính: ${domain.name} ${combinedDomainInfo ? `(Kết hợp: ${combinedDomainInfo.name})` : ''}
Chủ đề: ${currentPlan.topic}
Loại hoạt động: ${currentPlan.category}
Thời gian: ${currentPlan.durationMinutes} phút

I. MỤC ĐÍCH – YÊU CẦU:
1. Kiến thức / Nhận biết:
${currentPlan.objectives.knowledge.map((k) => ` - ${k}`).join('\n')}
2. Kỹ năng:
${currentPlan.objectives.skills.map((s) => ` - ${s}`).join('\n')}
3. Thái độ:
${currentPlan.objectives.attitude.map((a) => ` - ${a}`).join('\n')}

II. CHUẨN BỊ:
- Đồ dùng của cô: ${currentPlan.preparation.teacher.join(', ')}
- Đồ dùng của trẻ: ${currentPlan.preparation.children.join(', ')}
- Đồ vật thật / Mô hình: ${currentPlan.preparation.realObjects.join(', ')}
- Ứng dụng TinyLearn: ${currentPlan.preparation.tinyLearnApp?.join(', ') || 'Bài học tương tác theo chủ đề'}

III. MÔI TRƯỜNG TỔ CHỨC:
${currentPlan.environment}

IV. TIẾN HÀNH HOẠT ĐỘNG (BẢNG 2 CỘT):
${currentPlan.steps
  .map(
    (step) => `
[${step.phaseTitle}]
* Hoạt động của cô:
${step.teacherActivities.map((act) => `  • ${act}`).join('\n')}
* Dự kiến hoạt động của trẻ:
${step.childResponses.map((res) => `  • ${res}`).join('\n')}
`
  )
  .join('\n')}

💻 ỨNG DỤNG TINYLEARN (KHI NÀO DÙNG MÀN HÌNH?):
- Thời điểm: Dùng ở bước tương tác (khoảng 2–3 phút) sau khi trẻ đã trải nghiệm đồ vật thật.
- Câu hỏi tương tác: ${currentPlan.tinyLearnIntegration?.promptText || 'Nghe âm thanh và tìm hình'}
- Hiển thị trên màn hình: ${currentPlan.tinyLearnIntegration?.screenDisplay || '2-3 hình ảnh lớn sắc nét, màu sắc tươi vui'}
- Lời cô hướng dẫn: ${currentPlan.tinyLearnIntegration?.guidance || 'Cô ngồi gần trẻ, khuyến khích trẻ tự chỉ hoặc chạm vào màn hình'}

V. TIÊU CHÍ QUAN SÁT CỦA GIÁO VIÊN:
${currentPlan.observationCriteria.map((c) => ` - [ ] ${c}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Export Word .doc file
  const handleDownloadDocx = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${currentPlan.title}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.4; color: #000; margin: 2cm; }
          h1 { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 4pt; }
          h2 { font-size: 13pt; font-weight: bold; margin-top: 14pt; margin-bottom: 4pt; color: #004d40; }
          .header-box { text-align: center; margin-bottom: 15pt; }
          .meta-info { font-style: italic; font-size: 11pt; text-align: center; margin-bottom: 12pt; }
          table { width: 100%; border-collapse: collapse; margin-top: 10pt; margin-bottom: 10pt; }
          th, td { border: 1px solid #333; padding: 7pt; vertical-align: top; }
          th { background-color: #f0fdf4; font-weight: bold; text-align: left; }
          .phase-header { background-color: #f8fafc; font-weight: bold; }
          .tinylearn-box { background-color: #f5f3ff; border: 1px dashed #7c3aed; padding: 10pt; margin: 10pt 0; }
          ul { margin-top: 3pt; margin-bottom: 3pt; padding-left: 20pt; }
          li { margin-bottom: 2pt; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <p style="margin: 0; font-size: 11pt; text-transform: uppercase;">PHÒNG GIÁO DỤC VÀ ĐÀO TẠO • TRƯỜNG MẦM NON</p>
          <p style="margin: 0; font-size: 10pt; font-weight: bold;">TỔ CHUYÊN MÔN NHÀ TRẺ (12–24 THÁNG)</p>
          <h1>GIÁO ÁN TỔ CHỨC HOẠT ĐỘNG GIÁO DỤC</h1>
          <div class="meta-info">
            Tên hoạt động: <strong>${currentPlan.title}</strong><br>
            Độ tuổi: <strong>${currentPlan.ageGroup === '12-18' ? '12–18 tháng' : '18–24 tháng'}</strong> |
            Lĩnh vực: <strong>${domain.name}</strong> |
            Chủ đề: <strong>${currentPlan.topic}</strong> |
            Thời gian: <strong>${currentPlan.durationMinutes} phút</strong>
          </div>
        </div>

        <h2>I. MỤC ĐÍCH – YÊU CẦU</h2>
        <p><strong>1. Kiến thức:</strong></p>
        <ul>${currentPlan.objectives.knowledge.map((k) => `<li>${k}</li>`).join('')}</ul>
        <p><strong>2. Kỹ năng:</strong></p>
        <ul>${currentPlan.objectives.skills.map((s) => `<li>${s}</li>`).join('')}</ul>
        <p><strong>3. Thái độ:</strong></p>
        <ul>${currentPlan.objectives.attitude.map((a) => `<li>${a}</li>`).join('')}</ul>

        <h2>II. CHUẨN BỊ</h2>
        <ul>
          <li><strong>Đồ dùng của cô:</strong> ${currentPlan.preparation.teacher.join(', ')}</li>
          <li><strong>Đồ dùng của trẻ:</strong> ${currentPlan.preparation.children.join(', ')}</li>
          <li><strong>Đồ vật thật / Mô hình trải nghiệm:</strong> ${currentPlan.preparation.realObjects.join(', ')}</li>
          <li><strong>Ứng dụng TinyLearn:</strong> ${currentPlan.preparation.tinyLearnApp?.join(', ') || 'Thiết bị màn hình/tablet'}</li>
        </ul>

        <h2>III. MÔI TRƯỜNG TỔ CHỨC</h2>
        <p>${currentPlan.environment}</p>

        <div class="tinylearn-box">
          <strong>💻 ỨNG DỤNG TINYLEARN TRONG TIẾT HỌC (KHI NÀO DÙNG MÀN HÌNH?):</strong><br>
          <em>Thời điểm sử dụng:</em> Dùng ở bước củng cố tương tác (khoảng 2–3 phút), sau khi trẻ đã được làm quen với đồ vật thật.<br>
          <em>Nội dung trên màn hình:</em> ${currentPlan.tinyLearnIntegration?.screenDisplay || '2-3 hình ảnh lớn rõ ràng'}<br>
          <em>Lời cô hướng dẫn:</em> ${currentPlan.tinyLearnIntegration?.guidance || 'Cô ngồi cùng trẻ, hướng dẫn trẻ chạm chọn hình ảnh và nhắc lại tên gọi.'}
        </div>

        <h2>IV. TIẾN HÀNH HOẠT ĐỘNG</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 25%;">Giai đoạn</th>
              <th style="width: 40%;">Hoạt động của cô</th>
              <th style="width: 35%;">Dự kiến hoạt động của trẻ</th>
            </tr>
          </thead>
          <tbody>
            ${currentPlan.steps
              .map(
                (step) => `
              <tr class="phase-header">
                <td colspan="3" style="background-color: #f1f5f9; font-weight: bold; color: #1e293b;">
                  ${step.phaseTitle}
                </td>
              </tr>
              <tr>
                <td style="font-size: 11pt; color: #475569;">
                  ${step.phaseTitle.split('(')[0] || 'Hoạt động'}
                </td>
                <td>
                  <ul>
                    ${step.teacherActivities.map((act) => `<li>${act}</li>`).join('')}
                  </ul>
                </td>
                <td>
                  <ul>
                    ${step.childResponses.map((res) => `<li>${res}</li>`).join('')}
                  </ul>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <h2>V. TIÊU CHÍ QUAN SÁT CỦA GIÁO VIÊN</h2>
        <ul>
          ${currentPlan.observationCriteria.map((c) => `<li>[ ] ${c}</li>`).join('')}
        </ul>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Giao_An_${currentPlan.code}_${currentPlan.topic.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredPlanList = combinedPlans.filter((p) => {
    if (filterAge === 'all') return true;
    return p.ageGroup === filterAge;
  });

  return (
    <div
      className={`w-full bg-white select-none ${
        isModal
          ? 'fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4'
          : 'rounded-4xl border-3 border-amber-200 shadow-xl'
      }`}
    >
      <div
        className={`w-full flex flex-col bg-white overflow-hidden ${
          isModal
            ? 'max-w-6xl max-h-[94vh] rounded-4xl border-4 border-amber-300 shadow-2xl animate-in fade-in zoom-in-95 duration-200'
            : 'rounded-4xl'
        }`}
      >
        {/* ============================================================== */}
        {/* 1. TOP HEADER & CONTROLS (PRINT-HIDDEN FOR CLEAN A4 PRINTING) */}
        {/* ============================================================== */}
        <div className="print:hidden px-4 sm:px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 border-b-2 border-amber-300 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-amber-800 flex items-center justify-center font-black text-2xl shadow-sm border border-amber-200">
              📚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-900 text-white tracking-wide uppercase">
                  {currentPlan.code}
                </span>
                <span className="text-xs font-bold text-amber-900/80">
                  Chuẩn GDMN Nhà Trẻ 12–24 Tháng
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight leading-tight">
                {currentPlan.title}
              </h1>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3.5 py-2 bg-white hover:bg-amber-50 text-slate-700 text-xs sm:text-sm font-bold rounded-xl border border-slate-300 shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              title="Sao chép nội dung giáo án"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Đã chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Sao chép</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadDocx}
              className="px-3.5 py-2 bg-white hover:bg-amber-50 text-slate-700 text-xs sm:text-sm font-bold rounded-xl border border-slate-300 shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              title="Tải về file Microsoft Word"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Xuất Word (.doc)</span>
              <span className="sm:hidden">Word</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              title="In giáo án ra giấy hoặc PDF"
            >
              <Printer className="w-4 h-4" />
              <span>In giáo án</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center active:scale-95 transition-all shadow-xs cursor-pointer ml-1"
                title="Đóng giáo án"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. PLAN SELECTOR TOOLBAR (CHO PHÉP CHỌN BÀI DỄ DÀNG)           */}
        {/* ============================================================== */}
        {combinedPlans.length > 1 && (
          <div className="print:hidden px-4 sm:px-8 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>Kho giáo án:</span>
              </span>

              {/* Age filter buttons */}
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setFilterAge('all')}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                    filterAge === 'all'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Tất cả ({combinedPlans.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterAge('12-18')}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                    filterAge === '12-18'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  12–18m
                </button>
                <button
                  type="button"
                  onClick={() => setFilterAge('18-24')}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                    filterAge === '18-24'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  18–24m
                </button>
              </div>
            </div>

            {/* Quick selector dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="plan-select" className="text-slate-500 font-semibold hidden md:inline">
                Chuyển bài nhanh:
              </label>
              <select
                id="plan-select"
                value={currentPlan.id}
                onChange={(e) => {
                  const found = combinedPlans.find((p) => p.id === e.target.value);
                  if (found) handleSelectPlan(found);
                }}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer max-w-[280px] truncate"
              >
                {filteredPlanList.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.title} ({p.ageGroup === '12-18' ? '12–18m' : '18–24m'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. MAIN LESSON PLAN BODY (FULL VIEWPORT SCROLL & PRINTABLE)     */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 text-slate-800 print:p-0 print:space-y-4 font-sans">
          {/* HEADER SUMMARY SECTION */}
          <div className="bg-amber-50/70 p-4 sm:p-6 rounded-3xl border-2 border-amber-200/80 space-y-3 print:bg-white print:border-b-2 print:border-slate-800 print:rounded-none print:p-0">
            <div className="text-center space-y-1">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                Bộ Giáo Dục & Đào Tạo • Chương Trình Giáo Dục Mầm Non Nhà Trẻ
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
                {currentPlan.title}
              </h2>
            </div>

            {/* BADGES & META */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2 text-xs font-bold">
              <span
                style={{ backgroundColor: domain.bgColor, color: domain.color }}
                className="px-3 py-1 rounded-full border border-current flex items-center gap-1.5"
              >
                <span>{domain.icon}</span>
                <span>Lĩnh vực: {domain.name}</span>
              </span>

              {combinedDomainInfo && (
                <span
                  style={{ backgroundColor: combinedDomainInfo.bgColor, color: combinedDomainInfo.color }}
                  className="px-3 py-1 rounded-full border border-current flex items-center gap-1.5"
                >
                  <span>{combinedDomainInfo.icon}</span>
                  <span>Kết hợp: {combinedDomainInfo.name}</span>
                </span>
              )}

              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                👶 Nhóm tuổi: {currentPlan.ageGroup === '12-18' ? '12–18 tháng' : '18–24 tháng'}
              </span>

              <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300">
                📁 Chủ đề: {currentPlan.topic}
              </span>

              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Thời gian: {currentPlan.durationMinutes} phút</span>
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* ⭐ SECTION: ỨNG DỤNG TINYLEARN (KHI NÀO VÀ DÙNG MÀN HÌNH NHƯ THẾ NÀO?) */}
          {/* ============================================================== */}
          <div className="bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-amber-50/50 rounded-3xl border-3 border-indigo-200 p-5 sm:p-6 shadow-sm space-y-4 print:border-slate-400 print:bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-xs shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-indigo-950">
                      Ứng Dụng TinyLearn Trong Tiết Dạy
                    </h3>
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                      Trợ giảng công nghệ
                    </span>
                  </div>
                  <p className="text-xs text-indigo-900/80 font-medium">
                    Nguyên tắc: Chỉ là công cụ củng cố giác quan, KHÔNG thay thế đồ vật thật!
                  </p>
                </div>
              </div>

              {/* Quick Launch Button */}
              {onStartTinyLearn && (
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playPop();
                    onStartTinyLearn(currentPlan);
                  }}
                  className="print:hidden px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md border border-indigo-700 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>▶ Mở bài này trên TinyLearn</span>
                </button>
              )}
            </div>

            {/* 4 CORE SCREEN GUIDELINES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs sm:text-sm">
              {/* Box 1: Khi nào mở màn hình? */}
              <div className="bg-white/90 p-4 rounded-2xl border border-indigo-200/80 space-y-1.5 shadow-xs">
                <div className="font-black text-indigo-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>1. Khi nào dùng màn hình?</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-xs">
                  Chỉ mở màn hình ở <strong>Bước C (2–3 phút)</strong> sau khi trẻ đã được quan sát,
                  cầm nắm và trải nghiệm đồ vật thật ở Bước A và B.
                </p>
              </div>

              {/* Box 2: Thời lượng & Nội dung hiển thị */}
              <div className="bg-white/90 p-4 rounded-2xl border border-indigo-200/80 space-y-1.5 shadow-xs">
                <div className="font-black text-purple-900 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span>2. Nội dung trên màn hình</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {currentPlan.tinyLearnIntegration?.screenDisplay ||
                    (currentPlan.ageGroup === '12-18'
                      ? 'Hiển thị 2 hình ảnh lớn, đối chiếu rõ ràng (ví dụ: Mèo vs Chó).'
                      : 'Hiển thị 2–3 hình ảnh lớn kèm câu hỏi phát giọng nữ mầm non.')}
                </p>
              </div>

              {/* Box 3: Hướng dẫn cô tương tác cùng trẻ */}
              <div className="bg-white/90 p-4 rounded-2xl border border-indigo-200/80 space-y-1.5 shadow-xs">
                <div className="font-black text-emerald-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>3. Tương tác Cô & Trẻ</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {currentPlan.tinyLearnIntegration?.guidance ||
                    'Cô ngồi sát cạnh bé, khuyến khích bé dùng ngón tay chạm chọn và cùng bé nhắc lại tên gọi.'}
                </p>
              </div>
            </div>

            {/* Prompt sentence highlight */}
            {currentPlan.tinyLearnIntegration?.promptText && (
              <div className="bg-white p-3.5 rounded-2xl border border-purple-200 flex items-center gap-3">
                <span className="text-xs font-black text-purple-800 bg-purple-100 px-2.5 py-1 rounded-lg shrink-0">
                  Câu hỏi TinyLearn:
                </span>
                <span className="text-sm font-black text-slate-800 italic">
                  “{currentPlan.tinyLearnIntegration.promptText}”
                </span>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* I. MỤC ĐÍCH – YÊU CẦU                                           */}
          {/* ============================================================== */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                I
              </span>
              <h3 className="text-lg sm:text-xl font-black text-amber-950 uppercase tracking-tight">
                Mục Đích – Yêu Cầu
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs sm:text-sm">
              {/* 1. Kiến thức */}
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 space-y-2">
                <strong className="text-amber-950 font-black flex items-center gap-1.5 text-sm">
                  <span>💡</span>
                  <span>1. Kiến thức / Nhận biết:</span>
                </strong>
                <ul className="space-y-1.5 text-slate-700">
                  {currentPlan.objectives.knowledge.map((k, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold mt-0.5">•</span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2. Kỹ năng */}
              <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-200 space-y-2">
                <strong className="text-sky-950 font-black flex items-center gap-1.5 text-sm">
                  <span>🎯</span>
                  <span>2. Kỹ năng phát triển:</span>
                </strong>
                <ul className="space-y-1.5 text-slate-700">
                  {currentPlan.objectives.skills.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-sky-600 font-bold mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Thái độ */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-2">
                <strong className="text-emerald-950 font-black flex items-center gap-1.5 text-sm">
                  <span>❤️</span>
                  <span>3. Thái độ – Cảm xúc:</span>
                </strong>
                <ul className="space-y-1.5 text-slate-700">
                  {currentPlan.objectives.attitude.map((a, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold mt-0.5">•</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* II. CHUẨN BỊ                                                   */}
          {/* ============================================================== */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                II
              </span>
              <h3 className="text-lg sm:text-xl font-black text-amber-950 uppercase tracking-tight">
                Chuẩn Bị Đồ Dùng
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="text-base">👩‍🏫</span>
                  <span>Đồ dùng của cô:</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {currentPlan.preparation.teacher.join(', ')}
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="text-base">👶</span>
                  <span>Đồ dùng của trẻ:</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {currentPlan.preparation.children.join(', ')}
                </p>
              </div>

              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-300 shadow-xs space-y-1.5">
                <div className="font-black text-amber-900 flex items-center gap-1.5">
                  <span className="text-base">🧸</span>
                  <span>Đồ vật thật / Mô hình:</span>
                </div>
                <p className="text-amber-950 text-xs font-semibold leading-relaxed">
                  {currentPlan.preparation.realObjects.join(', ')}
                </p>
              </div>

              <div className="bg-indigo-50 p-3.5 rounded-2xl border border-indigo-200 shadow-xs space-y-1.5">
                <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <span className="text-base">📱</span>
                  <span>Thiết bị TinyLearn:</span>
                </div>
                <p className="text-indigo-950 text-xs leading-relaxed">
                  {currentPlan.preparation.tinyLearnApp?.join(', ') || 'Màn hình cảm ứng hoặc máy tính bảng'}
                </p>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* III. MÔI TRƯỜNG TỔ CHỨC                                        */}
          {/* ============================================================== */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm flex items-center gap-2.5">
            <span className="text-lg">🏡</span>
            <div>
              <strong className="text-slate-900 font-bold">Môi trường tổ chức: </strong>
              <span className="text-slate-700">{currentPlan.environment}</span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* IV. TIẾN HÀNH HOẠT ĐỘNG – BẢNG 2 CỘT CHUẨN GDMN               */}
          {/* ============================================================== */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  IV
                </span>
                <h3 className="text-lg sm:text-xl font-black text-amber-950 uppercase tracking-tight">
                  Tiến Hành Hoạt Động (Bảng 2 Cột Chuẩn Bộ GD&ĐT)
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Lấy trẻ làm trung tâm • Tương tác trực tiếp cùng cô
              </span>
            </div>

            {/* TWO-COLUMN PEDAGOGICAL TABLE */}
            <div className="overflow-hidden rounded-3xl border-2 border-slate-300 shadow-xs bg-white">
              <table className="w-full text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-amber-100 via-amber-200 to-yellow-100 text-amber-950 font-black">
                    <th className="p-3.5 sm:p-4 text-left border-r border-amber-300 w-1/2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">👩‍🏫</span>
                        <span className="text-sm sm:text-base">Hoạt động của cô</span>
                      </div>
                      <div className="text-[11px] font-semibold text-amber-900/80 mt-0.5">
                        (Lời nói dẫn dắt, cử chỉ, câu hỏi gợi mở, bao quát trẻ)
                      </div>
                    </th>
                    <th className="p-3.5 sm:p-4 text-left w-1/2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">👶</span>
                        <span className="text-sm sm:text-base">Dự kiến hoạt động của trẻ</span>
                      </div>
                      <div className="text-[11px] font-semibold text-amber-900/80 mt-0.5">
                        (Quan sát, bập bẹ, chạm/sờ đồ vật, tương tác theo khả năng)
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {currentPlan.steps.map((step: LessonTwoColumnStep, idx: number) => {
                    const isTinyLearnStep =
                      step.phaseTitle.toLowerCase().includes('tinylearn') ||
                      step.phaseTitle.toLowerCase().includes('màn hình');

                    return (
                      <React.Fragment key={idx}>
                        {/* PHASE HEADER ROW */}
                        <tr className="bg-slate-100/90 font-black">
                          <td
                            colSpan={2}
                            className="px-4 py-2 text-xs font-black text-slate-800 uppercase tracking-wide flex items-center justify-between"
                          >
                            <span className="flex items-center gap-2">
                              <span>📌</span>
                              <span>{step.phaseTitle}</span>
                            </span>

                            {isTinyLearnStep && (
                              <span className="print:hidden px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center gap-1 shadow-xs">
                                <Smartphone className="w-3 h-3" />
                                <span>Dùng màn hình tại đây (2–3p)</span>
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* 2-COLUMN ACTIVITY CONTENT */}
                        <tr
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isTinyLearnStep ? 'bg-indigo-50/30' : ''
                          }`}
                        >
                          {/* COLUMN 1: HOẠT ĐỘNG CỦA CÔ */}
                          <td className="p-3.5 sm:p-5 align-top border-r border-slate-200 text-slate-800 leading-relaxed space-y-2">
                            {isTinyLearnStep && (
                              <div className="text-[11px] font-black text-indigo-700 bg-indigo-100/80 px-2 py-1 rounded-md inline-block mb-1">
                                📱 Hướng dẫn dùng TinyLearn:
                              </div>
                            )}
                            <ul className="space-y-2">
                              {step.teacherActivities.map((act, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-amber-600 font-bold mt-1 text-xs">▸</span>
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </td>

                          {/* COLUMN 2: DỰ KIẾN HOẠT ĐỘNG CỦA TRẺ */}
                          <td className="p-3.5 sm:p-5 align-top text-slate-700 leading-relaxed space-y-2">
                            <ul className="space-y-2">
                              {step.childResponses.map((res, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-emerald-600 font-bold mt-1 text-xs">✔</span>
                                  <span>{res}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ============================================================== */}
          {/* V. TIÊU CHÍ QUAN SÁT CỦA GIÁO VIÊN                            */}
          {/* ============================================================== */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                V
              </span>
              <h3 className="text-lg sm:text-xl font-black text-amber-950 uppercase tracking-tight">
                Tiêu Chí Quan Sát Của Giáo Viên (Checklist Không Chấm Điểm)
              </h3>
            </div>

            <div className="bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-200 text-xs sm:text-sm space-y-2.5">
              <p className="text-xs text-emerald-950 font-bold italic">
                * Giáo viên quan sát mức độ hứng thú và phản ứng tự nhiên của từng trẻ để hỗ trợ kịp thời,
                tuyệt đối không so sánh hay phân loại giỏi/kém:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentPlan.observationCriteria.map((criterion, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 bg-white/90 p-2.5 rounded-xl border border-emerald-200 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-800 font-medium">{criterion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER NOTE FOR PRINT */}
          <div className="hidden print:block pt-6 border-t border-slate-300 text-center text-xs text-slate-500">
            Giáo án được tạo và in từ Phần mềm Hỗ trợ Giáo Dục Mầm Non TinyLearn • Lấy trẻ làm trung tâm
          </div>
        </div>
      </div>
    </div>
  );
};

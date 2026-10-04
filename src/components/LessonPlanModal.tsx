import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  Sparkles,
  FileText,
  Clock,
  BookOpen,
  Edit3,
  Save,
  Plus,
} from 'lucide-react';
import { LessonPlan, TopicGame } from '../types.ts';
import { LessonPlanViewer } from './LessonPlanViewer.tsx';

interface LessonPlanModalProps {
  isOpen: boolean;
  lessonPlans: LessonPlan[];
  games: TopicGame[];
  currentPlanId?: string;
  onClose: () => void;
  onSavePlan: (plan: LessonPlan) => void;
  onGeneratePlanForGame: (game: TopicGame) => void;
}

export const LessonPlanModal: React.FC<LessonPlanModalProps> = ({
  isOpen,
  lessonPlans,
  games,
  currentPlanId,
  onClose,
  onSavePlan,
  onGeneratePlanForGame,
}) => {
  const [viewMode, setViewMode] = useState<'standard_2_col' | 'custom_ai'>('standard_2_col');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    currentPlanId || (lessonPlans.length > 0 ? lessonPlans[0].id : '')
  );
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const activePlan = lessonPlans.find((p) => p.id === selectedPlanId) || lessonPlans[0];
  const [editTitle, setEditTitle] = useState(activePlan?.title || '');
  const [editEvaluation, setEditEvaluation] = useState(activePlan?.evaluation || '');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    if (!activePlan) return;
    const text = `
${activePlan.title.toUpperCase()}
Chủ đề: ${activePlan.topic}
Độ tuổi: ${activePlan.ageRange}
Thời gian: ${activePlan.durationMinutes} phút

I. MỤC ĐÍCH - YÊU CẦU:
1. Kiến thức:
${activePlan.objectives.knowledge.map((k) => ` - ${k}`).join('\n')}
2. Kỹ năng:
${activePlan.objectives.skills.map((s) => ` - ${s}`).join('\n')}
3. Thái độ:
${activePlan.objectives.attitude.map((a) => ` - ${a}`).join('\n')}

II. CHUẨN BỊ:
- Đồ dùng của cô: ${activePlan.preparations.teacher.join(', ')}
- Đồ dùng của trẻ: ${activePlan.preparations.children.join(', ')}
- Ứng dụng CNTT: ${activePlan.preparations.itApplication.join(', ')}

III. TIẾN HÀNH HOẠT ĐỘNG:
${activePlan.steps
  .map(
    (step) => `
${step.phase} (${step.duration}):
- Nội dung: ${step.activities}
- Cô hướng dẫn: ${step.teacherGuidance}
- Trẻ thực hiện: ${step.childrenResponse}
`
  )
  .join('\n')}

IV. ĐÁNH GIÁ & ĐIỀU CHỈNH:
${activePlan.evaluation}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadDocx = () => {
    if (!activePlan) return;
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${activePlan.title}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5; }
        h1 { font-size: 18pt; text-align: center; color: #1e3a8a; }
        h2 { font-size: 15pt; color: #1e40af; border-bottom: 1px solid #94a3b8; }
        .section { margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #334155; padding: 8px; text-align: left; }
        th { background-color: #f1f5f9; }
      </style>
      </head>
      <body>
        <h1>${activePlan.title}</h1>
        <p style="text-align: center; font-style: italic;">Chủ đề: ${activePlan.topic} | Độ tuổi: ${activePlan.ageRange} | Thời gian: ${activePlan.durationMinutes} phút</p>
        
        <h2>I. MỤC ĐÍCH - YÊU CẦU</h2>
        <p><strong>1. Kiến thức:</strong></p>
        <ul>${activePlan.objectives.knowledge.map((k) => `<li>${k}</li>`).join('')}</ul>
        <p><strong>2. Kỹ năng:</strong></p>
        <ul>${activePlan.objectives.skills.map((s) => `<li>${s}</li>`).join('')}</ul>
        <p><strong>3. Thái độ:</strong></p>
        <ul>${activePlan.objectives.attitude.map((a) => `<li>${a}</li>`).join('')}</ul>

        <h2>II. CHUẨN BỊ</h2>
        <ul>
          <li><strong>Đồ dùng của cô:</strong> ${activePlan.preparations.teacher.join(', ')}</li>
          <li><strong>Đồ dùng của trẻ:</strong> ${activePlan.preparations.children.join(', ')}</li>
          <li><strong>Ứng dụng CNTT:</strong> ${activePlan.preparations.itApplication.join(', ')}</li>
        </ul>

        <h2>III. TIẾN HÀNH HOẠT ĐỘNG</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 25%;">Hoạt động</th>
              <th style="width: 40%;">Hoạt động của cô</th>
              <th style="width: 35%;">Hoạt động của trẻ</th>
            </tr>
          </thead>
          <tbody>
            ${activePlan.steps
              .map(
                (step) => `
              <tr>
                <td><strong>${step.phase}</strong><br/><em>(${step.duration})</em></td>
                <td>${step.teacherGuidance}</td>
                <td>${step.childrenResponse}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <h2>IV. ĐÁNH GIÁ & ĐIỀU CHỈNH</h2>
        <p>${activePlan.evaluation}</p>
      </body>
      </html>
    `;

    const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Giao_An_${activePlan.topic.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-4xl shadow-2xl border-4 border-emerald-300 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 border-b border-emerald-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-emerald-800 flex items-center justify-center font-black text-xl shadow-xs">
              📝
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Giáo Án Mầm Non (Chuẩn Bộ GD&ĐT)
              </h2>
              <p className="text-xs font-bold text-emerald-950/80">
                Tự động sinh từ trò chơi TinyLearn • Hỗ trợ in ấn & xuất Word
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

        {/* TOOLBAR */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto max-w-md py-1">
            {lessonPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => {
                  setSelectedPlanId(plan.id);
                  setEditTitle(plan.title);
                  setEditEvaluation(plan.evaluation);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  (activePlan?.id || '') === plan.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {plan.topic}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Đã chép!' : 'Sao chép'}</span>
            </button>

            <button
              onClick={handleDownloadDocx}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Xuất Word (.doc)</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In giáo án</span>
            </button>
          </div>
        </div>

        {/* PLAN CONTENT (PRINTABLE) */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-6 flex-1 text-slate-800 font-serif leading-relaxed">
          {activePlan ? (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* HEADER INFORMATION */}
              <div className="text-center pb-6 border-b-2 border-slate-200 space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Phòng Giáo Dục & Đào Tạo • Trường Mầm Non
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-sans tracking-tight">
                  {activePlan.title}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-600 font-sans pt-1">
                  <span>Chủ đề: <strong>{activePlan.topic}</strong></span>
                  <span>•</span>
                  <span>Độ tuổi: <strong>{activePlan.ageRange}</strong></span>
                  <span>•</span>
                  <span>Thời gian: <strong>{activePlan.durationMinutes} phút</strong></span>
                </div>
              </div>

              {/* I. MỤC ĐÍCH - YÊU CẦU */}
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-black text-emerald-950 font-sans uppercase tracking-wide flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">I</span>
                  <span>Mục đích – Yêu cầu</span>
                </h3>
                <div className="space-y-2 text-sm pl-8">
                  <div>
                    <strong className="text-slate-900 font-sans">1. Kiến thức:</strong>
                    <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-700">
                      {activePlan.objectives.knowledge.map((k, idx) => (
                        <li key={idx}>{k}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-slate-900 font-sans">2. Kỹ năng:</strong>
                    <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-700">
                      {activePlan.objectives.skills.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-slate-900 font-sans">3. Thái độ:</strong>
                    <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-700">
                      {activePlan.objectives.attitude.map((a, idx) => (
                        <li key={idx}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* II. CHUẨN BỊ */}
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-black text-emerald-950 font-sans uppercase tracking-wide flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">II</span>
                  <span>Chuẩn bị</span>
                </h3>
                <div className="text-sm pl-8 space-y-1.5 text-slate-700">
                  <p>
                    <strong className="text-slate-900 font-sans">1. Đồ dùng của cô: </strong>
                    {activePlan.preparations.teacher.join(', ')}
                  </p>
                  <p>
                    <strong className="text-slate-900 font-sans">2. Đồ dùng của trẻ: </strong>
                    {activePlan.preparations.children.join(', ')}
                  </p>
                  <p>
                    <strong className="text-slate-900 font-sans">3. Ứng dụng CNTT: </strong>
                    {activePlan.preparations.itApplication.join(', ')}
                  </p>
                </div>
              </div>

              {/* III. TIẾN HÀNH HOẠT ĐỘNG */}
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-black text-emerald-950 font-sans uppercase tracking-wide flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">III</span>
                  <span>Tiến hành hoạt động</span>
                </h3>

                <div className="overflow-x-auto pl-4">
                  <table className="w-full text-xs sm:text-sm border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 font-sans font-black text-slate-800 text-left">
                        <th className="p-3 border border-slate-300 w-1/4">Giai đoạn hoạt động</th>
                        <th className="p-3 border border-slate-300 w-2/5">Hoạt động của giáo viên</th>
                        <th className="p-3 border border-slate-300 w-1/3">Hoạt động của trẻ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activePlan.steps.map((step, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="p-3 border border-slate-300 align-top font-sans">
                            <strong className="text-slate-900">{step.phase}</strong>
                            <div className="text-[11px] text-slate-500 mt-0.5">{step.duration}</div>
                          </td>
                          <td className="p-3 border border-slate-300 align-top text-slate-700 leading-relaxed">
                            {step.teacherGuidance}
                          </td>
                          <td className="p-3 border border-slate-300 align-top text-slate-700 leading-relaxed">
                            {step.childrenResponse}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* IV. ĐÁNH GIÁ & ĐIỀU CHỈNH */}
              <div className="space-y-2 pt-2">
                <h3 className="text-base sm:text-lg font-black text-emerald-950 font-sans uppercase tracking-wide flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">IV</span>
                  <span>Đánh giá & Điều chỉnh sau hoạt động</span>
                </h3>
                <div className="text-sm pl-8 text-slate-700 italic">
                  {activePlan.evaluation}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm text-slate-500 font-bold">
                Chưa có giáo án nào. Hãy chọn một trò chơi để AI sinh giáo án tự động trong 1 giây!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

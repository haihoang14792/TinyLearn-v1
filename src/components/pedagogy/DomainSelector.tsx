import React from 'react';
import { DevelopmentalDomainId, DEVELOPMENTAL_DOMAINS } from '../../data/activityTypes.ts';
import { Layers } from 'lucide-react';

interface DomainSelectorProps {
  selectedDomain: DevelopmentalDomainId | 'all';
  onSelectDomain: (domainId: DevelopmentalDomainId | 'all') => void;
}

export const DomainSelector: React.FC<DomainSelectorProps> = ({
  selectedDomain,
  onSelectDomain,
}) => {
  return (
    <div className="w-full select-none">
      <div className="flex items-center gap-2 mb-2.5">
        <Layers className="w-5 h-5 text-amber-600" />
        <span className="text-sm sm:text-base font-black text-slate-800">
          Chọn Lĩnh Vực Phát Triển:
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {DEVELOPMENTAL_DOMAINS.map((domain) => {
          const isSelected = selectedDomain === domain.id;
          return (
            <button
              key={domain.id}
              type="button"
              onClick={() => onSelectDomain(domain.id)}
              style={{
                backgroundColor: isSelected ? domain.bgColor : '#FFFFFF',
              }}
              className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
                isSelected
                  ? 'border-amber-500 shadow-md scale-[1.02] ring-2 ring-amber-300'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{domain.icon}</span>
                {isSelected && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                )}
              </div>
              <span className="font-black text-xs sm:text-sm text-slate-900 mt-2 block leading-snug">
                {domain.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

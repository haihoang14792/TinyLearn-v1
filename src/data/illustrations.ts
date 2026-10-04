/**
 * Built-in Preschool Vector SVG Illustrations
 * Clean, charming, high-contrast, toddler-appropriate designs.
 */

export interface IllustrationAsset {
  id: string;
  name: string;
  category: string;
  svgString: string;
}

export const ILLUSTRATIONS: Record<string, string> = {
  cat: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="115" rx="72" ry="62" fill="#FFA959" />
    <path d="M42 80 L30 25 L80 52 Z" fill="#FFA959" stroke="#E67E22" stroke-width="4" stroke-linejoin="round"/>
    <path d="M46 72 L38 36 L72 54 Z" fill="#FFC9B5" />
    <path d="M158 80 L170 25 L120 52 Z" fill="#FFA959" stroke="#E67E22" stroke-width="4" stroke-linejoin="round"/>
    <path d="M154 72 L162 36 L128 54 Z" fill="#FFC9B5" />
    <ellipse cx="64" cy="132" rx="14" ry="10" fill="#FF8A8A" opacity="0.45" />
    <ellipse cx="136" cy="132" rx="14" ry="10" fill="#FF8A8A" opacity="0.45" />
    <ellipse cx="68" cy="108" rx="10" ry="14" fill="#2D3748" />
    <circle cx="71" cy="103" r="4.5" fill="#FFFFFF" />
    <circle cx="65" cy="113" r="2" fill="#FFFFFF" />
    <ellipse cx="132" cy="108" rx="10" ry="14" fill="#2D3748" />
    <circle cx="135" cy="103" r="4.5" fill="#FFFFFF" />
    <circle cx="129" cy="113" r="2" fill="#FFFFFF" />
    <polygon points="100,120 92,112 108,112" fill="#FF6B8B" />
    <path d="M100 120 C95 130, 84 130, 84 125" stroke="#2D3748" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <path d="M100 120 C105 130, 116 130, 116 125" stroke="#2D3748" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <path d="M45 112 L15 110" stroke="#718096" stroke-width="3" stroke-linecap="round"/>
    <path d="M45 124 L18 128" stroke="#718096" stroke-width="3" stroke-linecap="round"/>
    <path d="M155 112 L185 110" stroke="#718096" stroke-width="3" stroke-linecap="round"/>
    <path d="M155 124 L182 128" stroke="#718096" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  dog: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="115" rx="70" ry="64" fill="#F4B266" />
    <path d="M45 75 C20 90, 15 140, 32 155 C42 162, 55 145, 52 110 Z" fill="#C97A32" />
    <path d="M155 75 C180 90, 185 140, 168 155 C158 162, 145 145, 148 110 Z" fill="#C97A32" />
    <ellipse cx="100" cy="130" rx="34" ry="26" fill="#FCEBD6" />
    <ellipse cx="58" cy="125" rx="13" ry="9" fill="#FF8A8A" opacity="0.4" />
    <ellipse cx="142" cy="125" rx="13" ry="9" fill="#FF8A8A" opacity="0.4" />
    <ellipse cx="72" cy="100" rx="9" ry="13" fill="#2D3748" />
    <circle cx="75" cy="95" r="4" fill="#FFFFFF" />
    <ellipse cx="128" cy="100" rx="9" ry="13" fill="#2D3748" />
    <circle cx="131" cy="95" r="4" fill="#FFFFFF" />
    <ellipse cx="100" cy="120" rx="13" ry="10" fill="#2D3748" />
    <circle cx="97" cy="117" r="3" fill="#FFFFFF" />
    <path d="M100 127 L100 134" stroke="#2D3748" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M92 134 C95 142, 105 142, 108 134" stroke="#2D3748" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <path d="M96 135 C96 148, 104 148, 104 135 Z" fill="#FF6B8B" />
  </svg>`,

  duck: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="125" rx="68" ry="55" fill="#FFD23F" />
    <circle cx="100" cy="85" r="48" fill="#FFD23F" />
    <ellipse cx="68" cy="98" rx="11" ry="8" fill="#FF8A8A" opacity="0.5" />
    <ellipse cx="132" cy="98" rx="11" ry="8" fill="#FF8A8A" opacity="0.5" />
    <circle cx="76" cy="78" r="9" fill="#2D3748" />
    <circle cx="79" cy="74" r="3.5" fill="#FFFFFF" />
    <circle cx="124" cy="78" r="9" fill="#2D3748" />
    <circle cx="127" cy="74" r="3.5" fill="#FFFFFF" />
    <ellipse cx="100" cy="100" rx="26" ry="15" fill="#FF7A00" />
    <circle cx="95" cy="96" r="2" fill="#E65100" />
    <circle cx="105" cy="96" r="2" fill="#E65100" />
    <path d="M50 125 C45 145, 75 160, 95 148" stroke="#E5B800" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M150 125 C155 145, 125 160, 105 148" stroke="#E5B800" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M96 38 C90 28, 105 20, 104 38 Z" fill="#FFD23F" />
  </svg>`,

  chicken: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="115" r="62" fill="#FFF8E7" stroke="#E2D4B7" stroke-width="3"/>
    <circle cx="85" cy="46" r="13" fill="#FF4757" />
    <circle cx="100" cy="40" r="15" fill="#FF4757" />
    <circle cx="115" cy="46" r="13" fill="#FF4757" />
    <polygon points="100,118 84,106 116,106" fill="#FFA502" />
    <ellipse cx="100" cy="125" rx="8" ry="12" fill="#FF4757" />
    <circle cx="74" cy="94" r="8" fill="#2F3542" />
    <circle cx="77" cy="91" r="3" fill="#FFFFFF" />
    <circle cx="126" cy="94" r="8" fill="#2F3542" />
    <circle cx="129" cy="91" r="3" fill="#FFFFFF" />
    <circle cx="62" cy="110" r="10" fill="#FFA07A" opacity="0.5"/>
    <circle cx="138" cy="110" r="10" fill="#FFA07A" opacity="0.5"/>
  </svg>`,

  cow: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="110" rx="66" ry="58" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="3"/>
    <path d="M50 68 C45 42, 65 42, 68 62" fill="#E2B176" stroke="#925E29" stroke-width="2"/>
    <path d="M150 68 C155 42, 135 42, 132 62" fill="#E2B176" stroke="#925E29" stroke-width="2"/>
    <path d="M40 90 C55 80, 70 95, 65 115 C50 120, 36 105, 40 90 Z" fill="#334155" />
    <path d="M135 70 C155 70, 160 95, 145 105 C130 100, 125 80, 135 70 Z" fill="#334155" />
    <ellipse cx="100" cy="138" rx="42" ry="26" fill="#FBCFE8" />
    <ellipse cx="88" cy="136" rx="6" ry="8" fill="#BE185D" />
    <ellipse cx="112" cy="136" rx="6" ry="8" fill="#BE185D" />
    <circle cx="75" cy="100" r="8" fill="#1E293B" />
    <circle cx="78" cy="97" r="3" fill="#FFFFFF" />
    <circle cx="125" cy="100" r="8" fill="#1E293B" />
    <circle cx="128" cy="97" r="3" fill="#FFFFFF" />
  </svg>`,

  sheep: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="90" r="30" fill="#F1F5F9" />
    <circle cx="140" cy="90" r="30" fill="#F1F5F9" />
    <circle cx="100" cy="65" r="32" fill="#F1F5F9" />
    <circle cx="65" cy="135" r="28" fill="#F1F5F9" />
    <circle cx="135" cy="135" r="28" fill="#F1F5F9" />
    <circle cx="100" cy="145" r="30" fill="#F1F5F9" />
    <ellipse cx="100" cy="115" rx="38" ry="42" fill="#FDE2D6" />
    <ellipse cx="56" cy="105" rx="14" ry="8" fill="#FDE2D6" stroke="#F4A261" stroke-width="2"/>
    <ellipse cx="144" cy="105" rx="14" ry="8" fill="#FDE2D6" stroke="#F4A261" stroke-width="2"/>
    <circle cx="78" cy="126" r="7" fill="#FF8A8A" opacity="0.5"/>
    <circle cx="122" cy="126" r="7" fill="#FF8A8A" opacity="0.5"/>
    <circle cx="84" cy="108" r="6" fill="#1E293B" />
    <circle cx="116" cy="108" r="6" fill="#1E293B" />
    <path d="M96 122 Q100 126 104 122" stroke="#E76F51" stroke-width="3" stroke-linecap="round" fill="none"/>
  </svg>`,

  apple: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 68 C80 40, 30 50, 32 105 C34 155, 75 175, 100 170 C125 175, 166 155, 168 105 C170 50, 120 40, 100 68 Z" fill="#EF4444" />
    <path d="M100 68 C102 45, 114 30, 124 25" stroke="#78350F" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M102 54 C120 40, 142 45, 138 65 C122 68, 108 60, 102 54 Z" fill="#22C55E" />
    <ellipse cx="68" cy="95" rx="12" ry="24" transform="rotate(-25 68 95)" fill="#F87171" opacity="0.75" />
    <circle cx="60" cy="80" r="5" fill="#FFFFFF" opacity="0.8" />
  </svg>`,

  banana: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 155 C70 170, 145 160, 170 65 C155 75, 125 110, 65 125 C50 128, 42 142, 40 155 Z" fill="#FBBF24" stroke="#F59E0B" stroke-width="3"/>
    <path d="M170 65 L178 55 C176 52, 172 50, 168 53 L162 62" fill="#15803D" stroke="#15803D" stroke-width="2"/>
    <ellipse cx="38" cy="157" rx="5" ry="4" fill="#78350F" />
    <path d="M72 136 C110 128, 140 102, 155 78" stroke="#FEF08A" stroke-width="5" stroke-linecap="round" fill="none"/>
  </svg>`,

  watermelon: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 75 C45 155, 155 155, 170 75 Z" fill="#16A34A" />
    <path d="M35 78 C48 148, 152 148, 165 78 Z" fill="#86EFAC" />
    <path d="M42 80 C54 140, 146 140, 158 80 Z" fill="#EF4444" />
    <circle cx="75" cy="98" r="4.5" fill="#1F2937" />
    <circle cx="100" cy="115" r="4.5" fill="#1F2937" />
    <circle cx="125" cy="98" r="4.5" fill="#1F2937" />
    <circle cx="100" cy="90" r="4.5" fill="#1F2937" />
  </svg>`,

  car: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M35 125 L45 88 C48 76, 60 70, 75 70 L125 70 C140 70, 152 76, 155 88 L165 125 C170 125, 175 130, 175 136 L175 148 C175 152, 170 155, 165 155 L35 155 C30 155, 25 152, 25 148 L25 136 C25 130, 30 125, 35 125 Z" fill="#3B82F6" />
    <path d="M52 90 L60 78 C64 74, 70 74, 76 74 L95 74 L95 90 Z" fill="#BAE6FD" />
    <path d="M105 74 L124 74 C130 74, 136 74, 140 78 L148 90 L105 90 Z" fill="#BAE6FD" />
    <circle cx="65" cy="155" r="20" fill="#1E293B" />
    <circle cx="65" cy="155" r="8" fill="#CBD5E1" />
    <circle cx="135" cy="155" r="20" fill="#1E293B" />
    <circle cx="135" cy="155" r="8" fill="#CBD5E1" />
    <circle cx="166" cy="132" r="7" fill="#FDE047" />
  </svg>`,

  airplane: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="100" rx="72" ry="25" fill="#0EA5E9" />
    <polygon points="100,100 80,45 115,45 125,100" fill="#0284C7" />
    <polygon points="100,100 80,155 115,155 125,100" fill="#0284C7" />
    <polygon points="40,100 25,65 42,65 55,100" fill="#0369A1" />
    <circle cx="85" cy="100" r="5" fill="#FFFFFF" />
    <circle cx="105" cy="100" r="5" fill="#FFFFFF" />
    <circle cx="125" cy="100" r="5" fill="#FFFFFF" />
    <ellipse cx="152" cy="100" rx="10" ry="14" fill="#BAE6FD" />
  </svg>`,

  plane: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="100" rx="72" ry="25" fill="#0EA5E9" />
    <polygon points="100,100 80,45 115,45 125,100" fill="#0284C7" />
    <polygon points="100,100 80,155 115,155 125,100" fill="#0284C7" />
    <polygon points="40,100 25,65 42,65 55,100" fill="#0369A1" />
    <circle cx="85" cy="100" r="5" fill="#FFFFFF" />
    <circle cx="105" cy="100" r="5" fill="#FFFFFF" />
    <circle cx="125" cy="100" r="5" fill="#FFFFFF" />
  </svg>`,

  boat: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 135 L60 165 C90 172, 110 172, 140 165 L160 135 Z" fill="#DC2626" />
    <rect x="96" y="45" width="8" height="90" fill="#78350F" />
    <polygon points="104,48 160,95 104,115" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
    <polygon points="96,60 50,110 96,110" fill="#38BDF8" />
    <path d="M25 172 Q50 160 75 172 T125 172 T175 172" stroke="#0284C7" stroke-width="5" stroke-linecap="round" fill="none"/>
  </svg>`,

  train: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="50" y="80" width="105" height="65" rx="12" fill="#EC4899" />
    <rect x="110" y="55" width="45" height="50" rx="8" fill="#BE185D" />
    <rect x="120" y="65" width="25" height="25" rx="4" fill="#FCE7F3" />
    <rect x="62" y="58" width="18" height="24" rx="4" fill="#475569" />
    <circle cx="70" cy="42" r="9" fill="#E2E8F0" opacity="0.8" />
    <circle cx="80" cy="30" r="13" fill="#E2E8F0" opacity="0.6" />
    <circle cx="72" cy="150" r="16" fill="#1E293B" />
    <circle cx="72" cy="150" r="6" fill="#E2E8F0" />
    <circle cx="110" cy="150" r="16" fill="#1E293B" />
    <circle cx="110" cy="150" r="6" fill="#E2E8F0" />
    <circle cx="145" cy="150" r="16" fill="#1E293B" />
    <circle cx="145" cy="150" r="6" fill="#E2E8F0" />
  </svg>`,

  star: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="100,25 124,75 178,82 138,120 148,175 100,148 52,175 62,120 22,82 76,75" fill="#FACC15" stroke="#EAB308" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="80" cy="95" r="5" fill="#713F12" />
    <circle cx="120" cy="95" r="5" fill="#713F12" />
    <path d="M92 110 Q100 118 108 110" stroke="#713F12" stroke-width="3" stroke-linecap="round" fill="none"/>
  </svg>`,

  ball: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="70" fill="#EF4444" />
    <path d="M50 50 C80 80, 80 120, 50 150" fill="#3B82F6" stroke="#2563EB" stroke-width="3"/>
    <path d="M150 50 C120 80, 120 120, 150 150" fill="#FACC15" stroke="#EAB308" stroke-width="3"/>
    <ellipse cx="80" cy="70" rx="15" ry="8" fill="#FFFFFF" opacity="0.4" transform="rotate(-30 80 70)"/>
  </svg>`,

  sun: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="50" fill="#F59E0B" />
    <g stroke="#F59E0B" stroke-width="8" stroke-linecap="round">
      <line x1="100" y1="20" x2="100" y2="35" />
      <line x1="100" y1="165" x2="100" y2="180" />
      <line x1="20" y1="100" x2="35" y2="100" />
      <line x1="165" y1="100" x2="180" y2="100" />
      <line x1="43" y1="43" x2="54" y2="54" />
      <line x1="146" y1="146" x2="157" y2="157" />
      <line x1="43" y1="157" x2="54" y2="146" />
      <line x1="146" y1="54" x2="157" y2="43" />
    </g>
    <circle cx="85" cy="95" r="5" fill="#78350F" />
    <circle cx="115" cy="95" r="5" fill="#78350F" />
    <path d="M90 115 Q100 125 110 115" stroke="#78350F" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  </svg>`,

  flower: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="65" r="28" fill="#EC4899" />
    <circle cx="135" cy="100" r="28" fill="#EC4899" />
    <circle cx="100" cy="135" r="28" fill="#EC4899" />
    <circle cx="65" cy="100" r="28" fill="#EC4899" />
    <circle cx="100" cy="100" r="26" fill="#FACC15" />
    <circle cx="92" cy="96" r="3.5" fill="#713F12" />
    <circle cx="108" cy="96" r="3.5" fill="#713F12" />
    <path d="M96 106 Q100 110 104 106" stroke="#713F12" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  </svg>`,

  orange: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="110" r="65" fill="#FB923C" stroke="#EA580C" stroke-width="3"/>
    <path d="M100 45 C100 35, 110 25, 115 22" stroke="#78350F" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M100 38 C115 28, 135 32, 130 46 C115 48, 105 42, 100 38 Z" fill="#22C55E" />
    <circle cx="75" cy="90" r="4" fill="#FFFFFF" opacity="0.6" />
    <circle cx="85" cy="80" r="6" fill="#FFFFFF" opacity="0.6" />
  </svg>`,

  carrot: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M70 70 C70 50, 130 50, 130 70 L105 180 C102 188, 98 188, 95 180 Z" fill="#F97316" />
    <path d="M100 55 C95 25, 75 20, 80 45" stroke="#16A34A" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M100 55 C100 20, 105 15, 102 45" stroke="#22C55E" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M100 55 C105 25, 125 20, 120 45" stroke="#16A34A" stroke-width="6" stroke-linecap="round" fill="none"/>
    <line x1="85" y1="90" x2="105" y2="90" stroke="#EA580C" stroke-width="3" stroke-linecap="round"/>
    <line x1="95" y1="120" x2="115" y2="120" stroke="#EA580C" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  tomato: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Plump Red Tomato Body -->
    <ellipse cx="100" cy="118" rx="66" ry="60" fill="#EF4444" stroke="#DC2626" stroke-width="3"/>
    <!-- Cute Green Star Calyx & Stem on top -->
    <path d="M100 62 L100 42 C100 36, 106 32, 112 30" stroke="#15803D" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M100 62 L80 48 L92 64 L72 68 L92 74 L82 90 L98 76 L112 90 L106 74 L126 68 L108 64 L120 48 Z" fill="#22C55E" stroke="#16A34A" stroke-width="2"/>
    <!-- Highlight shine reflections -->
    <ellipse cx="72" cy="100" rx="14" ry="22" transform="rotate(-25 72 100)" fill="#F87171" opacity="0.75" />
    <circle cx="65" cy="88" r="5" fill="#FFFFFF" opacity="0.85" />
    <circle cx="68" cy="128" r="9" fill="#FFA3A3" opacity="0.6"/>
    <circle cx="132" cy="128" r="9" fill="#FFA3A3" opacity="0.6"/>
  </svg>`,
};

/**
 * Returns a data URL from an SVG string for seamless <img> rendering
 */
export function svgToDataUrl(svgString: string): string {
  if (!svgString) return '';
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

export function getSvgForNameOrKey(nameOrKey: string): string {
  const lower = (nameOrKey || '').toLowerCase();
  if (ILLUSTRATIONS[lower]) return svgToDataUrl(ILLUSTRATIONS[lower]);

  if (lower.includes('mèo') || lower.includes('cat')) return svgToDataUrl(ILLUSTRATIONS.cat);
  if (lower.includes('chó') || lower.includes('cún') || lower.includes('dog')) return svgToDataUrl(ILLUSTRATIONS.dog);
  if (lower.includes('vịt') || lower.includes('duck')) return svgToDataUrl(ILLUSTRATIONS.duck);
  if (lower.includes('gà') || lower.includes('chicken')) return svgToDataUrl(ILLUSTRATIONS.chicken);
  if (lower.includes('bò') || lower.includes('cow')) return svgToDataUrl(ILLUSTRATIONS.cow);
  if (lower.includes('cừu') || lower.includes('sheep')) return svgToDataUrl(ILLUSTRATIONS.sheep);
  if (lower.includes('táo') || lower.includes('apple')) return svgToDataUrl(ILLUSTRATIONS.apple);
  if (lower.includes('chuối') || lower.includes('banana')) return svgToDataUrl(ILLUSTRATIONS.banana);
  if (lower.includes('dưa') || lower.includes('watermelon')) return svgToDataUrl(ILLUSTRATIONS.watermelon);
  if (lower.includes('cam') || lower.includes('orange')) return svgToDataUrl(ILLUSTRATIONS.orange);
  if (lower.includes('cà chua') || lower.includes('tomato')) return svgToDataUrl(ILLUSTRATIONS.tomato);
  if (lower.includes('cà rốt') || lower.includes('carrot')) return svgToDataUrl(ILLUSTRATIONS.carrot);
  if (lower.includes('ô tô') || lower.includes('xe') || lower.includes('car')) return svgToDataUrl(ILLUSTRATIONS.car);
  if (lower.includes('máy bay') || lower.includes('plane')) return svgToDataUrl(ILLUSTRATIONS.airplane);
  if (lower.includes('tàu') || lower.includes('train')) return svgToDataUrl(ILLUSTRATIONS.train);
  if (lower.includes('thuyền') || lower.includes('boat')) return svgToDataUrl(ILLUSTRATIONS.boat);
  if (lower.includes('mặt trời') || lower.includes('sun')) return svgToDataUrl(ILLUSTRATIONS.sun);
  if (lower.includes('hoa') || lower.includes('flower')) return svgToDataUrl(ILLUSTRATIONS.flower);
  if (lower.includes('bóng') || lower.includes('ball')) return svgToDataUrl(ILLUSTRATIONS.ball);
  if (lower.includes('sao') || lower.includes('star')) return svgToDataUrl(ILLUSTRATIONS.star);

  // Friendly default icon
  return svgToDataUrl(ILLUSTRATIONS.star);
}

export const PRESET_LIBRARY = [
  { id: 'cat', name: 'Mèo', category: 'Con vật', sound: 'Meo meo', question: 'Con gì kêu meo meo? Tìm bạn Mèo nào!' },
  { id: 'dog', name: 'Chó', category: 'Con vật', sound: 'Gâu gâu', question: 'Con gì kêu gâu gâu? Tìm bạn Chó nào!' },
  { id: 'duck', name: 'Vịt', category: 'Con vật', sound: 'Cạp cạp', question: 'Con gì kêu cạp cạp? Tìm bạn Vịt nào!' },
  { id: 'chicken', name: 'Gà', category: 'Con vật', sound: 'Cục ta cục tác', question: 'Con gì kêu cục ta cục tác? Tìm bạn Gà nào!' },
  { id: 'cow', name: 'Bò sữa', category: 'Con vật', sound: 'Ùm bò', question: 'Con gì kêu ùm bò? Tìm bạn Bò nào!' },
  { id: 'sheep', name: 'Cừu', category: 'Con vật', sound: 'Be be', question: 'Con gì kêu be be? Tìm bạn Cừu nào!' },
  { id: 'apple', name: 'Quả Táo', category: 'Trái cây', sound: 'Táo đỏ ngọt ngào', question: 'Đâu là quả Táo màu đỏ thơm ngon?' },
  { id: 'banana', name: 'Quả Chuối', category: 'Trái cây', sound: 'Chuối vàng cong cong', question: 'Đâu là quả Chuối màu vàng?' },
  { id: 'watermelon', name: 'Dưa Hấu', category: 'Trái cây', sound: 'Dưa hấu mát ngọt', question: 'Đâu là miếng Dưa Hấu ruột đỏ vỏ xanh?' },
  { id: 'orange', name: 'Quả Cam', category: 'Trái cây', sound: 'Cam vàng thơm mát', question: 'Quả cam tròn xoe ở đâu nào?' },
  { id: 'carrot', name: 'Cà Rốt', category: 'Rau củ', sound: 'Cà rốt giòn ngọt', question: 'Củ cà rốt màu cam ở đâu?' },
  { id: 'tomato', name: 'Quả Cà Chua', category: 'Trái cây', sound: 'Cà chua đỏ mọng', question: 'Quả Cà Chua màu đỏ mọng ở đâu nào?' },
  { id: 'car', name: 'Xe Ô tô', category: 'Phương tiện', sound: 'Bíp bíp bon bon', question: 'Xe ô tô kêu bíp bíp ở đâu con nhỉ?' },
  { id: 'airplane', name: 'Máy bay', category: 'Phương tiện', sound: 'Vù vù trên trời', question: 'Máy bay bay vù vù ở đâu nào?' },
  { id: 'boat', name: 'Thuyền buồm', category: 'Phương tiện', sound: 'Rập rình trên sóng', question: 'Thuyền buồm lướt sóng ở đâu?' },
  { id: 'train', name: 'Tàu hoả', category: 'Phương tiện', sound: 'Tu tu xình xịch', question: 'Tàu hoả chạy tu tu xình xịch ở đâu?' },
  { id: 'sun', name: 'Mặt trời', category: 'Thiên nhiên', sound: 'Tỏa nắng ấm áp', question: 'Ông mặt trời tỏa nắng ấm ở đâu?' },
  { id: 'flower', name: 'Bông hoa', category: 'Thiên nhiên', sound: 'Hoa thơm ngát', question: 'Bông hoa hồng xinh xắn ở đâu?' },
  { id: 'ball', name: 'Quả bóng', category: 'Đồ dùng', sound: 'Tưng tưng', question: 'Quả bóng tròn tưng tưng ở đâu?' },
  { id: 'star', name: 'Ngôi sao', category: 'Thiên nhiên', sound: 'Lấp lánh lấp lánh', question: 'Ngôi sao sáng lấp lánh ở đâu?' },
];

export function getFallbackDistractors(targetName: string, count: number = 2) {
  const lower = (targetName || '').toLowerCase();
  const filtered = PRESET_LIBRARY.filter(
    (item) => !lower.includes(item.name.toLowerCase()) && !item.name.toLowerCase().includes(lower)
  );

  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  const pastelColors = ['#FEF3C7', '#FFEDD5', '#FEF9C3', '#FEE2E2', '#E0F2FE', '#DCFCE7', '#EDE9FE'];

  return shuffled.slice(0, count).map((item, idx) => ({
    id: `distractor_${item.id}_${Date.now()}_${idx}`,
    name: item.name,
    imageUrl: getSvgForNameOrKey(item.id),
    soundText: item.sound,
    questionText: item.question,
    bgColor: pastelColors[idx % pastelColors.length],
  }));
}

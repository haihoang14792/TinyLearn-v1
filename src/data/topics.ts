import { svgToDataUrl, ILLUSTRATIONS } from './illustrations.ts';

export interface TopicItemData {
  id: string;
  name: string;
  icon: string;
  soundText: string;
  questionText: string;
  soundQuestionText: string;
  imitationPrompt: string;
  imageUrl: string;
  bgColor: string;
  colorName?: string;
}

export interface TopicCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  items: TopicItemData[];
}

// Additional child-friendly SVGs for the new topics
const EXTRA_SVGS: Record<string, string> = {
  fish: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 100 C70 50, 140 60, 165 100 C140 140, 70 150, 40 100 Z" fill="#38BDF8" stroke="#0284C7" stroke-width="4"/>
    <polygon points="40,100 15,65 15,135" fill="#0284C7" stroke="#0369A1" stroke-width="3"/>
    <path d="M100 65 Q115 50 130 65" fill="#BAE6FD" />
    <path d="M100 135 Q115 150 130 135" fill="#BAE6FD" />
    <circle cx="140" cy="90" r="8" fill="#1E293B" />
    <circle cx="143" cy="87" r="3" fill="#FFFFFF" />
    <ellipse cx="148" cy="108" rx="8" ry="5" fill="#FF8A8A" opacity="0.6"/>
    <path d="M158 98 Q162 102 158 106" stroke="#0284C7" stroke-width="3" stroke-linecap="round"/>
    <path d="M85 85 C95 95, 95 105, 85 115" stroke="#BAE6FD" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M105 85 C115 95, 115 105, 105 115" stroke="#BAE6FD" stroke-width="4" stroke-linecap="round" fill="none"/>
  </svg>`,

  rabbit: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="130" rx="55" ry="50" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="3"/>
    <!-- Ears -->
    <ellipse cx="75" cy="55" rx="16" ry="45" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="3"/>
    <ellipse cx="75" cy="55" rx="9" ry="32" fill="#FCE7F3" />
    <ellipse cx="125" cy="55" rx="16" ry="45" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="3"/>
    <ellipse cx="125" cy="55" rx="9" ry="32" fill="#FCE7F3" />
    <!-- Cheeks -->
    <circle cx="65" cy="140" r="12" fill="#F472B6" opacity="0.4"/>
    <circle cx="135" cy="140" r="12" fill="#F472B6" opacity="0.4"/>
    <!-- Eyes -->
    <circle cx="78" cy="115" r="7" fill="#1E293B" />
    <circle cx="81" cy="112" r="2.5" fill="#FFFFFF" />
    <circle cx="122" cy="115" r="7" fill="#1E293B" />
    <circle cx="125" cy="112" r="2.5" fill="#FFFFFF" />
    <!-- Nose & Mouth -->
    <polygon points="100,132 94,125 106,125" fill="#EC4899" />
    <path d="M100 132 C96 138, 88 138, 88 134" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M100 132 C104 138, 112 138, 112 134" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
  </svg>`,

  pig: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="110" r="65" fill="#FBCFE8" stroke="#F472B6" stroke-width="3"/>
    <polygon points="45,70 30,35 75,55" fill="#F472B6" />
    <polygon points="155,70 170,35 125,55" fill="#F472B6" />
    <!-- Snout -->
    <ellipse cx="100" cy="125" rx="26" ry="18" fill="#F472B6" />
    <circle cx="92" cy="125" r="5" fill="#9D174D" />
    <circle cx="108" cy="125" r="5" fill="#9D174D" />
    <!-- Eyes -->
    <circle cx="75" cy="95" r="7" fill="#1E293B" />
    <circle cx="77" cy="92" r="2.5" fill="#FFFFFF" />
    <circle cx="125" cy="95" r="7" fill="#1E293B" />
    <circle cx="127" cy="92" r="2.5" fill="#FFFFFF" />
    <!-- Cheeks -->
    <circle cx="55" cy="120" r="10" fill="#EC4899" opacity="0.4"/>
    <circle cx="145" cy="120" r="10" fill="#EC4899" opacity="0.4"/>
  </svg>`,

  mango: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M70 50 C120 20, 160 70, 155 120 C150 170, 95 180, 65 145 C40 115, 45 70, 70 50 Z" fill="#FBBF24" stroke="#F59E0B" stroke-width="3"/>
    <path d="M100 45 C100 28, 110 20, 115 15" stroke="#78350F" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M105 32 C125 22, 142 30, 135 45 C120 48, 110 40, 105 32 Z" fill="#22C55E" />
    <ellipse cx="75" cy="95" rx="10" ry="25" fill="#FEF08A" opacity="0.7"/>
    <circle cx="130" cy="140" r="12" fill="#F87171" opacity="0.3"/>
  </svg>`,

  grapes: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Vine & Leaf -->
    <path d="M100 50 C100 30, 108 20, 115 15" stroke="#78350F" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M98 38 C115 25, 135 32, 128 48 C112 50, 102 44, 98 38 Z" fill="#22C55E" />
    <!-- Grapes -->
    <circle cx="80" cy="75" r="18" fill="#A855F7" stroke="#7E22CE" stroke-width="2"/>
    <circle cx="120" cy="75" r="18" fill="#A855F7" stroke="#7E22CE" stroke-width="2"/>
    <circle cx="100" cy="70" r="18" fill="#9333EA" stroke="#7E22CE" stroke-width="2"/>
    <circle cx="65" cy="105" r="18" fill="#9333EA" stroke="#7E22CE" stroke-width="2"/>
    <circle cx="100" cy="105" r="18" fill="#A855F7" stroke="#7E22CE" stroke-width="2"/>
    <circle cx="135" cy="105" r="18" fill="#9333EA" stroke="#7E22CE" stroke-width="2"/>
    <circle cx="80" cy="135" r="18" fill="#A855F7" stroke="#7E22CE" stroke-width="2"/>
    <circle cx="120" cy="135" r="18" fill="#9333EA" stroke="#7E22CE" stroke-width="2"/>
    <circle cx="100" cy="162" r="16" fill="#7E22CE" stroke="#6B21A8" stroke-width="2"/>
  </svg>`,

  corn: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="105" rx="35" ry="65" fill="#FACC15" stroke="#EAB308" stroke-width="3"/>
    <!-- Kernels grid -->
    <line x1="85" y1="50" x2="85" y2="160" stroke="#CA8A04" stroke-width="2" stroke-dasharray="8 6"/>
    <line x1="100" y1="45" x2="100" y2="165" stroke="#CA8A04" stroke-width="2" stroke-dasharray="8 6"/>
    <line x1="115" y1="50" x2="115" y2="160" stroke="#CA8A04" stroke-width="2" stroke-dasharray="8 6"/>
    <!-- Husks -->
    <path d="M65 145 C50 90, 65 50, 85 45 C75 90, 70 135, 90 170 Z" fill="#86EFAC" stroke="#22C55E" stroke-width="2"/>
    <path d="M135 145 C150 90, 135 50, 115 45 C125 90, 130 135, 110 170 Z" fill="#86EFAC" stroke="#22C55E" stroke-width="2"/>
  </svg>`,

  pumpkin: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 50 C100 35, 110 25, 118 20" stroke="#15803D" stroke-width="8" stroke-linecap="round" fill="none"/>
    <ellipse cx="60" cy="120" rx="36" ry="46" fill="#EA580C" />
    <ellipse cx="140" cy="120" rx="36" ry="46" fill="#EA580C" />
    <ellipse cx="80" cy="122" rx="34" ry="48" fill="#F97316" />
    <ellipse cx="120" cy="122" rx="34" ry="48" fill="#F97316" />
    <ellipse cx="100" cy="124" rx="32" ry="50" fill="#FB923C" />
  </svg>`,

  cabbage: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="110" r="58" fill="#4ADE80" stroke="#16A34A" stroke-width="3"/>
    <path d="M60 80 C80 60, 120 60, 140 80 C130 120, 70 120, 60 80 Z" fill="#86EFAC" />
    <path d="M50 115 C75 140, 125 140, 150 115 C135 155, 65 155, 50 115 Z" fill="#86EFAC" />
    <path d="M90 65 Q100 110 95 150" stroke="#DCFCE7" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M110 65 Q100 110 105 150" stroke="#DCFCE7" stroke-width="4" stroke-linecap="round" fill="none"/>
  </svg>`,

  potato: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M60 80 C75 45, 135 50, 150 85 C165 120, 135 165, 95 160 C55 155, 45 115, 60 80 Z" fill="#D97706" stroke="#B45309" stroke-width="3"/>
    <ellipse cx="80" cy="85" rx="6" ry="3" fill="#92400E" />
    <ellipse cx="120" cy="95" rx="7" ry="4" fill="#92400E" />
    <ellipse cx="95" cy="125" rx="6" ry="3" fill="#92400E" />
    <ellipse cx="130" cy="135" rx="5" ry="3" fill="#92400E" />
    <ellipse cx="70" cy="120" rx="5" ry="3" fill="#92400E" />
  </svg>`,

  motorbike: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="140" r="24" fill="#1E293B" stroke="#475569" stroke-width="4"/>
    <circle cx="50" cy="140" r="10" fill="#CBD5E1" />
    <circle cx="150" cy="140" r="24" fill="#1E293B" stroke="#475569" stroke-width="4"/>
    <circle cx="150" cy="140" r="10" fill="#CBD5E1" />
    <!-- Frame -->
    <path d="M50 140 L85 100 L120 100 L150 140" stroke="#EF4444" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M85 100 L95 80 L135 80" stroke="#1E293B" stroke-width="6" stroke-linecap="round"/>
    <circle cx="135" cy="78" r="8" fill="#FDE047" />
    <rect x="75" y="85" width="35" height="15" rx="5" fill="#3B82F6" />
  </svg>`,

  bicycle: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="45" cy="135" r="26" fill="none" stroke="#1E293B" stroke-width="6"/>
    <circle cx="45" cy="135" r="6" fill="#3B82F6" />
    <circle cx="155" cy="135" r="26" fill="none" stroke="#1E293B" stroke-width="6"/>
    <circle cx="155" cy="135" r="6" fill="#3B82F6" />
    <!-- Frame -->
    <path d="M45 135 L90 135 L125 90 L80 90 Z" stroke="#10B981" stroke-width="7" stroke-linejoin="round" fill="none"/>
    <line x1="90" y1="135" x2="80" y2="90" stroke="#10B981" stroke-width="7"/>
    <line x1="125" y1="90" x2="155" y2="135" stroke="#10B981" stroke-width="7"/>
    <!-- Seat & Handlebar -->
    <line x1="70" y1="80" x2="90" y2="80" stroke="#1E293B" stroke-width="6" stroke-linecap="round"/>
    <line x1="120" y1="75" x2="135" y2="75" stroke="#1E293B" stroke-width="6" stroke-linecap="round"/>
  </svg>`,

  bus: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="30" y="60" width="140" height="80" rx="18" fill="#FACC15" stroke="#CA8A04" stroke-width="3"/>
    <rect x="40" y="75" width="26" height="26" rx="4" fill="#BAE6FD" />
    <rect x="74" y="75" width="26" height="26" rx="4" fill="#BAE6FD" />
    <rect x="108" y="75" width="26" height="26" rx="4" fill="#BAE6FD" />
    <rect x="142" y="75" width="22" height="34" rx="4" fill="#BAE6FD" />
    <circle cx="60" cy="142" r="16" fill="#1E293B" />
    <circle cx="60" cy="142" r="6" fill="#CBD5E1" />
    <circle cx="140" cy="142" r="16" fill="#1E293B" />
    <circle cx="140" cy="142" r="6" fill="#CBD5E1" />
  </svg>`,

  chair: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Backrest -->
    <rect x="60" y="35" width="80" height="60" rx="10" fill="#F59E0B" stroke="#D97706" stroke-width="3"/>
    <!-- Seat -->
    <rect x="50" y="95" width="100" height="22" rx="6" fill="#D97706" />
    <!-- Legs -->
    <rect x="58" y="117" width="12" height="55" rx="4" fill="#B45309" />
    <rect x="130" y="117" width="12" height="55" rx="4" fill="#B45309" />
  </svg>`,

  table: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Tabletop -->
    <ellipse cx="100" cy="75" rx="75" ry="24" fill="#FBBF24" stroke="#D97706" stroke-width="4"/>
    <rect x="25" y="75" width="150" height="15" rx="4" fill="#D97706" />
    <!-- Legs -->
    <rect x="45" y="90" width="14" height="75" rx="4" fill="#B45309" />
    <rect x="141" y="90" width="14" height="75" rx="4" fill="#B45309" />
  </svg>`,

  cup: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M55 60 L65 145 C67 155, 78 165, 90 165 L110 165 C122 165, 133 155, 135 145 L145 60 Z" fill="#38BDF8" stroke="#0284C7" stroke-width="3"/>
    <ellipse cx="100" cy="60" rx="45" ry="12" fill="#BAE6FD" stroke="#0284C7" stroke-width="3"/>
    <!-- Handle -->
    <path d="M140 75 C165 75, 165 130, 130 130" stroke="#0284C7" stroke-width="8" stroke-linecap="round" fill="none"/>
  </svg>`,

  spoon: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="65" cy="65" rx="35" ry="25" transform="rotate(-30 65 65)" fill="#CBD5E1" stroke="#94A3B8" stroke-width="3"/>
    <ellipse cx="65" cy="65" rx="26" ry="18" transform="rotate(-30 65 65)" fill="#F1F5F9" />
    <path d="M85 85 L155 155" stroke="#94A3B8" stroke-width="12" stroke-linecap="round"/>
  </svg>`,

  bed: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Headboard -->
    <rect x="30" y="60" width="20" height="85" rx="6" fill="#854D0E" />
    <!-- Footboard -->
    <rect x="150" y="85" width="18" height="60" rx="6" fill="#854D0E" />
    <!-- Mattress & Blanket -->
    <rect x="45" y="100" width="110" height="30" rx="6" fill="#FDE047" stroke="#EAB308" stroke-width="2"/>
    <rect x="75" y="100" width="80" height="30" rx="6" fill="#38BDF8" />
    <rect x="50" y="92" width="28" height="16" rx="4" fill="#FFFFFF" />
  </svg>`,

  fan: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Stand -->
    <rect x="94" y="105" width="12" height="60" rx="4" fill="#64748B" />
    <ellipse cx="100" cy="168" rx="38" ry="12" fill="#475569" />
    <!-- Fan Cage -->
    <circle cx="100" cy="70" r="48" fill="#F0FDF4" stroke="#22C55E" stroke-width="4"/>
    <!-- Blades -->
    <circle cx="100" cy="70" r="12" fill="#15803D" />
    <ellipse cx="100" cy="40" rx="10" ry="20" fill="#4ADE80" opacity="0.8"/>
    <ellipse cx="125" cy="85" rx="10" ry="20" transform="rotate(60 125 85)" fill="#4ADE80" opacity="0.8"/>
    <ellipse cx="75" cy="85" rx="10" ry="20" transform="rotate(-60 75 85)" fill="#4ADE80" opacity="0.8"/>
  </svg>`,

  dad: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Hair -->
    <ellipse cx="100" cy="95" rx="50" ry="46" fill="#1E293B" />
    <!-- Face -->
    <ellipse cx="100" cy="110" rx="44" ry="45" fill="#FED7AA" />
    <!-- Eyes -->
    <circle cx="82" cy="105" r="5" fill="#1E293B" />
    <circle cx="118" cy="105" r="5" fill="#1E293B" />
    <!-- Cheeks & Smile -->
    <ellipse cx="75" cy="118" rx="8" ry="5" fill="#FB7185" opacity="0.5"/>
    <ellipse cx="125" cy="118" rx="8" ry="5" fill="#FB7185" opacity="0.5"/>
    <path d="M90 125 Q100 135 110 125" stroke="#1E293B" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <!-- Shirt -->
    <path d="M60 155 Q100 145 140 155 L150 190 L50 190 Z" fill="#3B82F6" />
  </svg>`,

  mom: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Long Hair -->
    <ellipse cx="100" cy="105" rx="55" ry="52" fill="#78350F" />
    <rect x="50" y="100" width="100" height="60" rx="15" fill="#78350F" />
    <!-- Face -->
    <ellipse cx="100" cy="110" rx="42" ry="44" fill="#FED7AA" />
    <!-- Eyes with cute lashes -->
    <circle cx="82" cy="106" r="5" fill="#1E293B" />
    <circle cx="118" cy="106" r="5" fill="#1E293B" />
    <path d="M80 98 L75 94" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M120 98 L125 94" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Smile & Blush -->
    <ellipse cx="73" cy="118" rx="9" ry="6" fill="#F43F5E" opacity="0.5"/>
    <ellipse cx="127" cy="118" rx="9" ry="6" fill="#F43F5E" opacity="0.5"/>
    <path d="M92 126 Q100 134 108 126" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Dress -->
    <path d="M62 155 Q100 145 138 155 L148 190 L52 190 Z" fill="#EC4899" />
  </svg>`,

  baby: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="110" rx="52" ry="50" fill="#FED7AA" />
    <!-- Little hair curl -->
    <path d="M100 60 C90 50, 105 45, 102 60" stroke="#78350F" stroke-width="4" stroke-linecap="round" fill="none"/>
    <!-- Big cute baby eyes -->
    <circle cx="78" cy="105" r="9" fill="#1E293B" />
    <circle cx="81" cy="101" r="3.5" fill="#FFFFFF" />
    <circle cx="122" cy="105" r="9" fill="#1E293B" />
    <circle cx="125" cy="101" r="3.5" fill="#FFFFFF" />
    <!-- Rosy cheeks -->
    <circle cx="68" cy="120" r="12" fill="#FB7185" opacity="0.5"/>
    <circle cx="132" cy="120" r="12" fill="#FB7185" opacity="0.5"/>
    <!-- Pacifier or cute smile -->
    <path d="M92 125 Q100 135 108 125" stroke="#1E293B" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  </svg>`,

  grandfather: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="112" rx="44" ry="46" fill="#FED7AA" />
    <!-- Gray Hair on sides -->
    <ellipse cx="56" cy="105" rx="10" ry="18" fill="#E2E8F0" />
    <ellipse cx="144" cy="105" rx="10" ry="18" fill="#E2E8F0" />
    <!-- Glasses -->
    <circle cx="80" cy="106" r="12" fill="none" stroke="#64748B" stroke-width="3"/>
    <circle cx="120" cy="106" r="12" fill="none" stroke="#64748B" stroke-width="3"/>
    <line x1="92" y1="106" x2="108" y2="106" stroke="#64748B" stroke-width="3"/>
    <circle cx="80" cy="106" r="3.5" fill="#1E293B" />
    <circle cx="120" cy="106" r="3.5" fill="#1E293B" />
    <!-- Mustache -->
    <path d="M85 125 Q100 120 115 125 Q100 132 85 125 Z" fill="#E2E8F0" />
    <!-- Shirt -->
    <path d="M60 158 Q100 148 140 158 L150 190 L50 190 Z" fill="#10B981" />
  </svg>`,

  grandmother: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Gray Hair Bun -->
    <circle cx="100" cy="55" r="18" fill="#CBD5E1" />
    <ellipse cx="100" cy="98" rx="50" ry="46" fill="#CBD5E1" />
    <ellipse cx="100" cy="112" rx="42" ry="44" fill="#FED7AA" />
    <!-- Round glasses -->
    <circle cx="82" cy="108" r="11" fill="none" stroke="#D97706" stroke-width="3"/>
    <circle cx="118" cy="108" r="11" fill="none" stroke="#D97706" stroke-width="3"/>
    <line x1="93" y1="108" x2="107" y2="108" stroke="#D97706" stroke-width="3"/>
    <circle cx="82" cy="108" r="3.5" fill="#1E293B" />
    <circle cx="118" cy="108" r="3.5" fill="#1E293B" />
    <path d="M92 128 Q100 134 108 128" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
    <ellipse cx="72" cy="120" rx="8" ry="5" fill="#FB7185" opacity="0.4"/>
    <ellipse cx="128" cy="120" rx="8" ry="5" fill="#FB7185" opacity="0.4"/>
  </svg>`,

  sister: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Pigtails -->
    <ellipse cx="48" cy="100" rx="14" ry="24" fill="#78350F" />
    <ellipse cx="152" cy="100" rx="14" ry="24" fill="#78350F" />
    <circle cx="58" cy="85" r="7" fill="#F43F5E" />
    <circle cx="142" cy="85" r="7" fill="#F43F5E" />
    <ellipse cx="100" cy="110" rx="46" ry="44" fill="#FED7AA" />
    <path d="M60 85 Q100 70 140 85" stroke="#78350F" stroke-width="8" stroke-linecap="round"/>
    <circle cx="80" cy="108" r="6" fill="#1E293B" />
    <circle cx="82" cy="105" r="2" fill="#FFFFFF" />
    <circle cx="120" cy="108" r="6" fill="#1E293B" />
    <circle cx="122" cy="105" r="2" fill="#FFFFFF" />
    <ellipse cx="72" cy="118" rx="8" ry="5" fill="#FB7185" opacity="0.5"/>
    <ellipse cx="128" cy="118" rx="8" ry="5" fill="#FB7185" opacity="0.5"/>
    <path d="M92 125 Q100 133 108 125" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
  </svg>`,

  eyes: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Left Eye -->
    <ellipse cx="65" cy="100" rx="30" ry="24" fill="#FFFFFF" stroke="#0284C7" stroke-width="4"/>
    <circle cx="65" cy="100" r="16" fill="#0284C7" />
    <circle cx="65" cy="100" r="10" fill="#0F172A" />
    <circle cx="69" cy="95" r="5" fill="#FFFFFF" />
    <!-- Right Eye -->
    <ellipse cx="135" cy="100" rx="30" ry="24" fill="#FFFFFF" stroke="#0284C7" stroke-width="4"/>
    <circle cx="135" cy="100" r="16" fill="#0284C7" />
    <circle cx="135" cy="100" r="10" fill="#0F172A" />
    <circle cx="139" cy="95" r="5" fill="#FFFFFF" />
    <!-- Brows -->
    <path d="M45 70 Q65 60 85 70" stroke="#78350F" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M115 70 Q135 60 155 70" stroke="#78350F" stroke-width="5" stroke-linecap="round" fill="none"/>
  </svg>`,

  nose: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="115" rx="32" ry="28" fill="#FED7AA" stroke="#F97316" stroke-width="3"/>
    <ellipse cx="88" cy="120" rx="6" ry="8" fill="#EA580C" opacity="0.6"/>
    <ellipse cx="112" cy="120" rx="6" ry="8" fill="#EA580C" opacity="0.6"/>
    <ellipse cx="100" cy="105" rx="14" ry="10" fill="#FDBA74" />
  </svg>`,

  mouth: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 90 Q100 160 150 90 Q100 120 50 90 Z" fill="#F43F5E" stroke="#BE123C" stroke-width="4"/>
    <!-- Teeth -->
    <path d="M70 100 Q100 110 130 100" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
    <!-- Tongue -->
    <ellipse cx="100" cy="128" rx="24" ry="16" fill="#FDA4AF" />
  </svg>`,

  ear: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M80 40 C140 40, 150 110, 130 145 C115 170, 80 170, 75 145 C70 120, 80 50, 80 40 Z" fill="#FED7AA" stroke="#FB923C" stroke-width="4"/>
    <path d="M95 65 C125 65, 130 110, 115 130 C105 145, 90 140, 92 125" stroke="#FB923C" stroke-width="4" stroke-linecap="round" fill="none"/>
  </svg>`,

  hand: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M60 100 C50 90, 40 100, 50 115 L60 130 L60 165 C60 175, 70 180, 80 180 L120 180 C130 180, 140 175, 140 165 L140 100 C140 90, 130 90, 130 100 L130 85 C130 75, 120 75, 120 85 L120 75 C120 65, 110 65, 110 75 L110 85 C110 75, 100 75, 100 85 L100 110" fill="#FED7AA" stroke="#F97316" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  foot: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Leg -->
    <rect x="75" y="40" width="35" height="70" rx="8" fill="#FED7AA" stroke="#FB923C" stroke-width="3"/>
    <!-- Foot base -->
    <path d="M75 110 L60 145 C55 160, 70 170, 90 170 L140 170 C155 170, 160 155, 145 140 L110 110 Z" fill="#FED7AA" stroke="#FB923C" stroke-width="4"/>
    <!-- Toes -->
    <circle cx="145" cy="148" r="8" fill="#FED7AA" stroke="#FB923C" stroke-width="2"/>
    <circle cx="138" cy="140" r="7" fill="#FED7AA" stroke="#FB923C" stroke-width="2"/>
    <circle cx="130" cy="134" r="6" fill="#FED7AA" stroke="#FB923C" stroke-width="2"/>
  </svg>`,

  clock: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="68" fill="#FEF08A" stroke="#EAB308" stroke-width="6"/>
    <!-- Bells on top -->
    <ellipse cx="60" cy="40" rx="14" ry="10" transform="rotate(-30 60 40)" fill="#EAB308" />
    <ellipse cx="140" cy="40" rx="14" ry="10" transform="rotate(30 140 40)" fill="#EAB308" />
    <!-- Clock face -->
    <circle cx="100" cy="100" r="54" fill="#FFFFFF" />
    <circle cx="100" cy="100" r="5" fill="#1E293B" />
    <line x1="100" y1="100" x2="100" y2="65" stroke="#1E293B" stroke-width="4" stroke-linecap="round"/>
    <line x1="100" y1="100" x2="125" y2="100" stroke="#EF4444" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  doorbell: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="65" y="45" width="70" height="110" rx="16" fill="#F8FAFC" stroke="#94A3B8" stroke-width="4"/>
    <circle cx="100" cy="95" r="22" fill="#F59E0B" stroke="#D97706" stroke-width="3"/>
    <circle cx="100" cy="95" r="14" fill="#FDE047" />
    <!-- Sound Waves -->
    <path d="M145 75 C155 85, 155 105, 145 115" stroke="#3B82F6" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M158 65 C175 80, 175 110, 158 125" stroke="#3B82F6" stroke-width="4" stroke-linecap="round" fill="none"/>
  </svg>`,

  horn: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Bulb -->
    <circle cx="55" cy="100" r="28" fill="#EF4444" stroke="#DC2626" stroke-width="3"/>
    <!-- Trumpet tube & flare -->
    <path d="M80 92 L130 92 L165 65 L165 135 L130 108 L80 108 Z" fill="#FACC15" stroke="#EAB308" stroke-width="3"/>
    <!-- Sound waves -->
    <path d="M175 85 C185 92, 185 108, 175 115" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" fill="none"/>
  </svg>`,

  rain: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Cloud -->
    <path d="M60 100 C50 100, 40 90, 45 78 C48 68, 60 62, 70 65 C75 52, 95 48, 110 55 C122 48, 140 52, 145 65 C155 65, 165 75, 160 88 C165 100, 150 105, 140 100 Z" fill="#BAE6FD" stroke="#38BDF8" stroke-width="3"/>
    <!-- Raindrops -->
    <path d="M65 120 L58 135" stroke="#0284C7" stroke-width="5" stroke-linecap="round"/>
    <path d="M95 120 L88 135" stroke="#0284C7" stroke-width="5" stroke-linecap="round"/>
    <path d="M125 120 L118 135" stroke="#0284C7" stroke-width="5" stroke-linecap="round"/>
    <path d="M80 148 L73 163" stroke="#0284C7" stroke-width="5" stroke-linecap="round"/>
    <path d="M110 148 L103 163" stroke="#0284C7" stroke-width="5" stroke-linecap="round"/>
    <path d="M140 148 L133 163" stroke="#0284C7" stroke-width="5" stroke-linecap="round"/>
  </svg>`,

  drum: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Drum body -->
    <path d="M50 85 L50 135 C50 155, 150 155, 150 135 L150 85 Z" fill="#EF4444" stroke="#DC2626" stroke-width="3"/>
    <ellipse cx="100" cy="85" rx="50" ry="18" fill="#FEF08A" stroke="#EAB308" stroke-width="3"/>
    <!-- Zigzag straps -->
    <path d="M50 85 L75 145 L100 85 L125 145 L150 85" stroke="#FACC15" stroke-width="4" stroke-linecap="round" fill="none"/>
    <!-- Drumsticks -->
    <line x1="45" y1="50" x2="85" y2="80" stroke="#78350F" stroke-width="5" stroke-linecap="round"/>
    <circle cx="85" cy="80" r="7" fill="#F59E0B" />
    <line x1="155" y1="50" x2="115" y2="80" stroke="#78350F" stroke-width="5" stroke-linecap="round"/>
    <circle cx="115" cy="80" r="7" fill="#F59E0B" />
  </svg>`,

  bird: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Bird body -->
    <ellipse cx="100" cy="115" rx="46" ry="38" fill="#38BDF8" stroke="#0284C7" stroke-width="3"/>
    <!-- Wing -->
    <ellipse cx="85" cy="115" rx="22" ry="14" fill="#0284C7" />
    <!-- Head -->
    <circle cx="125" cy="85" r="26" fill="#38BDF8" stroke="#0284C7" stroke-width="3"/>
    <circle cx="132" cy="80" r="5" fill="#1E293B" />
    <circle cx="134" cy="78" r="1.5" fill="#FFFFFF" />
    <!-- Beak -->
    <polygon points="150,85 170,88 150,95" fill="#F59E0B" />
    <!-- Notes -->
    <text x="145" y="55" font-size="24" fill="#EC4899">🎵</text>
  </svg>`
};

function getAssetUrl(key: string): string {
  if (ILLUSTRATIONS[key]) {
    return svgToDataUrl(ILLUSTRATIONS[key]);
  }
  if (EXTRA_SVGS[key]) {
    return svgToDataUrl(EXTRA_SVGS[key]);
  }
  return svgToDataUrl(ILLUSTRATIONS.star);
}

export const TOPIC_CATEGORIES: TopicCategory[] = [
  // 1. ĐỘNG VẬT (Animals) - 8 items
  {
    id: 'animals',
    name: 'Động vật',
    icon: '🐶',
    description: 'Bé làm quen các bạn động vật thân quen: tiếng kêu, dáng vẻ',
    color: '#FEF3C7',
    items: [
      {
        id: 'cat',
        name: 'Mèo',
        icon: '🐱',
        soundText: 'Meo meo',
        questionText: 'Con mèo đâu?',
        soundQuestionText: 'Con gì kêu meo meo? Tìm bạn Mèo nào!',
        imitationPrompt: 'Con nói: Mèo',
        imageUrl: getAssetUrl('cat'),
        bgColor: '#FEF3C7',
        colorName: 'amber'
      },
      {
        id: 'dog',
        name: 'Chó',
        icon: '🐶',
        soundText: 'Gâu gâu',
        questionText: 'Con chó đâu?',
        soundQuestionText: 'Con gì kêu gâu gâu? Tìm bạn Chó nào!',
        imitationPrompt: 'Con nói: Chó',
        imageUrl: getAssetUrl('dog'),
        bgColor: '#FFEDD5',
        colorName: 'orange'
      },
      {
        id: 'chicken',
        name: 'Gà',
        icon: '🐔',
        soundText: 'Cục ta cục tác',
        questionText: 'Con gà đâu?',
        soundQuestionText: 'Con gì kêu cục ta cục tác? Tìm bạn Gà nào!',
        imitationPrompt: 'Con nói: Gà',
        imageUrl: getAssetUrl('chicken'),
        bgColor: '#FFFBEB',
        colorName: 'yellow'
      },
      {
        id: 'duck',
        name: 'Vịt',
        icon: '🦆',
        soundText: 'Cạp cạp',
        questionText: 'Con vịt đâu?',
        soundQuestionText: 'Con gì kêu cạp cạp? Tìm bạn Vịt nào!',
        imitationPrompt: 'Con nói: Vịt',
        imageUrl: getAssetUrl('duck'),
        bgColor: '#FEF9C3',
        colorName: 'yellow'
      },
      {
        id: 'fish',
        name: 'Cá',
        icon: '🐟',
        soundText: 'Bơi lội tung tăng',
        questionText: 'Con cá đâu?',
        soundQuestionText: 'Bạn nào bơi tung tăng dưới nước? Tìm bạn Cá nào!',
        imitationPrompt: 'Con nói: Cá',
        imageUrl: getAssetUrl('fish'),
        bgColor: '#E0F2FE',
        colorName: 'sky'
      },
      {
        id: 'rabbit',
        name: 'Thỏ',
        icon: '🐰',
        soundText: 'Tai dài nhảy nhót',
        questionText: 'Con thỏ đâu?',
        soundQuestionText: 'Bạn nào có đôi tai dài nhảy nhót? Tìm bạn Thỏ nào!',
        imitationPrompt: 'Con nói: Thỏ',
        imageUrl: getAssetUrl('rabbit'),
        bgColor: '#FCE7F3',
        colorName: 'pink'
      },
      {
        id: 'cow',
        name: 'Bò',
        icon: '🐮',
        soundText: 'Ùm bò',
        questionText: 'Con bò đâu?',
        soundQuestionText: 'Con gì kêu ùm bò cho bé sữa ngọt? Tìm bạn Bò nào!',
        imitationPrompt: 'Con nói: Bò',
        imageUrl: getAssetUrl('cow'),
        bgColor: '#F1F5F9',
        colorName: 'slate'
      },
      {
        id: 'pig',
        name: 'Heo',
        icon: '🐷',
        soundText: 'Ủn ỉn',
        questionText: 'Con heo đâu?',
        soundQuestionText: 'Con gì kêu ủn ỉn béo tròn? Tìm bạn Heo nào!',
        imitationPrompt: 'Con nói: Heo',
        imageUrl: getAssetUrl('pig'),
        bgColor: '#FDF2F8',
        colorName: 'pink'
      }
    ]
  },

  // 2. TRÁI CÂY (Fruits) - 6 items
  {
    id: 'fruits',
    name: 'Trái cây',
    icon: '🍎',
    description: 'Bé nhận biết màu sắc, hương vị thơm ngọt của trái cây',
    color: '#FEE2E2',
    items: [
      {
        id: 'apple',
        name: 'Táo',
        icon: '🍎',
        soundText: 'Đỏ ngọt thơm giòn',
        questionText: 'Quả táo đâu?',
        soundQuestionText: 'Quả nào màu đỏ ngọt giòn? Tìm quả Táo nào!',
        imitationPrompt: 'Con nói: Táo',
        imageUrl: getAssetUrl('apple'),
        bgColor: '#FEE2E2',
        colorName: 'red'
      },
      {
        id: 'banana',
        name: 'Chuối',
        icon: '🍌',
        soundText: 'Vàng cong cong',
        questionText: 'Quả chuối đâu?',
        soundQuestionText: 'Quả gì chín vàng cong cong? Tìm quả Chuối nào!',
        imitationPrompt: 'Con nói: Chuối',
        imageUrl: getAssetUrl('banana'),
        bgColor: '#FEF9C3',
        colorName: 'yellow'
      },
      {
        id: 'orange',
        name: 'Cam',
        icon: '🍊',
        soundText: 'Tròn thơm mọng nước',
        questionText: 'Quả cam đâu?',
        soundQuestionText: 'Quả nào tròn xoe nhiều vitamin C? Tìm quả Cam nào!',
        imitationPrompt: 'Con nói: Cam',
        imageUrl: getAssetUrl('orange'),
        bgColor: '#FFEDD5',
        colorName: 'orange'
      },
      {
        id: 'watermelon',
        name: 'Dưa hấu',
        icon: '🍉',
        soundText: 'Ruột đỏ vỏ xanh',
        questionText: 'Quả dưa hấu đâu?',
        soundQuestionText: 'Quả gì ruột đỏ ngọt mát nhiều hạt đen? Tìm Dưa Hấu nào!',
        imitationPrompt: 'Con nói: Dưa hấu',
        imageUrl: getAssetUrl('watermelon'),
        bgColor: '#DCFCE7',
        colorName: 'green'
      },
      {
        id: 'mango',
        name: 'Xoài',
        icon: '🥭',
        soundText: 'Vàng thơm lừng',
        questionText: 'Quả xoài đâu?',
        soundQuestionText: 'Quả gì chín vàng thơm nức mũi? Tìm quả Xoài nào!',
        imitationPrompt: 'Con nói: Xoài',
        imageUrl: getAssetUrl('mango'),
        bgColor: '#FEF3C7',
        colorName: 'amber'
      },
      {
        id: 'grapes',
        name: 'Nho',
        icon: '🍇',
        soundText: 'Từng chùm tím ngọt',
        questionText: 'Chùm nho đâu?',
        soundQuestionText: 'Chùm quả tròn tím mọng xinh xắn ở đâu nào?',
        imitationPrompt: 'Con nói: Nho',
        imageUrl: getAssetUrl('grapes'),
        bgColor: '#F3E8FF',
        colorName: 'purple'
      }
    ]
  },

  // 3. RAU CỦ (Vegetables) - 6 items
  {
    id: 'vegetables',
    name: 'Rau củ',
    icon: '🥕',
    description: 'Bé nhận biết rau củ quả bổ dưỡng hàng ngày',
    color: '#FFEDD5',
    items: [
      {
        id: 'tomato',
        name: 'Cà chua',
        icon: '🍅',
        soundText: 'Đỏ mọng tròn xoe',
        questionText: 'Quả cà chua đâu?',
        soundQuestionText: 'Quả tròn xoe có cuống lá xanh ở đâu nào?',
        imitationPrompt: 'Con nói: Cà chua',
        imageUrl: getAssetUrl('tomato'),
        bgColor: '#FEE2E2',
        colorName: 'red'
      },
      {
        id: 'carrot',
        name: 'Cà rốt',
        icon: '🥕',
        soundText: 'Màu cam thỏ thích',
        questionText: 'Củ cà rốt đâu?',
        soundQuestionText: 'Củ gì màu cam bạn thỏ rất thích ăn?',
        imitationPrompt: 'Con nói: Cà rốt',
        imageUrl: getAssetUrl('carrot'),
        bgColor: '#FFEDD5',
        colorName: 'orange'
      },
      {
        id: 'corn',
        name: 'Bắp ngô',
        icon: '🌽',
        soundText: 'Hạt vàng đều tăm tắp',
        questionText: 'Bắp ngô đâu?',
        soundQuestionText: 'Bắp gì hạt vàng thơm ngọt? Tìm Bắp Ngô nào!',
        imitationPrompt: 'Con nói: Bắp ngô',
        imageUrl: getAssetUrl('corn'),
        bgColor: '#FEF9C3',
        colorName: 'yellow'
      },
      {
        id: 'pumpkin',
        name: 'Bí đỏ',
        icon: '🎃',
        soundText: 'To tròn bổ dưỡng',
        questionText: 'Quả bí đỏ đâu?',
        soundQuestionText: 'Quả gì to tròn nấu canh súp thơm ngon?',
        imitationPrompt: 'Con nói: Bí đỏ',
        imageUrl: getAssetUrl('pumpkin'),
        bgColor: '#FFEDD5',
        colorName: 'orange'
      },
      {
        id: 'cabbage',
        name: 'Rau cải',
        icon: '🥬',
        soundText: 'Lá xanh mát lành',
        questionText: 'Rau cải đâu?',
        soundQuestionText: 'Cây rau lá xanh mát mẹ nấu canh cho bé ở đâu?',
        imitationPrompt: 'Con nói: Rau cải',
        imageUrl: getAssetUrl('cabbage'),
        bgColor: '#DCFCE7',
        colorName: 'green'
      },
      {
        id: 'potato',
        name: 'Khoai tây',
        icon: '🥔',
        soundText: 'Củ nâu bùi bùi',
        questionText: 'Củ khoai tây đâu?',
        soundQuestionText: 'Củ tròn nâu ăn bùi bùi thơm ngon ở đâu nhỉ?',
        imitationPrompt: 'Con nói: Khoai tây',
        imageUrl: getAssetUrl('potato'),
        bgColor: '#FEF3C7',
        colorName: 'amber'
      }
    ]
  },

  // 4. PHƯƠNG TIỆN GIAO THÔNG (Vehicles) - 6 items
  {
    id: 'vehicles',
    name: 'Phương tiện giao thông',
    icon: '🚗',
    description: 'Bé nhận biết âm thanh còi xe, phương tiện trên đường',
    color: '#E0E7FF',
    items: [
      {
        id: 'car',
        name: 'Ô tô',
        icon: '🚗',
        soundText: 'Bíp bíp bon bon',
        questionText: 'Xe ô tô đâu?',
        soundQuestionText: 'Xe nào kêu bíp bíp bon bon chạy trên đường?',
        imitationPrompt: 'Con nói: Ô tô',
        imageUrl: getAssetUrl('car'),
        bgColor: '#E0E7FF',
        colorName: 'blue'
      },
      {
        id: 'motorbike',
        name: 'Xe máy',
        icon: '🛵',
        soundText: 'Bành bành bành',
        questionText: 'Xe máy đâu?',
        soundQuestionText: 'Xe máy bố chở bé đi học ở đâu nào?',
        imitationPrompt: 'Con nói: Xe máy',
        imageUrl: getAssetUrl('motorbike'),
        bgColor: '#FEE2E2',
        colorName: 'red'
      },
      {
        id: 'bicycle',
        name: 'Xe đạp',
        icon: '🚲',
        soundText: 'Kính coong kính coong',
        questionText: 'Xe đạp đâu?',
        soundQuestionText: 'Xe nào có 2 bánh bé đạp vòng tròn kính coong?',
        imitationPrompt: 'Con nói: Xe đạp',
        imageUrl: getAssetUrl('bicycle'),
        bgColor: '#DCFCE7',
        colorName: 'green'
      },
      {
        id: 'bus',
        name: 'Xe buýt',
        icon: '🚌',
        soundText: 'To lớn đón chở khách',
        questionText: 'Xe buýt đâu?',
        soundQuestionText: 'Xe buýt to lớn chở nhiều bạn đi học ở đâu nhỉ?',
        imitationPrompt: 'Con nói: Xe buýt',
        imageUrl: getAssetUrl('bus'),
        bgColor: '#FEF9C3',
        colorName: 'yellow'
      },
      {
        id: 'airplane',
        name: 'Máy bay',
        icon: '✈️',
        soundText: 'Vù vù trên trời cao',
        questionText: 'Máy bay đâu?',
        soundQuestionText: 'Phương tiện nào bay vù vù trên trời mây trắng?',
        imitationPrompt: 'Con nói: Máy bay',
        imageUrl: getAssetUrl('airplane'),
        bgColor: '#E0F2FE',
        colorName: 'sky'
      },
      {
        id: 'train',
        name: 'Tàu hỏa',
        icon: '🚂',
        soundText: 'Tu tu xình xịch',
        questionText: 'Tàu hỏa đâu?',
        soundQuestionText: 'Đoàn tàu dài tu tu xình xịch chạy trên đường ray ở đâu?',
        imitationPrompt: 'Con nói: Tàu hỏa',
        imageUrl: getAssetUrl('train'),
        bgColor: '#FCE7F3',
        colorName: 'pink'
      }
    ]
  },

  // 5. ĐỒ DÙNG TRONG NHÀ (Household Objects) - 6 items
  {
    id: 'objects',
    name: 'Đồ dùng trong nhà',
    icon: '🪑',
    description: 'Bé nhận biết các đồ vật quen thuộc trong phòng học & gia đình',
    color: '#F1F5F9',
    items: [
      {
        id: 'chair',
        name: 'Ghế',
        icon: '🪑',
        soundText: 'Bé ngồi ngoan',
        questionText: 'Cái ghế đâu?',
        soundQuestionText: 'Đồ dùng để bé ngồi ăn cơm và ngồi học ở đâu nào?',
        imitationPrompt: 'Con nói: Cái ghế',
        imageUrl: getAssetUrl('chair'),
        bgColor: '#FEF3C7',
        colorName: 'amber'
      },
      {
        id: 'table',
        name: 'Bàn',
        icon: '🪵',
        soundText: 'Bày sách đồ chơi',
        questionText: 'Cái bàn đâu?',
        soundQuestionText: 'Cái bàn để tập vẽ và xếp đồ chơi ở đâu con nhỉ?',
        imitationPrompt: 'Con nói: Cái bàn',
        imageUrl: getAssetUrl('table'),
        bgColor: '#FFEDD5',
        colorName: 'orange'
      },
      {
        id: 'cup',
        name: 'Ly',
        icon: '🥛',
        soundText: 'Bé uống nước ngoan',
        questionText: 'Cái ly đâu?',
        soundQuestionText: 'Cái ly để bé uống nước và uống sữa ở đâu nào?',
        imitationPrompt: 'Con nói: Cái ly',
        imageUrl: getAssetUrl('cup'),
        bgColor: '#E0F2FE',
        colorName: 'sky'
      },
      {
        id: 'spoon',
        name: 'Muỗng',
        icon: '🥄',
        soundText: 'Xúc cơm ngon miệng',
        questionText: 'Cái muỗng đâu?',
        soundQuestionText: 'Cái muỗng nhỏ xinh để bé xúc cháo ở đâu?',
        imitationPrompt: 'Con nói: Cái muỗng',
        imageUrl: getAssetUrl('spoon'),
        bgColor: '#F1F5F9',
        colorName: 'slate'
      },
      {
        id: 'bed',
        name: 'Giường',
        icon: '🛏️',
        soundText: 'Êm ái bé ngủ say',
        questionText: 'Cái giường đâu?',
        soundQuestionText: 'Chiếc giường êm ái bé nằm ngủ trưa ở đâu nào?',
        imitationPrompt: 'Con nói: Cái giường',
        imageUrl: getAssetUrl('bed'),
        bgColor: '#FEF9C3',
        colorName: 'yellow'
      },
      {
        id: 'fan',
        name: 'Quạt',
        icon: '🌀',
        soundText: 'Quay vù vù mát rượi',
        questionText: 'Cái quạt đâu?',
        soundQuestionText: 'Cái quạt quay vù vù thổi gió mát cho bé ở đâu?',
        imitationPrompt: 'Con nói: Cái quạt',
        imageUrl: getAssetUrl('fan'),
        bgColor: '#DCFCE7',
        colorName: 'green'
      }
    ]
  },

  // 6. GIA ĐÌNH (Family) - 6 items
  {
    id: 'family',
    name: 'Gia đình',
    icon: '👨‍👩‍👧',
    description: 'Bé nhận biết những người thân yêu trong gia đình',
    color: '#FCE7F3',
    items: [
      {
        id: 'dad',
        name: 'Bố',
        icon: '👨',
        soundText: 'Bố yêu bé',
        questionText: 'Bố đâu?',
        soundQuestionText: 'Bố yêu thương cõng bé đi dạo ở đâu nào?',
        imitationPrompt: 'Con nói: Bố',
        imageUrl: getAssetUrl('dad'),
        bgColor: '#E0F2FE',
        colorName: 'blue'
      },
      {
        id: 'mom',
        name: 'Mẹ',
        icon: '👩',
        soundText: 'Mẹ ôm ấm áp',
        questionText: 'Mẹ đâu?',
        soundQuestionText: 'Mẹ hiền nấu cơm ngon và ru bé ngủ ở đâu nhỉ?',
        imitationPrompt: 'Con nói: Mẹ',
        imageUrl: getAssetUrl('mom'),
        bgColor: '#FCE7F3',
        colorName: 'pink'
      },
      {
        id: 'baby',
        name: 'Bé',
        icon: '👶',
        soundText: 'Bé cười tươi',
        questionText: 'Em bé đâu?',
        soundQuestionText: 'Em bé ngoan cười xinh xắn ở đâu nào?',
        imitationPrompt: 'Con nói: Em bé',
        imageUrl: getAssetUrl('baby'),
        bgColor: '#FEF9C3',
        colorName: 'yellow'
      },
      {
        id: 'grandfather',
        name: 'Ông',
        icon: '👴',
        soundText: 'Ông kể chuyện vui',
        questionText: 'Ông đâu?',
        soundQuestionText: 'Ông tóc bạc đeo kính kể chuyện cổ tích ở đâu?',
        imitationPrompt: 'Con nói: Ông',
        imageUrl: getAssetUrl('grandfather'),
        bgColor: '#DCFCE7',
        colorName: 'green'
      },
      {
        id: 'grandmother',
        name: 'Bà',
        icon: '👵',
        soundText: 'Bà quạt mát dịu dàng',
        questionText: 'Bà đâu?',
        soundQuestionText: 'Bà bế ẵm và khen bé ngoan ở đâu con nhỉ?',
        imitationPrompt: 'Con nói: Bà',
        imageUrl: getAssetUrl('grandmother'),
        bgColor: '#F3E8FF',
        colorName: 'purple'
      },
      {
        id: 'sister',
        name: 'Chị',
        icon: '👧',
        soundText: 'Chị múa hát cùng bé',
        questionText: 'Chị đâu?',
        soundQuestionText: 'Chị gái cài nơ xinh chơi đồ chơi cùng bé ở đâu?',
        imitationPrompt: 'Con nói: Chị',
        imageUrl: getAssetUrl('sister'),
        bgColor: '#FEE2E2',
        colorName: 'red'
      }
    ]
  },

  // 7. CƠ THỂ (Body) - 6 items
  {
    id: 'body',
    name: 'Cơ thể',
    icon: '👀',
    description: 'Bé nhận biết và gọi tên các bộ phận trên cơ thể mình',
    color: '#EDE9FE',
    items: [
      {
        id: 'eyes',
        name: 'Mắt',
        icon: '👀',
        soundText: 'Chớp chớp nhìn xung quanh',
        questionText: 'Đôi mắt đâu?',
        soundQuestionText: 'Đôi mắt sáng tinh anh để bé nhìn cô và bạn ở đâu?',
        imitationPrompt: 'Con nói: Mắt',
        imageUrl: getAssetUrl('eyes'),
        bgColor: '#E0F2FE',
        colorName: 'sky'
      },
      {
        id: 'nose',
        name: 'Mũi',
        icon: '👃',
        soundText: 'Hít hà thơm ngát',
        questionText: 'Cái mũi đâu?',
        soundQuestionText: 'Cái mũi xinh để ngửi hương hoa thơm ở đâu nào?',
        imitationPrompt: 'Con nói: Mũi',
        imageUrl: getAssetUrl('nose'),
        bgColor: '#FFEDD5',
        colorName: 'orange'
      },
      {
        id: 'mouth',
        name: 'Miệng',
        icon: '👄',
        soundText: 'Cười xinh nói ngoan',
        questionText: 'Cái miệng đâu?',
        soundQuestionText: 'Cái miệng xinh cười tươi hát hay ở đâu nhỉ?',
        imitationPrompt: 'Con nói: Miệng',
        imageUrl: getAssetUrl('mouth'),
        bgColor: '#FEE2E2',
        colorName: 'red'
      },
      {
        id: 'ear',
        name: 'Tai',
        icon: '👂',
        soundText: 'Lắng tai nghe lời cô',
        questionText: 'Cái tai đâu?',
        soundQuestionText: 'Đôi tai nhỏ lắng nghe tiếng nhạc vui ở đâu nào?',
        imitationPrompt: 'Con nói: Tai',
        imageUrl: getAssetUrl('ear'),
        bgColor: '#FEF3C7',
        colorName: 'amber'
      },
      {
        id: 'hand',
        name: 'Tay',
        icon: '✋',
        soundText: 'Bàn tay vỗ đều',
        questionText: 'Bàn tay đâu?',
        soundQuestionText: 'Bàn tay khéo léo vỗ tay hoan hô ở đâu con?',
        imitationPrompt: 'Con nói: Tay',
        imageUrl: getAssetUrl('hand'),
        bgColor: '#FEF9C3',
        colorName: 'yellow'
      },
      {
        id: 'foot',
        name: 'Chân',
        icon: '🦶',
        soundText: 'Bước đi tung tăng',
        questionText: 'Bàn chân đâu?',
        soundQuestionText: 'Đôi chân bước đi tung tăng đến trường ở đâu nào?',
        imitationPrompt: 'Con nói: Chân',
        imageUrl: getAssetUrl('foot'),
        bgColor: '#DCFCE7',
        colorName: 'green'
      }
    ]
  },

  // 8. ÂM THANH QUEN THUỘC (Sounds) - 6 items
  {
    id: 'sounds',
    name: 'Âm thanh quen thuộc',
    icon: '⏰',
    description: 'Bé rèn luyện phản xạ thính giác với âm thanh đời sống',
    color: '#FEF9C3',
    items: [
      {
        id: 'clock',
        name: 'Đồng hồ',
        icon: '⏰',
        soundText: 'Tích tắc tích tắc',
        questionText: 'Đồng hồ tích tắc đâu?',
        soundQuestionText: 'Cái gì kêu tích tắc tích tắc chỉ giờ đi học?',
        imitationPrompt: 'Con nói: Tích tắc',
        imageUrl: getAssetUrl('clock'),
        bgColor: '#FEF9C3',
        colorName: 'yellow'
      },
      {
        id: 'doorbell',
        name: 'Chuông cửa',
        icon: '🔔',
        soundText: 'Kính coong kính coong',
        questionText: 'Chuông cửa đâu?',
        soundQuestionText: 'Chuông gì kêu kính coong khi có khách đến nhà?',
        imitationPrompt: 'Con nói: Kính coong',
        imageUrl: getAssetUrl('doorbell'),
        bgColor: '#E0F2FE',
        colorName: 'blue'
      },
      {
        id: 'horn',
        name: 'Còi xe',
        icon: '📢',
        soundText: 'Bíp bíp bíp',
        questionText: 'Còi xe bíp bíp đâu?',
        soundQuestionText: 'Cái còi bóp kêu bíp bíp to rõ ràng ở đâu nào?',
        imitationPrompt: 'Con nói: Bíp bíp',
        imageUrl: getAssetUrl('horn'),
        bgColor: '#FEE2E2',
        colorName: 'red'
      },
      {
        id: 'rain',
        name: 'Mưa rơi',
        icon: '🌧️',
        soundText: 'Tí tách tí tách',
        questionText: 'Mưa rơi tí tách đâu?',
        soundQuestionText: 'Tiếng gì rơi tí tách tí tách mát lành từ trời?',
        imitationPrompt: 'Con nói: Tí tách',
        imageUrl: getAssetUrl('rain'),
        bgColor: '#E0F2FE',
        colorName: 'sky'
      },
      {
        id: 'drum',
        name: 'Trống',
        icon: '🥁',
        soundText: 'Tùng tùng tùng',
        questionText: 'Cái trống tùng tùng đâu?',
        soundQuestionText: 'Cái trống trường gõ tùng tùng tùng vang dội ở đâu?',
        imitationPrompt: 'Con nói: Tùng tùng',
        imageUrl: getAssetUrl('drum'),
        bgColor: '#FEE2E2',
        colorName: 'red'
      },
      {
        id: 'bird',
        name: 'Chim hót',
        icon: '🐦',
        soundText: 'Líu lo líu lo',
        questionText: 'Chú chim líu lo đâu?',
        soundQuestionText: 'Bạn chim nhỏ đậu cành cây hót líu lo ở đâu nhỉ?',
        imitationPrompt: 'Con nói: Líu lo',
        imageUrl: getAssetUrl('bird'),
        bgColor: '#DCFCE7',
        colorName: 'green'
      }
    ]
  }
];

export function getTopicById(topicId: string): TopicCategory {
  return TOPIC_CATEGORIES.find((t) => t.id === topicId) || TOPIC_CATEGORIES[0];
}

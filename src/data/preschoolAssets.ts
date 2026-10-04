import { svgToDataUrl, ILLUSTRATIONS } from './illustrations.ts';

const SPECIAL_SVGS: Record<string, string> = {
  teddy_bear: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Ears -->
    <circle cx="50" cy="55" r="25" fill="#B45309" />
    <circle cx="50" cy="55" r="14" fill="#FDE68A" />
    <circle cx="150" cy="55" r="25" fill="#B45309" />
    <circle cx="150" cy="55" r="14" fill="#FDE68A" />
    <!-- Head -->
    <circle cx="100" cy="105" r="62" fill="#D97706" />
    <!-- Muzzle -->
    <ellipse cx="100" cy="120" rx="28" ry="20" fill="#FDE68A" />
    <polygon points="100,116 92,108 108,108" fill="#451A03" />
    <path d="M100 116 L100 125" stroke="#451A03" stroke-width="3" stroke-linecap="round"/>
    <path d="M92 125 Q100 132 108 125" stroke="#451A03" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Eyes -->
    <circle cx="75" cy="95" r="7" fill="#1E293B" />
    <circle cx="78" cy="92" r="2.5" fill="#FFFFFF" />
    <circle cx="125" cy="95" r="7" fill="#1E293B" />
    <circle cx="128" cy="92" r="2.5" fill="#FFFFFF" />
    <!-- Cheeks -->
    <circle cx="62" cy="115" r="9" fill="#F87171" opacity="0.45" />
    <circle cx="138" cy="115" r="9" fill="#F87171" opacity="0.45" />
    <!-- Bow -->
    <path d="M90 165 L100 172 L110 165 L110 178 L100 172 L90 178 Z" fill="#EF4444" />
  </svg>`,

  teacher: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Hair -->
    <ellipse cx="100" cy="95" rx="55" ry="52" fill="#334155" />
    <rect x="52" y="90" width="96" height="55" rx="14" fill="#334155" />
    <!-- Face -->
    <ellipse cx="100" cy="108" rx="42" ry="44" fill="#FED7AA" />
    <!-- Smile & Eyes -->
    <circle cx="82" cy="104" r="5" fill="#1E293B" />
    <circle cx="118" cy="104" r="5" fill="#1E293B" />
    <ellipse cx="72" cy="115" rx="8" ry="5" fill="#FB7185" opacity="0.45" />
    <ellipse cx="128" cy="115" rx="8" ry="5" fill="#FB7185" opacity="0.45" />
    <path d="M92 122 Q100 130 108 122" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Yellow Teacher Ao Dai collar -->
    <path d="M65 152 Q100 142 135 152 L145 190 L55 190 Z" fill="#F59E0B" />
    <line x1="100" y1="145" x2="100" y2="190" stroke="#B45309" stroke-width="2"/>
    <!-- Heart flower pin -->
    <circle cx="80" cy="165" r="6" fill="#EF4444" />
  </svg>`,

  eat_bowl: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Bowl -->
    <path d="M40 95 C45 155, 155 155, 160 95 Z" fill="#F59E0B" stroke="#D97706" stroke-width="4"/>
    <ellipse cx="100" cy="95" rx="60" ry="16" fill="#FEF08A" stroke="#D97706" stroke-width="3"/>
    <ellipse cx="100" cy="95" rx="48" ry="11" fill="#FFFFFF" />
    <!-- Steaming delicious food -->
    <path d="M85 75 Q90 65 85 55" stroke="#F97316" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M100 70 Q105 60 100 50" stroke="#F97316" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M115 75 Q120 65 115 55" stroke="#F97316" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Spoon sticking out -->
    <line x1="130" y1="95" x2="165" y2="55" stroke="#94A3B8" stroke-width="8" stroke-linecap="round"/>
  </svg>`,

  drink_milk: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Cup -->
    <path d="M60 65 L70 155 C72 165, 82 172, 92 172 L108 172 C118 172, 128 165, 130 155 L140 65 Z" fill="#38BDF8" stroke="#0284C7" stroke-width="4"/>
    <ellipse cx="100" cy="65" rx="40" ry="12" fill="#BAE6FD" stroke="#0284C7" stroke-width="3"/>
    <ellipse cx="100" cy="65" rx="32" ry="8" fill="#FFFFFF" />
    <!-- Cute Cow Pattern or Heart -->
    <path d="M100 115 C95 105, 85 110, 85 120 C85 130, 100 138, 100 138 C100 138, 115 130, 115 120 C115 110, 105 105, 100 115 Z" fill="#EF4444" />
    <!-- Straw -->
    <line x1="90" y1="70" x2="125" y2="25" stroke="#F43F5E" stroke-width="7" stroke-linecap="round"/>
    <line x1="125" y1="25" x2="140" y2="35" stroke="#F43F5E" stroke-width="7" stroke-linecap="round"/>
  </svg>`,

  clap_hands_fun: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Left Hand -->
    <ellipse cx="75" cy="100" rx="30" ry="45" transform="rotate(25 75 100)" fill="#FED7AA" stroke="#F97316" stroke-width="4"/>
    <!-- Right Hand -->
    <ellipse cx="125" cy="100" rx="30" ry="45" transform="rotate(-25 125 100)" fill="#FED7AA" stroke="#F97316" stroke-width="4"/>
    <!-- Clapping Sparks -->
    <polygon points="100,50 104,65 118,65 106,75 110,90 100,80 90,90 94,75 82,65 96,65" fill="#FACC15" />
    <circle cx="100" cy="40" r="4" fill="#F59E0B" />
    <circle cx="65" cy="55" r="3.5" fill="#F59E0B" />
    <circle cx="135" cy="55" r="3.5" fill="#F59E0B" />
    <text x="75" y="175" font-size="28" font-weight="900" fill="#EA580C">👏 👏</text>
  </svg>`,

  raise_hands_fun: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Baby head -->
    <ellipse cx="100" cy="115" rx="38" ry="36" fill="#FED7AA" stroke="#FB923C" stroke-width="3"/>
    <circle cx="88" cy="112" r="4" fill="#1E293B" />
    <circle cx="112" cy="112" r="4" fill="#1E293B" />
    <path d="M94 125 Q100 132 106 125" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Raised Arms -->
    <path d="M65 140 L45 80 L30 65" stroke="#FED7AA" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M135 140 L155 80 L170 65" stroke="#FED7AA" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Sparkles on hands -->
    <text x="20" y="55" font-size="24">✨</text>
    <text x="155" y="55" font-size="24">✨</text>
    <path d="M68 152 Q100 142 132 152 L140 190 L60 190 Z" fill="#3B82F6" />
  </svg>`,

  head_point: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Big cute head -->
    <circle cx="100" cy="100" r="62" fill="#FED7AA" stroke="#FB923C" stroke-width="4"/>
    <!-- Hair cap -->
    <path d="M42 90 C45 45, 155 45, 158 90 C140 70, 60 70, 42 90 Z" fill="#451A03" />
    <!-- Happy eyes & smile -->
    <circle cx="78" cy="105" r="5" fill="#1E293B" />
    <circle cx="122" cy="105" r="5" fill="#1E293B" />
    <path d="M92 124 Q100 132 108 124" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
    <circle cx="68" cy="116" r="8" fill="#F87171" opacity="0.5"/>
    <circle cx="132" cy="116" r="8" fill="#F87171" opacity="0.5"/>
    <!-- Pointer sparkles pointing at head -->
    <polygon points="100,20 108,35 92,35" fill="#EF4444" />
    <text x="88" y="16" font-size="16" font-weight="900" fill="#EF4444">ĐÂY</text>
  </svg>`,

  wave_goodbye: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Baby Face -->
    <ellipse cx="90" cy="115" rx="38" ry="38" fill="#FED7AA" stroke="#FB923C" stroke-width="3"/>
    <circle cx="78" cy="112" r="4.5" fill="#1E293B" />
    <circle cx="102" cy="112" r="4.5" fill="#1E293B" />
    <path d="M84 126 Q90 134 96 126" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Waving hand -->
    <path d="M125 135 L145 95 L160 85" stroke="#FED7AA" stroke-width="12" stroke-linecap="round"/>
    <circle cx="165" cy="75" r="14" fill="#FED7AA" stroke="#FB923C" stroke-width="3"/>
    <!-- Motion lines -->
    <path d="M175 60 Q185 75 175 90" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M185 55 Q195 75 185 95" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" fill="none"/>
    <text x="140" y="165" font-size="24">👋</text>
  </svg>`,

  music_notes: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Big joyful colorful music note -->
    <circle cx="70" cy="135" r="24" fill="#EC4899" />
    <circle cx="140" cy="115" r="24" fill="#8B5CF6" />
    <rect x="86" y="50" width="8" height="85" fill="#1E293B" />
    <rect x="156" y="30" width="8" height="85" fill="#1E293B" />
    <polygon points="86,50 164,30 164,48 86,68" fill="#3B82F6" />
    <!-- Floating stars and notes -->
    <text x="30" y="70" font-size="28">🎶</text>
    <text x="140" y="80" font-size="28">✨</text>
    <text x="95" y="180" font-size="24">🎵</text>
  </svg>`,

  stand_up_pose: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Baby standing tall and proud -->
    <circle cx="100" cy="55" r="28" fill="#FED7AA" stroke="#FB923C" stroke-width="3"/>
    <circle cx="92" cy="52" r="3.5" fill="#1E293B" />
    <circle cx="108" cy="52" r="3.5" fill="#1E293B" />
    <path d="M96 62 Q100 68 104 62" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <!-- Body -->
    <rect x="80" y="85" width="40" height="50" rx="10" fill="#3B82F6" />
    <!-- Arms out for balance -->
    <line x1="80" y1="95" x2="45" y2="105" stroke="#FED7AA" stroke-width="8" stroke-linecap="round"/>
    <line x1="120" y1="95" x2="155" y2="105" stroke="#FED7AA" stroke-width="8" stroke-linecap="round"/>
    <!-- Legs standing -->
    <line x1="90" y1="135" x2="90" y2="175" stroke="#1E293B" stroke-width="10" stroke-linecap="round"/>
    <line x1="110" y1="135" x2="110" y2="175" stroke="#1E293B" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="85" cy="180" rx="12" ry="6" fill="#EF4444" />
    <ellipse cx="115" cy="180" rx="12" ry="6" fill="#EF4444" />
  </svg>`,

  sit_down_pose: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Sitting on comfortable soft mat -->
    <ellipse cx="100" cy="170" rx="70" ry="18" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/>
    <!-- Baby sitting -->
    <circle cx="100" cy="75" r="28" fill="#FED7AA" stroke="#FB923C" stroke-width="3"/>
    <circle cx="92" cy="72" r="3.5" fill="#1E293B" />
    <circle cx="108" cy="72" r="3.5" fill="#1E293B" />
    <path d="M96 82 Q100 88 104 82" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <rect x="80" y="105" width="40" height="42" rx="10" fill="#F59E0B" />
    <!-- Folded legs sitting nicely -->
    <ellipse cx="75" cy="150" rx="18" ry="10" fill="#1E293B" />
    <ellipse cx="125" cy="150" rx="18" ry="10" fill="#1E293B" />
  </svg>`,

  tidy_toys_box: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Toy Box -->
    <rect x="40" y="90" width="120" height="80" rx="12" fill="#FBBF24" stroke="#D97706" stroke-width="4"/>
    <rect x="35" y="80" width="130" height="18" rx="6" fill="#F59E0B" />
    <!-- Toys inside: Ball and Bear poking out -->
    <circle cx="75" cy="75" r="20" fill="#EF4444" />
    <circle cx="125" cy="70" r="18" fill="#B45309" />
    <circle cx="115" cy="55" r="7" fill="#B45309" />
    <circle cx="135" cy="55" r="7" fill="#B45309" />
    <!-- Star on the box -->
    <polygon points="100,120 105,130 116,132 108,140 110,150 100,145 90,150 92,140 84,132 95,130" fill="#FFFFFF" />
  </svg>`,

  share_toy: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Two baby faces smiling and sharing -->
    <circle cx="55" cy="95" r="26" fill="#FED7AA" stroke="#FB923C" stroke-width="2.5"/>
    <circle cx="145" cy="95" r="26" fill="#FED7AA" stroke="#FB923C" stroke-width="2.5"/>
    <!-- Smiling eyes -->
    <circle cx="48" cy="92" r="3" fill="#1E293B" />
    <circle cx="62" cy="92" r="3" fill="#1E293B" />
    <circle cx="138" cy="92" r="3" fill="#1E293B" />
    <circle cx="152" cy="92" r="3" fill="#1E293B" />
    <!-- Sharing toy car in middle -->
    <rect x="85" y="115" width="30" height="18" rx="6" fill="#EF4444" />
    <circle cx="92" cy="133" r="6" fill="#1E293B" />
    <circle cx="108" cy="133" r="6" fill="#1E293B" />
    <!-- Hands holding toy together -->
    <path d="M55 125 L85 125" stroke="#FED7AA" stroke-width="8" stroke-linecap="round"/>
    <path d="M145 125 L115 125" stroke="#FED7AA" stroke-width="8" stroke-linecap="round"/>
    <text x="88" y="80" font-size="26">💖</text>
  </svg>`
};

export function getPreschoolAsset(keyOrName: string): string {
  const lower = (keyOrName || '').toLowerCase().trim();

  // Direct special match
  if (SPECIAL_SVGS[lower]) return svgToDataUrl(SPECIAL_SVGS[lower]);

  // Direct illustration match
  if (ILLUSTRATIONS[lower]) return svgToDataUrl(ILLUSTRATIONS[lower]);

  // Keyword mappings
  if (lower.includes('gấu') || lower.includes('bear')) return svgToDataUrl(SPECIAL_SVGS.teddy_bear);
  if (lower.includes('cô giáo') || lower.includes('chào cô') || lower.includes('cô')) return svgToDataUrl(SPECIAL_SVGS.teacher);
  if (lower.includes('ăn') || lower.includes('bát') || lower.includes('cháo')) return svgToDataUrl(SPECIAL_SVGS.eat_bowl);
  if (lower.includes('uống') || lower.includes('sữa') || lower.includes('nước')) return svgToDataUrl(SPECIAL_SVGS.drink_milk);
  if (lower.includes('vỗ tay') || lower.includes('clap')) return svgToDataUrl(SPECIAL_SVGS.clap_hands_fun);
  if (lower.includes('giơ tay') || lower.includes('raise')) return svgToDataUrl(SPECIAL_SVGS.raise_hands_fun);
  if (lower.includes('đầu') || lower.includes('head')) return svgToDataUrl(SPECIAL_SVGS.head_point);
  if (lower.includes('vẫy tay') || lower.includes('tạm biệt') || lower.includes('wave')) return svgToDataUrl(SPECIAL_SVGS.wave_goodbye);
  if (lower.includes('nhạc') || lower.includes('lắc lư') || lower.includes('hát') || lower.includes('music')) return svgToDataUrl(SPECIAL_SVGS.music_notes);
  if (lower.includes('đứng lên') || lower.includes('stand')) return svgToDataUrl(SPECIAL_SVGS.stand_up_pose);
  if (lower.includes('ngồi') || lower.includes('sit')) return svgToDataUrl(SPECIAL_SVGS.sit_down_pose);
  if (lower.includes('cất đồ') || lower.includes('hộp') || lower.includes('tidy')) return svgToDataUrl(SPECIAL_SVGS.tidy_toys_box);
  if (lower.includes('bạn') || lower.includes('chia sẻ') || lower.includes('share')) return svgToDataUrl(SPECIAL_SVGS.share_toy);

  // Core items from illustrations
  if (lower.includes('mèo') || lower.includes('cat')) return svgToDataUrl(ILLUSTRATIONS.cat);
  if (lower.includes('chó') || lower.includes('dog')) return svgToDataUrl(ILLUSTRATIONS.dog);
  if (lower.includes('gà') || lower.includes('chicken')) return svgToDataUrl(ILLUSTRATIONS.chicken);
  if (lower.includes('vịt') || lower.includes('duck')) return svgToDataUrl(ILLUSTRATIONS.duck);
  if (lower.includes('bò') || lower.includes('cow')) return svgToDataUrl(ILLUSTRATIONS.cow);
  if (lower.includes('táo') || lower.includes('apple')) return svgToDataUrl(ILLUSTRATIONS.apple);
  if (lower.includes('chuối') || lower.includes('banana')) return svgToDataUrl(ILLUSTRATIONS.banana);
  if (lower.includes('cam') || lower.includes('orange')) return svgToDataUrl(ILLUSTRATIONS.orange);
  if (lower.includes('dưa') || lower.includes('watermelon')) return svgToDataUrl(ILLUSTRATIONS.watermelon);
  if (lower.includes('cà chua') || lower.includes('tomato')) return svgToDataUrl(ILLUSTRATIONS.tomato);
  if (lower.includes('cà rốt') || lower.includes('carrot')) return svgToDataUrl(ILLUSTRATIONS.carrot);
  if (lower.includes('bóng') || lower.includes('ball')) return svgToDataUrl(ILLUSTRATIONS.ball);
  if (lower.includes('hoa') || lower.includes('flower')) return svgToDataUrl(ILLUSTRATIONS.flower);
  if (lower.includes('ô tô') || lower.includes('xe') || lower.includes('car')) return svgToDataUrl(ILLUSTRATIONS.car);
  if (lower.includes('tàu') || lower.includes('train')) return svgToDataUrl(ILLUSTRATIONS.train);
  if (lower.includes('mặt trời') || lower.includes('sun')) return svgToDataUrl(ILLUSTRATIONS.sun);

  // Default friendly asset
  return svgToDataUrl(ILLUSTRATIONS.star);
}

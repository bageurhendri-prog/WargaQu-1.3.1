import React from 'react';

export type ModuleId =
  | 'kasirqu'
  | 'chatqu'
  | 'muamalahqu'
  | 'paguyubanqu'
  | 'areaqu'
  | 'siagaqu'
  | string;

export interface ModuleIconProps {
  moduleId: ModuleId;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  variant?: 'bare' | 'badge' | 'card';
}

/**
 * 1. KASIRQU ICON
 * Modern POS cash register with receipt paper & display screen.
 * Styled matching the provided KasirQu brand logo (Attachment 1).
 */
export const KasirQuIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="KasirQu POS Cash Register Icon"
  >
    <defs>
      <linearGradient id="kq_body" x1="10" y1="28" x2="54" y2="58" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#14B8A6" />
        <stop offset="60%" stopColor="#0F766E" />
        <stop offset="100%" stopColor="#042F2E" />
      </linearGradient>
      <linearGradient id="kq_screen" x1="32" y1="8" x2="54" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2DD4BF" />
        <stop offset="100%" stopColor="#0F766E" />
      </linearGradient>
    </defs>

    {/* Receipt Paper (Top Left) */}
    <path
      d="M17 12V24H27V12L24.5 14L22 12L19.5 14L17 12Z"
      fill="#F8FAFC"
      stroke="#CBD5E1"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <line x1="19.5" y1="16" x2="24.5" y2="16" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="19.5" y1="19.5" x2="23.5" y2="19.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

    {/* Cash Register Screen Display (Top Right) */}
    <rect x="36" y="8" width="18" height="13" rx="3" fill="url(#kq_screen)" stroke="#5EEAD4" strokeWidth="1.8" />
    <circle cx="45" cy="14.5" r="3" fill="none" stroke="#FFFFFF" strokeWidth="1.4" />
    <line x1="46.5" y1="16" x2="48.5" y2="18" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
    {/* Screen Stand */}
    <rect x="43" y="21" width="4" height="6" fill="#0F766E" stroke="#134E4A" strokeWidth="1" />

    {/* POS Trapezoid Base Body */}
    <path
      d="M14 27C12.8 27 11.8 27.9 11.6 29.1L8.2 49.5C8 50.8 9 52 10.3 52H53.7C55 52 56 50.8 55.8 49.5L52.4 29.1C52.2 27.9 51.2 27 50 27H14Z"
      fill="url(#kq_body)"
      stroke="#5EEAD4"
      strokeWidth="2"
      strokeLinejoin="round"
    />

    {/* Customer Facing Sub-Display / Badge on Main Body */}
    <rect x="36" y="32" width="13" height="7" rx="1.5" fill="#042F2E" stroke="#2DD4BF" strokeWidth="1.2" />
    <line x1="39" y1="35.5" x2="46" y2="35.5" stroke="#5EEAD4" strokeWidth="1.2" strokeLinecap="round" />

    {/* Keypad Grid (Left on Body) */}
    <rect x="16" y="32" width="4.5" height="3" rx="0.8" fill="#5EEAD4" />
    <rect x="22.5" y="32" width="4.5" height="3" rx="0.8" fill="#5EEAD4" />
    <rect x="29" y="32" width="4.5" height="3" rx="0.8" fill="#5EEAD4" />

    <rect x="16" y="37.5" width="4.5" height="3" rx="0.8" fill="#5EEAD4" />
    <rect x="22.5" y="37.5" width="4.5" height="3" rx="0.8" fill="#5EEAD4" />
    <rect x="29" y="37.5" width="4.5" height="3" rx="0.8" fill="#5EEAD4" />

    <rect x="16" y="43" width="4.5" height="3" rx="0.8" fill="#5EEAD4" />
    <rect x="22.5" y="43" width="4.5" height="3" rx="0.8" fill="#5EEAD4" />
    <rect x="29" y="43" width="4.5" height="3" rx="0.8" fill="#5EEAD4" />

    {/* Cash Drawer Line & Lock Slot */}
    <line x1="10" y1="48" x2="54" y2="48" stroke="#042F2E" strokeWidth="1.8" />
    <circle cx="32" cy="50" r="1.2" fill="#5EEAD4" />
  </svg>
);

/**
 * 2. CHATQU ICON
 * Circular speech bubble with 'Q' in the center.
 * Styled matching the exact ChatQu logo from Attachment 1.
 */
export const ChatQuIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="ChatQu Q Speech Bubble Icon"
  >
    <defs>
      <linearGradient id="cq_grad" x1="12" y1="8" x2="52" y2="54" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#14B8A6" />
        <stop offset="50%" stopColor="#0F766E" />
        <stop offset="100%" stopColor="#042F2E" />
      </linearGradient>
    </defs>

    {/* Main Speech Bubble Body with Pointer Tail at Bottom-Left */}
    <path
      d="M32 8C19 8 8.5 18.5 8.5 31.5C8.5 37.2 10.6 42.5 14.2 46.5L10 56C9.6 57 10.7 57.8 11.5 57.2L22.2 51.5C25.2 53.7 28.5 55 32 55C45 55 55.5 44.5 55.5 31.5C55.5 18.5 45 8 32 8Z"
      fill="url(#cq_grad)"
      stroke="#5EEAD4"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />

    {/* Bold Modern 'Q' Emblem Centered Inside */}
    <circle
      cx="32"
      cy="29"
      r="9.5"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="4.2"
    />
    <path
      d="M36.5 33.5L42.5 39.5"
      stroke="#FFFFFF"
      strokeWidth="4.2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * 3. MUAMALAHQU ICON
 * Shopping trolley with 'Q' emblem inside the basket.
 * Styled matching the exact MuamalahQu logo from Attachment 1.
 */
export const MuamalahQuIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="MuamalahQu Shopping Cart & Q Icon"
  >
    <defs>
      <linearGradient id="mq_grad" x1="14" y1="14" x2="54" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#14B8A6" />
        <stop offset="60%" stopColor="#0F766E" />
        <stop offset="100%" stopColor="#042F2E" />
      </linearGradient>
    </defs>

    {/* Trolley Frame & Handle */}
    <path
      d="M8 14H15L18.5 24H54L49.5 40H22L17.5 18"
      stroke="#5EEAD4"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Solid Cart Basket Fill */}
    <path
      d="M19 25H52.5L48.5 39.5H22.5L19 25Z"
      fill="url(#mq_grad)"
    />

    {/* Centered 'Q' Emblem Inside Basket */}
    <circle
      cx="35"
      cy="32"
      r="5.5"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2.6"
    />
    <path
      d="M37.8 34.8L41.5 38.5"
      stroke="#FFFFFF"
      strokeWidth="2.6"
      strokeLinecap="round"
    />

    {/* Wheel Left */}
    <circle cx="25" cy="48" r="4" fill="#0F766E" stroke="#5EEAD4" strokeWidth="2.4" />
    <circle cx="25" cy="48" r="1.5" fill="#FFFFFF" />

    {/* Wheel Right */}
    <circle cx="45" cy="48" r="4" fill="#0F766E" stroke="#5EEAD4" strokeWidth="2.4" />
    <circle cx="45" cy="48" r="1.5" fill="#FFFFFF" />
  </svg>
);

/**
 * 4. PAGUYUBANQU / RTQU ICON
 * Connected community figures in a circle / arch formation.
 * Styled matching the exact PaguyubanQu logo from Attachment 2.
 */
export const PaguyubanQuIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="PaguyubanQu Community Formation Icon"
  >
    <defs>
      <linearGradient id="pq_grad" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2DD4BF" />
        <stop offset="50%" stopColor="#0F766E" />
        <stop offset="100%" stopColor="#042F2E" />
      </linearGradient>
    </defs>

    {/* Top Citizen Head */}
    <circle cx="32" cy="14" r="5" fill="#2DD4BF" stroke="#5EEAD4" strokeWidth="1.5" />

    {/* Left-Upper Citizen Head */}
    <circle cx="18" cy="23" r="4.5" fill="#14B8A6" stroke="#5EEAD4" strokeWidth="1.5" />

    {/* Right-Upper Citizen Head */}
    <circle cx="46" cy="23" r="4.5" fill="#14B8A6" stroke="#5EEAD4" strokeWidth="1.5" />

    {/* Central Interlocking Body & Arms Structure forming house/paguyuban */}
    <path
      d="M32 21L42 29V46H36V34L32 30L28 34V46H22V29L32 21Z"
      fill="url(#pq_grad)"
      stroke="#5EEAD4"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />

    {/* Outer Left Person Body Arch */}
    <path
      d="M13 46V35C13 31 16 29 20 29L22 34"
      stroke="#5EEAD4"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Outer Right Person Body Arch */}
    <path
      d="M51 46V35C51 31 48 29 44 29L42 34"
      stroke="#5EEAD4"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Central Heart / Community Gateway Arch */}
    <path
      d="M26 46V38C26 35 38 35 38 38V46"
      stroke="#2DD4BF"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * 5. AREAQU ICON
 * V-shaped folded map with grid roads and foliage / navigation contours.
 * Styled matching the exact AreaQu logo from Attachment 3.
 */
export const AreaQuIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="AreaQu Territorial Map Wing Icon"
  >
    <defs>
      <linearGradient id="aq_wing1" x1="10" y1="16" x2="32" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#99F6E4" />
        <stop offset="50%" stopColor="#14B8A6" />
        <stop offset="100%" stopColor="#0F766E" />
      </linearGradient>
      <linearGradient id="aq_wing2" x1="32" y1="16" x2="54" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#5EEAD4" />
        <stop offset="50%" stopColor="#0D9488" />
        <stop offset="100%" stopColor="#042F2E" />
      </linearGradient>
    </defs>

    {/* Left Map Wing */}
    <path
      d="M32 48C28 42 16 32 10 20C17 15 25 15 32 22V48Z"
      fill="url(#aq_wing1)"
      stroke="#042F2E"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />

    {/* Right Map Wing */}
    <path
      d="M32 48C36 42 48 32 54 20C47 15 39 15 32 22V48Z"
      fill="url(#aq_wing2)"
      stroke="#042F2E"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />

    {/* Road Grid Lines (White / Teal street network) */}
    {/* Left Road Grid */}
    <path d="M14 26C19 28 26 26 31 32" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M19 20C21 28 25 36 29 44" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    <path d="M22 36C26 38 29 38 31 41" stroke="#042F2E" strokeWidth="1.5" strokeLinecap="round" />

    {/* Right Road Grid */}
    <path d="M50 26C45 28 38 26 33 32" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M45 20C43 28 39 36 35 44" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    <path d="M42 36C38 38 35 38 33 41" stroke="#042F2E" strokeWidth="1.5" strokeLinecap="round" />

    {/* Center Spine Crease */}
    <line x1="32" y1="22" x2="32" y2="48" stroke="#042F2E" strokeWidth="2.2" />
  </svg>
);

/**
 * 6. SIAGAQU ICON
 * Concentric pulsing radar signal with emergency center beacon.
 * Styled matching the exact SiagaQu logo from Attachment 4.
 */
export const SiagaQuIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="SiagaQu Concentric Emergency Signal Icon"
  >
    <defs>
      <radialGradient id="sq_core" cx="32" cy="36" r="10" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="70%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#991B1B" />
      </radialGradient>
      <radialGradient id="sq_glow" cx="32" cy="36" r="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Ambient Glow */}
    <circle cx="32" cy="36" r="26" fill="url(#sq_glow)" />

    {/* Outer Wave Arc 3 */}
    <path
      d="M14 26C18.5 17 45.5 17 50 26"
      stroke="#EF4444"
      strokeWidth="2.8"
      strokeLinecap="round"
      opacity="0.45"
    />

    {/* Mid Wave Arc 2 */}
    <path
      d="M20 30C23.5 22 40.5 22 44 30"
      stroke="#EF4444"
      strokeWidth="3.2"
      strokeLinecap="round"
      opacity="0.75"
    />

    {/* Inner Wave Arc 1 */}
    <path
      d="M25 33C27 27 37 27 39 33"
      stroke="#F87171"
      strokeWidth="3.5"
      strokeLinecap="round"
    />

    {/* Glowing Emergency Center Core Dot */}
    <circle cx="32" cy="37" r="7.5" fill="url(#sq_core)" stroke="#FFFFFF" strokeWidth="1.8" />
    <circle cx="30" cy="35" r="2" fill="#FFFFFF" opacity="0.8" />
  </svg>
);

/**
 * Unified ModuleIcon Component
 * Provides clean rendering in multiple size scales and presentation variants.
 */
export const ModuleIcon: React.FC<ModuleIconProps> = ({
  moduleId,
  size = 'md',
  className = '',
  variant = 'bare',
}) => {
  const normalizedId = moduleId.toLowerCase().trim();

  const sizeMap: Record<string, { container: string; icon: string }> = {
    xs: { container: 'w-5 h-5 rounded-md p-0.5', icon: 'w-full h-full' },
    sm: { container: 'w-7 h-7 rounded-lg p-1', icon: 'w-full h-full' },
    md: { container: 'w-10 h-10 rounded-xl p-1.5', icon: 'w-full h-full' },
    lg: { container: 'w-12 h-12 rounded-2xl p-2', icon: 'w-full h-full' },
    xl: { container: 'w-16 h-16 rounded-3xl p-2.5', icon: 'w-full h-full' },
  };

  const selectedSize = typeof size === 'string' ? sizeMap[size] || sizeMap.md : {
    container: `w-[${size}px] h-[${size}px] rounded-xl p-1.5`,
    icon: 'w-full h-full',
  };

  const renderIconGraphic = () => {
    switch (normalizedId) {
      case 'kasirqu':
        return <KasirQuIcon className={selectedSize.icon} />;
      case 'chatqu':
        return <ChatQuIcon className={selectedSize.icon} />;
      case 'muamalahqu':
        return <MuamalahQuIcon className={selectedSize.icon} />;
      case 'paguyubanqu':
      case 'rtqu':
      case 'paguyubanqu / rtqu':
        return <PaguyubanQuIcon className={selectedSize.icon} />;
      case 'areaqu':
        return <AreaQuIcon className={selectedSize.icon} />;
      case 'siagaqu':
        return <SiagaQuIcon className={selectedSize.icon} />;
      default:
        return <PaguyubanQuIcon className={selectedSize.icon} />;
    }
  };

  const getBadgeStyle = () => {
    switch (normalizedId) {
      case 'siagaqu':
        return 'bg-gradient-to-b from-red-950/80 via-stone-900 to-stone-950 border-red-500/30 text-red-400 shadow-md shadow-red-950/20';
      case 'kasirqu':
        return 'bg-gradient-to-b from-teal-950/60 via-stone-900 to-stone-950 border-teal-500/30 text-teal-300 shadow-md';
      case 'chatqu':
        return 'bg-gradient-to-b from-teal-950/60 via-stone-900 to-stone-950 border-teal-500/30 text-teal-300 shadow-md';
      case 'muamalahqu':
        return 'bg-gradient-to-b from-emerald-950/60 via-stone-900 to-stone-950 border-emerald-500/30 text-emerald-300 shadow-md';
      case 'paguyubanqu':
      case 'rtqu':
        return 'bg-gradient-to-b from-teal-950/60 via-stone-900 to-stone-950 border-teal-500/30 text-teal-300 shadow-md';
      case 'areaqu':
        return 'bg-gradient-to-b from-cyan-950/60 via-stone-900 to-stone-950 border-cyan-500/30 text-cyan-300 shadow-md';
      default:
        return 'bg-stone-850 border-stone-700/60 text-stone-200';
    }
  };

  if (variant === 'badge') {
    return (
      <div
        className={`flex items-center justify-center shrink-0 border transition-all ${getBadgeStyle()} ${selectedSize.container} ${className}`}
      >
        {renderIconGraphic()}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`flex items-center justify-center shrink-0 rounded-2xl bg-white p-2 shadow-lg border border-stone-200 overflow-hidden ${className}`}
      >
        {renderIconGraphic()}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      {renderIconGraphic()}
    </div>
  );
};

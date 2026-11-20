import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface GovernancePillar {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  location: string;
}

const GOVERNANCE_PILLARS: GovernancePillar[] = [
  {
    id: 'difc_spv',
    index: '01',
    title: 'DIFC SPV Custody',
    subtitle: 'Reg #4982 · Common Law',
    description:
      'Property titles are ring-fenced inside a DIFC Special Purpose Vehicle governed under English Common Law.',
    image: '/properties/emirates_tower_difc.jpg',
    location: 'DIFC, Dubai'
  },
  {
    id: 'dld_deeds',
    index: '02',
    title: 'DLD Freehold Deeds',
    subtitle: 'Cadastral & Makani Verified',
    description:
      'Every offering carries verifiable Dubai Land Department cadastral and Makani records you can inspect anytime.',
    image: '/properties/downtown_sky_vista.jpg',
    location: 'Downtown Dubai'
  },
  {
    id: 'friday_settlement',
    index: '03',
    title: 'Friday Settlement',
    subtitle: '12:00 PM Direct Payouts',
    description:
      'Rental yields clear every Friday at 12:00 PM directly to your investor wallet and Nigerian bank account.',
    image: '/properties/marina_bay_residences.jpg',
    location: 'Dubai Marina'
  },
  {
    id: 'escrow_ringfencing',
    index: '04',
    title: 'Escrow Ring-Fencing',
    subtitle: 'Segregated Reserve Pools',
    description:
      'Client capital and liquidity reserves are segregated from corporate operating accounts for structural protection.',
    image: '/properties/palm_azure_villa.jpg',
    location: 'Palm Jumeirah'
  },
  {
    id: 'partner_override',
    index: '05',
    title: 'Partner Override',
    subtitle: '7.5% Weekly Commission',
    description:
      'Accredited partners earn a 7.5% weekly override on Friday distributions credited to invited investors.',
    image: '/properties/creek_horizon_suites.jpg',
    location: 'Dubai Creek Harbour'
  }
];

function getCircularOffset(index: number, activeIndex: number, total: number): number {
  let diff = index - activeIndex;
  const half = total / 2;
  if (diff > half) diff -= total;
  if (diff < -half) diff += total;
  return diff;
}

export const GovernanceCarousel: React.FC = () => {
  const { isChampagne } = useTheme();
  const total = GOVERNANCE_PILLARS.length;

  // Start centered on index 2 ("Friday Settlement") so 2 cards flank each side
  const [activeIndex, setActiveIndex] = useState<number>(2);
  const [isCompactViewport, setIsCompactViewport] = useState<boolean>(false);

  // Interactive pointer / touch swipe state
  const [dragDeltaX, setDragDeltaX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const pointerStartXRef = useRef<number | null>(null);
  const didSwipeRef = useRef<boolean>(false);
  const wheelLockRef = useRef<number>(0);

  useEffect(() => {
    const checkViewport = () => {
      setIsCompactViewport(window.innerWidth < 640);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport, { passive: true });
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goTo = useCallback((idx: number) => {
    setActiveIndex(((idx % total) + total) % total);
  }, [total]);

  // Pointer & touch swipe handlers (works on mobile touch & desktop mouse drag)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only track primary button or touch
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointerStartXRef.current = e.clientX;
    didSwipeRef.current = false;
    setIsDragging(true);
    setDragDeltaX(0);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartXRef.current === null) return;
    const dx = e.clientX - pointerStartXRef.current;
    if (Math.abs(dx) > 8) {
      didSwipeRef.current = true;
    }
    // Clamp live drag follow for responsive tactile feel
    setDragDeltaX(Math.max(-140, Math.min(140, dx)));
  };

  const finishPointerDrag = () => {
    if (pointerStartXRef.current === null) return;
    const threshold = 42;
    if (dragDeltaX <= -threshold) {
      goNext();
    } else if (dragDeltaX >= threshold) {
      goPrev();
    }
    pointerStartXRef.current = null;
    setIsDragging(false);
    setDragDeltaX(0);
    // Reset swipe flag on next tick so side card clicks remain crisp
    setTimeout(() => {
      didSwipeRef.current = false;
    }, 0);
  };

  // Horizontal trackpad two-finger swipe support
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 24) {
      const now = Date.now();
      if (now - wheelLockRef.current < 360) return;
      wheelLockRef.current = now;
      if (e.deltaX > 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    }
  };

  const activePillar = GOVERNANCE_PILLARS[activeIndex];

  // Responsive spacing between fanned cards
  const step1X = isCompactViewport ? 112 : 172;
  const step2X = isCompactViewport ? 196 : 316;

  return (
    <section
      id="difc_trust_section"
      className={`w-full border-t py-14 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden ${
        isChampagne
          ? 'bg-white border-[#E6E0D6]'
          : 'bg-[#121922] border-[#222F3D]'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Centered Editorial Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-6 sm:mb-8">
          <span
            className={`text-[11px] font-semibold uppercase tracking-[0.16em] block ${
              isChampagne ? 'text-[#9A7B3E]' : 'text-[#C6A45C]'
            }`}
          >
            Fiduciary Structure
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
            Asset-Backed{' '}
            <span className={isChampagne ? 'text-[#0B7A4E]' : 'text-[#10B981]'}>
              Governance
            </span>
          </h2>
          <p className={`text-xs sm:text-sm ${isChampagne ? 'text-[#6C7885]' : 'text-[#8896A6]'}`}>
            Swipe or select a pillar to inspect how your Dubai real estate allocation is safeguarded.
          </p>
        </div>

        {/* Coverflow Stage + Prev/Next Arrows */}
        <div
          className="relative flex items-center justify-center max-w-5xl mx-auto"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          role="region"
          aria-roledescription="carousel"
          aria-label="Asset-Backed Governance Pillars"
        >
          {/* Left Circular Arrow */}
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous governance pillar"
            className={`hidden sm:flex items-center justify-center w-10 h-10 rounded-full border transition-colors cursor-pointer shrink-0 z-50 ${
              isChampagne
                ? 'bg-[#FAF8F4] hover:bg-[#F3EFE8] border-[#E6E0D6] text-[#18222B]'
                : 'bg-[#18222E] hover:bg-[#1E2B3A] border-[#2A394A] text-[#F4F1EA]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* 3D Perspective Card Stage */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishPointerDrag}
            onPointerCancel={finishPointerDrag}
            onPointerLeave={finishPointerDrag}
            onWheel={handleWheel}
            className="relative flex-1 h-[340px] sm:h-[380px] flex items-center justify-center select-none touch-pan-y cursor-grab active:cursor-grabbing"
            style={{ perspective: '1200px' }}
          >
            {GOVERNANCE_PILLARS.map((pillar, idx) => {
              const offset = getCircularOffset(idx, activeIndex, total);
              const abs = Math.abs(offset);
              const isActive = offset === 0;

              let baseX = 0;
              let scale = 1;
              let rotateY = 0;
              let opacity = 1;
              let zIndex = 40;

              if (abs === 1) {
                baseX = offset * step1X;
                scale = 0.85;
                rotateY = offset > 0 ? -13 : 13;
                opacity = 0.94;
                zIndex = 30;
              } else if (abs >= 2) {
                baseX = Math.sign(offset) * step2X;
                scale = 0.72;
                rotateY = offset > 0 ? -21 : 21;
                opacity = isCompactViewport ? 0.45 : 0.74;
                zIndex = 20;
              }

              // Subtle real-time drag feedback
              const liveX = baseX + (isDragging ? dragDeltaX * (isActive ? 0.65 : 0.45) : 0);

              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => {
                    if (didSwipeRef.current) return;
                    if (!isActive) goTo(idx);
                  }}
                  aria-label={`${pillar.title} — ${pillar.subtitle}`}
                  aria-current={isActive ? 'true' : undefined}
                  className="absolute w-[225px] sm:w-[255px] h-[300px] sm:h-[340px] rounded-2xl overflow-hidden text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7A4E]"
                  style={{
                    transform: `translate3d(${liveX}px, 0, 0) scale(${scale}) rotateY(${rotateY}deg)`,
                    opacity,
                    zIndex,
                    transition: isDragging
                      ? 'opacity 180ms ease'
                      : 'transform 460ms cubic-bezier(0.22, 1, 0.36, 1), opacity 380ms ease, box-shadow 380ms ease',
                    boxShadow: isActive
                      ? isChampagne
                        ? '0 24px 48px -18px rgba(24, 34, 43, 0.36)'
                        : '0 26px 52px -18px rgba(0, 0, 0, 0.75)'
                      : '0 12px 26px -14px rgba(0, 0, 0, 0.28)',
                    willChange: 'transform, opacity'
                  }}
                >
                  {/* Architectural Photo + Fallback */}
                  <div className="absolute inset-0 bg-[#18222B]">
                    <img
                      src={pillar.image}
                      alt={pillar.title}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>

                  {/* Measured Contrast Scrim */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(11, 16, 21, 0.12) 0%, rgba(11, 16, 21, 0.10) 40%, rgba(11, 16, 21, 0.88) 100%)'
                    }}
                  />

                  {/* Subtle Border */}
                  <div
                    className={`absolute inset-0 rounded-2xl pointer-events-none border ${
                      isActive ? 'border-white/30' : 'border-white/12'
                    }`}
                  />

                  {/* Card Caption Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-5 pm-photo-overlay space-y-1 pointer-events-none">
                    <span className="pm-photo-brass font-mono text-[10px] font-semibold tracking-[0.16em] uppercase block">
                      {pillar.index} · {pillar.location}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold leading-tight">
                      {pillar.title}
                    </h3>
                    <p className="pm-photo-sub text-[11px] sm:text-xs font-medium">
                      {pillar.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Circular Arrow */}
          <button
            type="button"
            onClick={goNext}
            aria-label="Next governance pillar"
            className={`hidden sm:flex items-center justify-center w-10 h-10 rounded-full border transition-colors cursor-pointer shrink-0 z-50 ${
              isChampagne
                ? 'bg-[#FAF8F4] hover:bg-[#F3EFE8] border-[#E6E0D6] text-[#18222B]'
                : 'bg-[#18222E] hover:bg-[#1E2B3A] border-[#2A394A] text-[#F4F1EA]'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Centered Description + Pagination Controls */}
        <div className="mt-3 sm:mt-4 max-w-lg mx-auto text-center space-y-5">
          <p
            key={activePillar.id}
            className={`text-xs sm:text-sm leading-relaxed min-h-[2.75rem] ${
              isChampagne ? 'text-[#43505C]' : 'text-[#A8B4C2]'
            }`}
          >
            {activePillar.description}
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous pillar"
              className={`sm:hidden w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer ${
                isChampagne
                  ? 'bg-[#FAF8F4] border-[#E6E0D6] text-[#18222B]'
                  : 'bg-[#18222E] border-[#2A394A] text-[#F4F1EA]'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center justify-center gap-1.5" role="tablist" aria-label="Governance slides">
              {GOVERNANCE_PILLARS.map((pillar, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={pillar.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`View ${pillar.title}`}
                    onClick={() => goTo(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      isActive
                        ? isChampagne
                          ? 'w-6 bg-[#0B7A4E]'
                          : 'w-6 bg-[#10B981]'
                        : isChampagne
                        ? 'w-1.5 bg-[#D3CBC0] hover:bg-[#9A7B3E]'
                        : 'w-1.5 bg-[#2E3E50] hover:bg-[#64748B]'
                    }`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next pillar"
              className={`sm:hidden w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer ${
                isChampagne
                  ? 'bg-[#FAF8F4] border-[#E6E0D6] text-[#18222B]'
                  : 'bg-[#18222E] border-[#2A394A] text-[#F4F1EA]'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

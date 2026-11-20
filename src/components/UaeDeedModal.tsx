import React, { useState } from 'react';
import {
  ShieldCheck,
  Printer,
  X,
  Award,
  QrCode,
  MapPin,
  Landmark,
  TrendingUp
} from 'lucide-react';
import { UserInvestment } from '../types';
import { useTheme } from '../context/ThemeContext';

interface UaeDeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: UserInvestment | null;
  defaultTab?: 'deed' | 'trust' | 'tenancy' | 'cadastral';
}

interface PropertyMeta {
  name: string;
  location: string;
  address: string;
  image: string;
  type: string;
  occupancy: string;
  deedTier: string;
  cadastralId: string;
  makaniNumber: string;
  zoning: string;
  valuation: string;
  trustee: string;
  spvCode: string;
}

const PROPERTY_DATABASE: Record<string, PropertyMeta> = {
  plan_0: {
    name: 'Jumeirah Village Studios',
    location: 'Jumeirah Village Circle (JVC), Dubai',
    address: 'Plot 214-108, District 12, JVC, Dubai, UAE',
    image: '/properties/jumeirah_village_studios.jpg',
    type: 'Starter Studio Co-Ownership',
    occupancy: '97.8%',
    deedTier: 'Jumeirah Village Deed',
    cadastralId: 'DLD-CAD-214-108',
    makaniNumber: '13490 61842',
    zoning: 'Freehold Residential (R-3)',
    valuation: 'AED 52M',
    trustee: 'Treasure Homes SPV Ltd',
    spvCode: 'SPV-DXB-JVC-00'
  },
  plan_1: {
    name: 'Marina Bay Residences',
    location: 'Dubai Marina, Dubai',
    address: 'Plot 392-581, Marina Promenade, Dubai Marina, UAE',
    image: '/properties/marina_bay_residences.jpg',
    type: 'Executive Waterfront Studio',
    occupancy: '98.4%',
    deedTier: 'Marina Bay Deed',
    cadastralId: 'DLD-CAD-392-581',
    makaniNumber: '12845 76291',
    zoning: 'Freehold Residential (R-4)',
    valuation: 'AED 84.5M',
    trustee: 'Treasure Homes SPV Ltd',
    spvCode: 'SPV-DXB-MARINA-01'
  },
  plan_2: {
    name: 'Creek Horizon Suites',
    location: 'Dubai Creek Harbour, Dubai',
    address: 'Plot 184-210, Creek Island Blvd, Dubai Creek Harbour, UAE',
    image: '/properties/creek_horizon_suites.jpg',
    type: '1-Bedroom Waterfront Residence',
    occupancy: '97.2%',
    deedTier: 'Creek Horizon Deed',
    cadastralId: 'DLD-CAD-184-210',
    makaniNumber: '14592 88201',
    zoning: 'Waterfront Mixed Residential (W-2)',
    valuation: 'AED 120M',
    trustee: 'Treasure Homes SPV Ltd',
    spvCode: 'SPV-DXB-CREEK-02'
  },
  plan_3: {
    name: 'Downtown Sky Vista',
    location: 'Downtown Dubai',
    address: 'Plot 119-969, Mohammed bin Rashid Blvd, Downtown Dubai, UAE',
    image: '/properties/downtown_sky_vista.jpg',
    type: 'Serviced Luxury Residence',
    occupancy: '99.1%',
    deedTier: 'Downtown Sky Deed',
    cadastralId: 'DLD-CAD-119-969',
    makaniNumber: '11894 92051',
    zoning: 'Central Hospitality (C-1)',
    valuation: 'AED 245M',
    trustee: 'Treasure Homes SPV Ltd',
    spvCode: 'SPV-DXB-DOWNTOWN-03'
  },
  plan_4: {
    name: 'Sobha Sanctuary Estates',
    location: 'Sobha Hartland, MBR City',
    address: 'Plot 440-112, Sobha Hartland, MBR City, Dubai, UAE',
    image: '/properties/sobha_sanctuary_estates.jpg',
    type: '2-Bedroom Forest Villa',
    occupancy: '96.8%',
    deedTier: 'Sobha Sanctuary Deed',
    cadastralId: 'DLD-CAD-440-112',
    makaniNumber: '16402 71830',
    zoning: 'Luxury Villa Residential (V-1)',
    valuation: 'AED 380M',
    trustee: 'Treasure Homes SPV Ltd',
    spvCode: 'SPV-DXB-SOBHA-04'
  },
  plan_5: {
    name: 'Palm Azure Ocean Villa',
    location: 'Palm Jumeirah, Dubai',
    address: 'Plot 512-404, Crescent Rd West, Frond G, Palm Jumeirah, UAE',
    image: '/properties/palm_azure_villa.jpg',
    type: 'Beachfront Signature Villa',
    occupancy: '98.9%',
    deedTier: 'Palm Azure Deed',
    cadastralId: 'DLD-CAD-512-404',
    makaniNumber: '10382 64920',
    zoning: 'Beachfront Luxury (B-1)',
    valuation: 'AED 620M',
    trustee: 'Treasure Homes SPV Ltd',
    spvCode: 'SPV-DXB-PALM-05'
  },
  plan_6: {
    name: 'Emirates Financial Tower',
    location: 'DIFC Financial District, Dubai',
    address: 'Plot 884-219, Al Sa\'ada Street, DIFC Gate Precinct 4, Dubai, UAE',
    image: '/properties/emirates_tower_difc.jpg',
    type: 'Grade-A Commercial Asset',
    occupancy: '99.4%',
    deedTier: 'Emirates Tower Deed',
    cadastralId: 'DLD-CAD-884-219',
    makaniNumber: '18290 83910',
    zoning: 'DIFC Free Zone Commercial',
    valuation: 'AED 1.45B',
    trustee: 'Treasure Homes SPV Ltd',
    spvCode: 'SPV-DXB-DIFC-06'
  }
};

export const UaeDeedModal: React.FC<UaeDeedModalProps> = ({
  isOpen,
  onClose,
  investment,
  defaultTab = 'deed'
}) => {
  const { isChampagne } = useTheme();
  const [activeTab, setActiveTab] = useState<'deed' | 'trust' | 'tenancy' | 'cadastral'>(defaultTab);

  if (!isOpen || !investment) return null;

  const planKey =
    investment.planId && PROPERTY_DATABASE[investment.planId]
      ? investment.planId
      : Object.keys(PROPERTY_DATABASE).find(
          (k) =>
            PROPERTY_DATABASE[k].name.toLowerCase() ===
            (investment.propertyName || investment.planName || '').toLowerCase()
        ) || 'plan_1';

  const meta = PROPERTY_DATABASE[planKey];
  const propertyName = investment.propertyName || meta.name;
  const propertyLocation = investment.propertyLocation || meta.location;
  const propertyAddress = investment.propertyAddress || meta.address;
  const propertyImage = investment.propertyImage || meta.image;
  const cadastralId = investment.cadastralId || meta.cadastralId;
  const makaniNumber = investment.makaniNumber || meta.makaniNumber;
  const deedCode =
    investment.deedReferenceCode ||
    `UAE-DLD-2026-${investment.id.slice(-6).toUpperCase()}`;

  const totalWeeks = investment.totalWeeks || 24;

  const surfaceBg = isChampagne ? 'bg-[#FFFFFF]' : 'bg-[#121922]';
  const subtleBg = isChampagne ? 'bg-[#F7F4EE]' : 'bg-[#18222E]';
  const borderCol = isChampagne ? 'border-[#E6E0D6]' : 'border-[#222F3D]';
  const textMain = isChampagne ? 'text-[#18222B]' : 'text-[#F4F1EA]';
  const textMuted = isChampagne ? 'text-[#556270]' : 'text-[#94A3B8]';
  const textEmerald = isChampagne ? 'text-[#0B7A4E]' : 'text-[#10B981]';
  const textBrass = isChampagne ? 'text-[#9A7B3E]' : 'text-[#C6A45C]';

  const tabs: {
    id: 'deed' | 'trust' | 'tenancy' | 'cadastral';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'deed', label: 'Title Deed', icon: Award },
    { id: 'trust', label: 'SPV Trust', icon: ShieldCheck },
    { id: 'tenancy', label: 'Cashflow', icon: TrendingUp },
    { id: 'cadastral', label: 'Cadastral', icon: MapPin }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div
        className={`${surfaceBg} ${textMain} border ${borderCol} rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl relative font-sans overflow-hidden my-auto`}
      >
        {/* Top Header */}
        <div
          className={`flex items-center justify-between gap-3 px-5 py-3.5 border-b ${borderCol} ${surfaceBg} shrink-0`}
        >
          <div className="min-w-0">
            <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] block ${textBrass}`}>
              Property Dossier
            </span>
            <span className="font-serif text-lg font-semibold block truncate">
              {propertyName}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-[#0B7A4E] hover:bg-[#08633E] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              title="Print or save PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print PDF</span>
              <span className="sm:hidden">Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg border ${borderCol} ${textMuted} hover:opacity-100 transition-opacity cursor-pointer`}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clean Underline Tab Bar */}
        <div className={`px-5 border-b ${borderCol} flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar shrink-0`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2.5 text-xs font-medium border-b-2 -mb-px flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? `border-[#0B7A4E] ${textEmerald} font-semibold`
                    : `border-transparent ${textMuted} hover:opacity-100`
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 print:p-0 print:overflow-visible">
          {/* TAB 1: TITLE DEED */}
          {activeTab === 'deed' && (
            <div className="space-y-5">
              {/* Architectural Photo Header (Theme-Immune Ivory Text) */}
              <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden bg-[#18222B]">
                <img
                  src={propertyImage}
                  alt={propertyName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(11,16,21,0.12) 0%, rgba(11,16,21,0.35) 45%, rgba(11,16,21,0.88) 100%)'
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 pm-photo-overlay flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <span className="pm-photo-brass text-[10px] font-semibold uppercase tracking-[0.16em] block">
                      Dubai Land Department Deed
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold leading-tight mt-0.5 truncate">
                      {propertyName}
                    </h2>
                    <p className="pm-photo-sub text-xs mt-0.5 truncate">
                      {propertyLocation}
                    </p>
                  </div>
                  <span className="pm-photo-emerald font-mono text-xs font-semibold shrink-0">
                    {meta.occupancy} Occ.
                  </span>
                </div>
              </div>

              {/* Reference Strip */}
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${subtleBg} border ${borderCol} rounded-xl p-3.5 text-xs`}>
                <div>
                  <span className={`text-[10px] uppercase tracking-wider block ${textMuted}`}>Deed Ref</span>
                  <span className={`font-mono font-semibold block mt-0.5 truncate ${textBrass}`}>{deedCode}</span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase tracking-wider block ${textMuted}`}>Cadastral</span>
                  <span className={`font-mono font-semibold block mt-0.5 ${textMain}`}>{cadastralId}</span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase tracking-wider block ${textMuted}`}>Makani</span>
                  <span className={`font-mono font-semibold block mt-0.5 ${textMain}`}>{makaniNumber}</span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase tracking-wider block ${textMuted}`}>Issued</span>
                  <span className={`font-mono font-semibold block mt-0.5 ${textEmerald}`}>
                    {new Date(investment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Address */}
              <div className={`flex items-start gap-3 ${subtleBg} border ${borderCol} rounded-xl p-3.5`}>
                <Landmark className={`w-4 h-4 shrink-0 mt-0.5 ${textBrass}`} />
                <div className="text-xs">
                  <span className={`text-[10px] uppercase tracking-wider font-medium block ${textMuted}`}>
                    Registered Address
                  </span>
                  <p className={`font-medium mt-0.5 ${textMain}`}>{propertyAddress}</p>
                </div>
              </div>

              {/* Concise Allocation Statement + Financial Summary */}
              <div className={`border-y ${borderCol} py-4 space-y-4`}>
                <p className={`text-xs sm:text-sm leading-relaxed ${textMuted}`}>
                  Confirms <strong className={textMain}>{investment.userName}</strong> holds a fractional stake in{' '}
                  <strong className={textMain}>{propertyName}</strong> under{' '}
                  <strong className={textMain}>{meta.trustee}</strong> ({meta.spvCode}).
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div className={`${subtleBg} border ${borderCol} rounded-xl p-3`}>
                    <span className={`text-[10px] uppercase tracking-wider block ${textMuted}`}>Capital</span>
                    <span className={`font-mono text-sm sm:text-base font-semibold tabular-nums block mt-0.5 ${textMain}`}>
                      ₦{investment.cost.toLocaleString()}
                    </span>
                  </div>
                  <div className={`${subtleBg} border ${borderCol} rounded-xl p-3`}>
                    <span className={`text-[10px] uppercase tracking-wider block ${textEmerald}`}>Friday Yield</span>
                    <span className={`font-mono text-sm sm:text-base font-semibold tabular-nums block mt-0.5 ${textEmerald}`}>
                      ₦{investment.weeklyPayout.toLocaleString()}
                    </span>
                  </div>
                  <div className={`${subtleBg} border ${borderCol} rounded-xl p-3`}>
                    <span className={`text-[10px] uppercase tracking-wider block ${textBrass}`}>Total ({totalWeeks}w)</span>
                    <span className={`font-mono text-sm sm:text-base font-semibold tabular-nums block mt-0.5 ${textBrass}`}>
                      ₦{investment.totalReturns.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification Footer */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-lg border ${borderCol} bg-white p-1 flex items-center justify-center shrink-0`}>
                    <QrCode className="w-9 h-9 text-[#18222B]" />
                  </div>
                  <div className="text-[11px] font-mono">
                    <span className={`font-semibold block ${textMain}`}>DLD Registry Verified</span>
                    <span className={`block ${textEmerald}`}>24-Week Friday Ledger</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-serif italic text-base font-semibold ${textBrass}`}>Treasure Homes Ltd</div>
                  <div className={`text-[10px] font-mono uppercase tracking-wider ${textMuted}`}>SPV Trustee</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPV TRUST */}
          {activeTab === 'trust' && (
            <div className="space-y-4">
              <div className={`border-b ${borderCol} pb-3 flex items-center justify-between gap-2`}>
                <div>
                  <h3 className="font-serif text-xl font-semibold">SPV Custody Summary</h3>
                  <p className={`text-xs ${textMuted}`}>
                    {meta.trustee} · {investment.userName}
                  </p>
                </div>
                <span className={`text-xs font-mono font-semibold ${textEmerald}`}>Active</span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className={`${subtleBg} border ${borderCol} rounded-xl p-3.5`}>
                  <span className={`font-semibold block mb-1 ${textMain}`}>1. Ring-Fenced Title</span>
                  <p className={textMuted}>
                    ₦{investment.cost.toLocaleString()} is allocated to {propertyName} inside SPV{' '}
                    <span className="font-mono font-semibold">{meta.spvCode}</span>, separated from corporate liabilities.
                  </p>
                </div>

                <div className={`${subtleBg} border ${borderCol} rounded-xl p-3.5`}>
                  <span className={`font-semibold block mb-1 ${textMain}`}>2. Friday Settlement</span>
                  <p className={textMuted}>
                    ₦{investment.weeklyPayout.toLocaleString()} credits every Friday for {totalWeeks} weeks (₦
                    {investment.totalReturns.toLocaleString()} total). Auto-Renew adds +3% (+₦
                    {Math.round(investment.weeklyPayout * 0.03).toLocaleString()}/wk).
                  </p>
                </div>

                <div className={`${subtleBg} border ${borderCol} rounded-xl p-3.5`}>
                  <span className={`font-semibold block mb-1 ${textMain}`}>3. Jurisdiction</span>
                  <p className={textMuted}>
                    Governed under Dubai International Financial Centre (DIFC) Common Law.
                  </p>
                </div>
              </div>

              <div className={`grid grid-cols-2 gap-3 text-xs font-mono pt-1`}>
                <div className={`${subtleBg} border ${borderCol} rounded-xl p-3`}>
                  <span className={`text-[10px] uppercase block ${textMuted}`}>SPV Code</span>
                  <span className={`font-semibold block mt-0.5 ${textMain}`}>{meta.spvCode}</span>
                </div>
                <div className={`${subtleBg} border ${borderCol} rounded-xl p-3`}>
                  <span className={`text-[10px] uppercase block ${textMuted}`}>Valuation</span>
                  <span className={`font-semibold block mt-0.5 ${textEmerald}`}>{meta.valuation}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CASHFLOW */}
          {activeTab === 'tenancy' && (
            <div className="space-y-4">
              <div className={`border-b ${borderCol} pb-3 flex items-center justify-between gap-2`}>
                <div>
                  <h3 className="font-serif text-xl font-semibold">Weekly Yield Schedule</h3>
                  <p className={`text-xs ${textMuted}`}>{propertyName} · {meta.occupancy} Occupied</p>
                </div>
                <span className={`text-xs font-mono font-semibold ${textEmerald}`}>
                  Wk {investment.weeksPaid}/{totalWeeks}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className={`${subtleBg} border ${borderCol} rounded-xl p-3`}>
                  <span className={`text-[10px] uppercase block ${textMuted}`}>Weekly</span>
                  <span className={`font-mono text-sm font-semibold tabular-nums block mt-0.5 ${textEmerald}`}>
                    ₦{investment.weeklyPayout.toLocaleString()}
                  </span>
                </div>
                <div className={`${subtleBg} border ${borderCol} rounded-xl p-3`}>
                  <span className={`text-[10px] uppercase block ${textMuted}`}>Paid</span>
                  <span className={`font-mono text-sm font-semibold tabular-nums block mt-0.5 ${textMain}`}>
                    ₦{(investment.weeklyPayout * investment.weeksPaid).toLocaleString()}
                  </span>
                </div>
                <div className={`${subtleBg} border ${borderCol} rounded-xl p-3`}>
                  <span className={`text-[10px] uppercase block ${textMuted}`}>Remaining</span>
                  <span className={`font-mono text-sm font-semibold tabular-nums block mt-0.5 ${textBrass}`}>
                    ₦{(investment.weeklyPayout * Math.max(0, totalWeeks - investment.weeksPaid)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className={`border ${borderCol} rounded-xl overflow-hidden`}>
                <table className="w-full text-left text-xs font-mono">
                  <thead className={`${subtleBg} border-b ${borderCol} text-[10px] uppercase ${textMuted}`}>
                    <tr>
                      <th className="py-2.5 px-3 font-medium">Cycle</th>
                      <th className="py-2.5 px-3 font-medium">Schedule</th>
                      <th className="py-2.5 px-3 text-right font-medium">Payout</th>
                      <th className="py-2.5 px-3 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${borderCol}`}>
                    {Array.from({ length: Math.min(8, totalWeeks) }).map((_, idx) => {
                      const weekNum = idx + 1;
                      const isPaid = weekNum <= investment.weeksPaid;
                      const isNext = weekNum === investment.weeksPaid + 1;

                      return (
                        <tr key={weekNum}>
                          <td className={`py-2 px-3 font-semibold ${textMain}`}>Week {weekNum}</td>
                          <td className={`py-2 px-3 ${textMuted}`}>
                            {isPaid ? 'Settled' : isNext ? 'Next Friday' : `+${weekNum * 7}d`}
                          </td>
                          <td className={`py-2 px-3 text-right font-semibold tabular-nums ${textMain}`}>
                            ₦{investment.weeklyPayout.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span
                              className={`text-[10px] font-semibold ${
                                isPaid ? textEmerald : isNext ? textBrass : textMuted
                              }`}
                            >
                              {isPaid ? 'PAID' : isNext ? 'NEXT' : 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CADASTRAL */}
          {activeTab === 'cadastral' && (
            <div className="space-y-4">
              <div className={`border-b ${borderCol} pb-3`}>
                <h3 className="font-serif text-xl font-semibold">Cadastral &amp; Makani Record</h3>
                <p className={`text-xs ${textMuted}`}>Dubai Municipality land survey reference.</p>
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 items-center ${subtleBg} border ${borderCol} rounded-xl p-4`}>
                <div className="h-40 rounded-lg overflow-hidden bg-[#18222B]">
                  <img
                    src={propertyImage}
                    alt={propertyName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className={`text-[10px] uppercase tracking-wider block ${textMuted}`}>Address</span>
                    <strong className={`block mt-0.5 ${textMain}`}>{propertyAddress}</strong>
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase tracking-wider block ${textMuted}`}>Cadastral ID</span>
                    <span className={`font-mono font-semibold ${textBrass}`}>{cadastralId}</span>
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase tracking-wider block ${textMuted}`}>Makani Number</span>
                    <span className={`font-mono font-semibold ${textEmerald}`}>{makaniNumber}</span>
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase tracking-wider block ${textMuted}`}>Zoning</span>
                    <span className={`font-mono ${textMain}`}>{meta.zoning}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UaeDeedModal;

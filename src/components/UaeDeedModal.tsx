import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Printer, 
  X, 
  Building, 
  CheckCircle2, 
  Award, 
  QrCode,
  FileText,
  MapPin,
  Landmark,
  DollarSign,
  TrendingUp,
  Percent,
  Check,
  Lock,
  ExternalLink
} from 'lucide-react';
import { UserInvestment } from '../types';

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
  plan_1: {
    name: 'Marina Bay Residences',
    location: 'Dubai Marina, Dubai, UAE 🇦🇪',
    address: 'Plot 392-581, Marina Promenade, Al Marsa Street, Dubai Marina, Dubai, United Arab Emirates',
    image: '/properties/marina_bay_residences.jpg',
    type: 'Executive Studio Waterfront Stake',
    occupancy: '98.4%',
    deedTier: 'Marina Bay Co-Ownership Deed (₦30,000 Tier)',
    cadastralId: 'DLD-CAD-392-581',
    makaniNumber: '12845 76291',
    zoning: 'Freehold Prime Residential (R-4)',
    valuation: 'AED 84,500,000 (Valued Q3 2026)',
    trustee: 'Treasure Homes Sovereign Real Estate SPV Ltd',
    spvCode: 'SPV-DXB-MARINA-01'
  },
  plan_2: {
    name: 'Creek Horizon Suites',
    location: 'Dubai Creek Harbour, Dubai, UAE 🇦🇪',
    address: 'Plot 184-210, Creek Island Boulevard, Dubai Creek Harbour, The Lagoons, Dubai, United Arab Emirates',
    image: '/properties/creek_horizon_suites.jpg',
    type: '1-Bedroom Waterfront Apartment',
    occupancy: '97.2%',
    deedTier: 'Creek Horizon Co-Ownership Deed (₦60,000 Tier)',
    cadastralId: 'DLD-CAD-184-210',
    makaniNumber: '14592 88201',
    zoning: 'Waterfront Mixed Residential (W-2)',
    valuation: 'AED 120,000,000 (Valued Q3 2026)',
    trustee: 'Treasure Homes Sovereign Real Estate SPV Ltd',
    spvCode: 'SPV-DXB-CREEK-02'
  },
  plan_3: {
    name: 'Downtown Sky Vista',
    location: 'Downtown Burj Khalifa District, Dubai, UAE 🇦🇪',
    address: 'Plot 119-969, Sheikh Mohammed bin Rashid Boulevard, Downtown Dubai, Dubai, United Arab Emirates',
    image: '/properties/downtown_sky_vista.jpg',
    type: 'Serviced Luxury Residence Stake',
    occupancy: '99.1%',
    deedTier: 'Downtown Sky Co-Ownership Deed (₦120,000 Tier)',
    cadastralId: 'DLD-CAD-119-969',
    makaniNumber: '11894 92051',
    zoning: 'Central Commercial & Hospitality (C-1)',
    valuation: 'AED 245,000,000 (Valued Q3 2026)',
    trustee: 'Treasure Homes Sovereign Real Estate SPV Ltd',
    spvCode: 'SPV-DXB-DOWNTOWN-03'
  },
  plan_4: {
    name: 'Sobha Sanctuary Estates',
    location: 'Sobha Hartland / MBR City, Dubai, UAE 🇦🇪',
    address: 'Plot 440-112, Ras Al Khor Road, Sobha Hartland, Mohammed Bin Rashid Al Maktoum City, Dubai, United Arab Emirates',
    image: '/properties/sobha_sanctuary_estates.jpg',
    type: '2-Bedroom Forest Villa Stake',
    occupancy: '96.8%',
    deedTier: 'Sobha Sanctuary Co-Ownership Deed (₦250,000 Tier)',
    cadastralId: 'DLD-CAD-440-112',
    makaniNumber: '16402 71830',
    zoning: 'Ultra-Luxury Villa Residential (V-1)',
    valuation: 'AED 380,000,000 (Valued Q3 2026)',
    trustee: 'Treasure Homes Sovereign Real Estate SPV Ltd',
    spvCode: 'SPV-DXB-SOBHA-04'
  },
  plan_5: {
    name: 'Palm Azure Ocean Villa',
    location: 'Palm Jumeirah, Dubai, UAE 🇦🇪',
    address: 'Plot 512-404, Crescent Road West, Frond G, Palm Jumeirah, Dubai, United Arab Emirates',
    image: '/properties/palm_azure_villa.jpg',
    type: 'Ultra-Luxury Waterfront Residence',
    occupancy: '98.9%',
    deedTier: 'Palm Azure Co-Ownership Deed (₦600,000 Tier)',
    cadastralId: 'DLD-CAD-512-404',
    makaniNumber: '10382 64920',
    zoning: 'Beachfront Sovereign Luxury (B-1)',
    valuation: 'AED 620,000,000 (Valued Q3 2026)',
    trustee: 'Treasure Homes Sovereign Real Estate SPV Ltd',
    spvCode: 'SPV-DXB-PALM-05'
  },
  plan_6: {
    name: 'Emirates Financial Tower',
    location: 'DIFC Financial District, Dubai, UAE 🇦🇪',
    address: 'Plot 884-219, Al Sa\'ada Street, DIFC Gate Precinct 4, Dubai International Financial Centre, Dubai, United Arab Emirates',
    image: '/properties/emirates_tower_difc.jpg',
    type: 'Prime Grade-A Commercial Asset',
    occupancy: '99.4%',
    deedTier: 'Emirates Tower Co-Ownership Deed (₦1,500,000 Tier)',
    cadastralId: 'DLD-CAD-884-219',
    makaniNumber: '18290 83910',
    zoning: 'DIFC Special Free Zone Commercial (DIFC-G)',
    valuation: 'AED 1,450,000,000 (Valued Q3 2026)',
    trustee: 'Treasure Homes Sovereign Real Estate SPV Ltd',
    spvCode: 'SPV-DXB-DIFC-06'
  }
};

export const UaeDeedModal: React.FC<UaeDeedModalProps> = ({ 
  isOpen, 
  onClose, 
  investment,
  defaultTab = 'deed'
}) => {
  const [activeTab, setActiveTab] = useState<'deed' | 'trust' | 'tenancy' | 'cadastral'>(defaultTab);

  if (!isOpen || !investment) return null;

  // Resolve property meta
  const planKey = (investment.planId && PROPERTY_DATABASE[investment.planId]) 
    ? investment.planId 
    : Object.keys(PROPERTY_DATABASE).find(k => 
        PROPERTY_DATABASE[k].name.toLowerCase() === (investment.propertyName || investment.planName || '').toLowerCase()
      ) || 'plan_1';

  const meta = PROPERTY_DATABASE[planKey];
  const propertyName = investment.propertyName || meta.name;
  const propertyLocation = investment.propertyLocation || meta.location;
  const propertyAddress = investment.propertyAddress || meta.address;
  const propertyImage = investment.propertyImage || meta.image;
  const cadastralId = investment.cadastralId || meta.cadastralId;
  const makaniNumber = investment.makaniNumber || meta.makaniNumber;
  const deedTier = investment.deedTier || meta.deedTier;
  const deedCode = investment.deedReferenceCode || `UAE-DLD-2026-${investment.id.slice(-6).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  const totalWeeks = investment.totalWeeks || 24;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-950 border border-amber-500/40 rounded-2xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl relative font-sans text-slate-100 overflow-hidden my-auto">
        
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-900/95 border-b border-slate-800 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono block">
                Official Property Backing Vault
              </span>
              <span className="text-[11px] text-slate-400">
                {propertyName} · {deedCode}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Print official document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation for All Backing Documents */}
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('deed')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'deed'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Title Deed Certificate</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trust')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'trust'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SPV Trust Agreement</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tenancy')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'tenancy'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Rental Cashflow Schedule</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cadastral')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'cadastral'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Cadastral Survey &amp; Address</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 print:p-0 print:overflow-visible">

          {/* TAB 1: TITLE DEED CERTIFICATE */}
          {activeTab === 'deed' && (
            <div className="border border-amber-500/30 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 print:border-none print:bg-white print:text-black">
              {/* Property Image Banner */}
              <div className="relative h-48 sm:h-56 w-full overflow-hidden border-b border-amber-500/30">
                <img 
                  src={propertyImage} 
                  alt={propertyName} 
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md uppercase font-mono tracking-widest inline-block mb-1">
                      AUTHENTICATED UAE TITLE DEED
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white font-serif tracking-wide drop-shadow-md">
                      {propertyName}
                    </h2>
                    <p className="text-xs text-amber-300 font-mono flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {propertyLocation}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold bg-slate-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    {meta.occupancy} Occupancy
                  </span>
                </div>
              </div>

              {/* Certificate Inner Body */}
              <div className="p-5 sm:p-6 space-y-5">
                {/* Official Reference Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Deed Reference</span>
                    <span className="font-bold text-amber-400">{deedCode}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Cadastral ID</span>
                    <span className="font-bold text-slate-200">{cadastralId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Makani Number</span>
                    <span className="font-bold text-slate-200">{makaniNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Issue Date</span>
                    <span className="font-bold text-emerald-400">{new Date(investment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Valid Physical Address in Selected Area */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
                  <Landmark className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-mono font-bold block">
                      Registered Physical Property Address
                    </span>
                    <p className="text-xs text-slate-200 font-medium mt-0.5 leading-relaxed font-sans">
                      {propertyAddress}
                    </p>
                  </div>
                </div>

                {/* Core Allocation Statement */}
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed border-y border-slate-800/80 py-4 font-sans">
                  <p>
                    This official certificate confirms that <strong className="text-white uppercase tracking-wider">{investment.userName}</strong> holds an authenticated fractional co-ownership stake in <strong className="text-amber-400">{propertyName}</strong>, under the sovereign custody of Treasure Homes Sovereign Real Estate SPV Ltd.
                  </p>

                  <div className="grid grid-cols-3 gap-2.5 font-mono pt-1">
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block font-sans">Allotted Principal</span>
                      <span className="text-sm font-extrabold text-white">₦{investment.cost.toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-emerald-400 block font-sans font-semibold">Weekly Cash Payout</span>
                      <span className="text-sm font-extrabold text-emerald-400">₦{investment.weeklyPayout.toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-amber-400 block font-sans font-semibold">Total ({totalWeeks}w)</span>
                      <span className="text-sm font-extrabold text-amber-400">₦{investment.totalReturns.toLocaleString()}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 pt-1 leading-normal">
                    Dividend disbursements are settled on a strict 7-day schedule directly into your platform wallet. All funds are backed by physical asset appreciation, short-let hospitality, and corporate leasing agreements registered with the Dubai Land &amp; Property Trust.
                  </p>
                </div>

                {/* Footer Signatures & QR Code */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 shadow-sm">
                      <QrCode className="w-10 h-10 text-slate-950" />
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
                      <span className="text-white font-bold block">VERIFIED UAE TITLE DEED</span>
                      <span>Registry: Dubai Land &amp; Property Escrow</span>
                      <span className="text-emerald-400 block font-bold">● Active 24-Week Distribution Ledger</span>
                    </div>
                  </div>

                  <div className="text-right border-t sm:border-t-0 pt-2 sm:pt-0 font-serif">
                    <div className="text-amber-400 italic text-sm font-bold tracking-wider">Treasure Homes Ltd</div>
                    <div className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Sovereign Property Trustee</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPV TRUST AGREEMENT */}
          {activeTab === 'trust' && (
            <div className="border border-slate-800 rounded-2xl bg-slate-900/70 p-6 space-y-5 font-sans">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider">
                    LEGAL INSTRUMENT OF TRUST &amp; CUSTODY
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                    ENFORCEABLE CONTRACT
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Special Purpose Vehicle (SPV) Co-Investment Agreement
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Between Treasure Homes Sovereign Real Estate SPV Ltd &amp; {investment.userName}
                </p>
              </div>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] mb-1 font-mono">1. Asset Backing &amp; Ring-Fencing</h4>
                  <p className="text-slate-400">
                    The Trustee confirms that 100% of the invested principal of <strong>₦{investment.cost.toLocaleString()}</strong> is irrevocably allocated to the physical real estate asset <strong>{propertyName}</strong> located at <em>{propertyAddress}</em>. The property title is ring-fenced within SPV code <strong>{meta.spvCode}</strong> and protected from third-party encumbrances.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] mb-1 font-mono">2. Guaranteed Payout Schedule &amp; Liquidity</h4>
                  <p className="text-slate-400">
                    The Investor shall receive weekly disbursements of <strong>₦{investment.weeklyPayout.toLocaleString()}</strong> every 7 days across the full 24-week tenure, culminating in total returns of <strong>₦{investment.totalReturns.toLocaleString()}</strong>. Disbursements are backed by continuous operational rental income and the platform liquidity reserve.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] mb-1 font-mono">3. Auto-Renew &amp; Rollover +3% Increment Clause</h4>
                  <p className="text-slate-400">
                    In accordance with platform governance, Investors exercising the Auto-Renew rollover toggle are entitled to an additional <strong>+3% increment</strong> on eligible weekly payouts (+₦{Math.round(investment.weeklyPayout * 0.03).toLocaleString()}/week), compounding weekly cash returns.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] mb-1 font-mono">4. Dispute Resolution &amp; Sovereign Jurisdiction</h4>
                  <p className="text-slate-400">
                    This agreement is governed by the laws of the United Arab Emirates and the Dubai International Financial Centre (DIFC) Courts.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">SPV Registration</span>
                  <span className="text-white font-bold">{meta.spvCode}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Asset Valuation</span>
                  <span className="text-emerald-400 font-bold">{meta.valuation}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RENTAL CASHFLOW SCHEDULE */}
          {activeTab === 'tenancy' && (
            <div className="border border-slate-800 rounded-2xl bg-slate-900/70 p-6 space-y-5 font-sans">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider">
                    OPERATIONAL CASHFLOW LEDGER
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                    {meta.occupancy} OCCUPIED
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {propertyName} Tenancy &amp; Yield Statement
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified commercial &amp; hospitality leasehold contracts driving weekly cash payouts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">Weekly Distribution</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">₦{investment.weeklyPayout.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Disbursed every 7 days</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">Cumulative Payouts</span>
                  <span className="text-base font-extrabold text-white font-mono">₦{(investment.weeklyPayout * investment.weeksPaid).toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Week {investment.weeksPaid} of {totalWeeks} paid</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">Remaining Target</span>
                  <span className="text-base font-extrabold text-amber-400 font-mono">₦{(investment.weeklyPayout * Math.max(0, totalWeeks - investment.weeksPaid)).toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{Math.max(0, totalWeeks - investment.weeksPaid)} weeks remaining</span>
                </div>
              </div>

              {/* Weekly Payout Schedule Table Preview */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Tenure Cycle</th>
                      <th className="py-2.5 px-3">Payout Due</th>
                      <th className="py-2.5 px-3 text-right">Cash Amount</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {Array.from({ length: Math.min(8, totalWeeks) }).map((_, idx) => {
                      const weekNum = idx + 1;
                      const isPaid = weekNum <= investment.weeksPaid;
                      const isNext = weekNum === investment.weeksPaid + 1;

                      return (
                        <tr key={weekNum} className={isNext ? 'bg-amber-500/10' : ''}>
                          <td className="py-2 px-3 font-semibold">Week {weekNum}</td>
                          <td className="py-2 px-3 text-slate-400">
                            {isPaid 
                              ? 'Disbursed' 
                              : isNext 
                                ? 'Next 7-Day Due' 
                                : `Cycle +${weekNum * 7}d`}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-white">
                            ₦{investment.weeklyPayout.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isPaid ? 'bg-emerald-500/20 text-emerald-400' :
                              isNext ? 'bg-amber-500/20 text-amber-400' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {isPaid ? 'PAID' : isNext ? 'SCHEDULED' : 'PENDING'}
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

          {/* TAB 4: CADASTRAL SURVEY & ADDRESS */}
          {activeTab === 'cadastral' && (
            <div className="border border-slate-800 rounded-2xl bg-slate-900/70 p-6 space-y-5 font-sans">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider">
                  MUNICIPALITY REGISTRATION &amp; GEO-SURVEY
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Cadastral Survey &amp; Physical Address Record
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authenticated records under the Dubai Municipality &amp; Land Registry framework.
                </p>
              </div>

              {/* Property Image & Address Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="h-40 rounded-lg overflow-hidden border border-slate-800">
                  <img src={propertyImage} alt={propertyName} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Physical Address</span>
                    <strong className="text-white text-xs block mt-0.5 font-sans">{propertyAddress}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Cadastral Reference</span>
                    <span className="text-amber-400 font-mono font-bold">{cadastralId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Makani Geocode Number</span>
                    <span className="text-emerald-400 font-mono font-bold">{makaniNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Zoning Classification</span>
                    <span className="text-slate-300 font-mono">{meta.zoning}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-400 leading-relaxed">
                <div className="flex items-center gap-2 text-white font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Cadastral Verification Certificate Active</span>
                </div>
                <p>
                  This property is officially surveyed and registered on the unified Dubai Land Registry mapping system. Investors can present this Cadastral ID and Makani Number at the Dubai Land Department or verify coordinates on the official Dubai Makani geo-portal.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UaeDeedModal;

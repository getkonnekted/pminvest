# Implementation Plan: Daily Synthetic Property Trading Simulation Card

Implement an institutional-grade, daily simulated property trading terminal card directly on the Investor Dashboard (`UserDashboard.tsx`) placed alongside Active Investments to demonstrate active market liquidity and convince investors.

---

### User Choices & Requirements
1. **Placement**: Live compact ticker card placed next to Active Investments on the main Investor Dashboard overview.
2. **Market Theme**: Live candlestick chart featuring synthetic property asset price movements (`PM-REIT / NGN` Property Yield Index).
3. **Behavior**: Automated real-time stream of simulated orders, depth levels, and executed property yields.

---

### Architectural Design

#### 1. New Component: `src/components/LiveTradingSimulationCard.tsx`
Create a high-polish, dark-slate styled trading simulation card matching the platform's visual identity:
- **Synthetic Asset Metric Header**:
  - Pair: `PM-REIT / NGN` (Treasure Homes Prime Property Liquidity Index)
  - Live Price with dynamic fractional ticks (e.g., `₦148,650.00` with animated green/red delta badges `▲ +4.82%`)
  - 24h Range: High (`₦152,100`), Low (`₦141,800`), Volume (`₦3.84B`)
  - Live Status indicator (`REALTIME FEED`)
- **Live SVG Candlestick Chart**:
  - 14-period dynamic candlestick renderer (body, wick, bull/bear colors `#10b981` / `#ef4444`).
  - Active candle that dynamically pulses and updates high/low/close values on real-time intervals (every 1.5s).
  - Timeframe selector buttons (`1m`, `5m`, `15m`, `1D`).
- **Automated Order & Yield Execution Feed**:
  - Live auto-scrolling stream of simulated institutional property transactions:
    - Locations: Lekki Phase 1 Luxury Suites, Victoria Island Commercial Wing, Epe Corridor Agro-Hub, Guzape Hills Terraces, Maitama Diplomatic Villa.
    - Types: `BUY ORDER`, `RENTAL YIELD`, `COLLATERAL SETTLED`.
    - Amounts: ₦15M to ₦120M.
    - Status: `FILLED`, `SETTLED`, `DISTRIBUTED`.
  - Bid/Ask quick depth bar showing buyer/seller momentum (e.g. 68% Buy / 32% Sell).
- **Expand Terminal Action**:
  - A clean button (`Expand Full Terminal ↗`) that opens the existing full-screen `LivePropertyTradingModal` with detailed property breakdowns.

#### 2. Dashboard Integration: `src/components/UserDashboard.tsx`
- Position `LiveTradingSimulationCard` on the Overview tab directly alongside or in an ergonomic grid next to the `My Active Investments` section.
- Ensure responsive layout:
  - Desktop: 2-column or structured 7/5 split so investors view their portfolio and the live market simulation simultaneously.
  - Mobile: Clean stacked cards with fluid horizontal scrolling for recent trades.

#### 3. Styling & Polish (`frontend-design` Compliance)
- Anti-slop discipline: No decorative pulsing dots next to static labels; tabular numbers (`tabular-nums font-mono`) for precision prices; crisp slate background (`#0f172a` / `#1e293b`); clear transparent notice: *"Simulated Institutional Liquidity Engine"*.
- Proper memory management: all `setInterval` timers cleaned up on component unmount to ensure 60fps smoothness with zero memory leaks.

---

### Proposed Changes

#### Components
- **[NEW] `src/components/LiveTradingSimulationCard.tsx`**: Self-contained simulated candlestick chart and automated order execution ticker.
- **[MODIFY] `src/components/UserDashboard.tsx`**:
  - Import `LiveTradingSimulationCard`.
  - Embed card next to `My Active Investments` section on the overview tab.
  - Connect "Expand Terminal" trigger to open the existing `LivePropertyTradingModal`.

---

### Verification Plan
1. **Compilation & Linting**:
   - Run `lint_applet` (`tsc --noEmit`) to verify 0 TypeScript errors.
   - Run `compile_applet` to confirm clean Vite production build.
2. **Interactive Functional Tests**:
   - Verify candlestick chart updates continuously with smooth price adjustments.
   - Verify simulated transaction stream pushes new entries automatically every 2-3 seconds.
   - Verify clicking "Expand Terminal" opens the full modal seamlessly.
   - Verify mobile and desktop responsiveness without layout overflows.

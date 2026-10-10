# PMInvest & Treasure Homes: Platform Revitalization & Interactive Daily Games Plan

A comprehensive architectural and UX revitalization to transform the platform into a true property investment powerhouse. This introduces daily interactive games (Lucky Spin Wheel & Property Prize Chest) for wallet bonuses, an instant 3% rollover cash incentive, culturally accurate regional Nigerian FOMO notifications, direct admin login bypass, and fully responsive layman-friendly info (`i`) tooltips and modals across all pages.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed through Phase 1 user input and will guide this implementation:

- **Confirmed Mini-Game Model**: Interactive Daily Lucky Spin Wheel and Property Prize Chest with personalized daily seed, granting points convertible to wallet cash boosts.
- **Confirmed Rollover Incentive**: 3% instant cash bonus automatically credited to the investor's available wallet upon rolling over or reinvesting a matured property plan.
- **Confirmed FOMO Regional Matching**: Direct cultural alignment between investor names, ethnic/religious combinations, and regional real estate ventures across Southwest (Yoruba Christian/Muslim), North (Muslim), North Central (Christian/Muslim), Southeast (Igbo), and Niger Delta (Ijaw, Itsekiri, Urhobo).
- **Confirmed Admin Access**: Direct automatic login bypass when admin email is entered (`admin@pminvest.org.ng` or user's email), along with a 1-click Admin Access bypass button.
- **Confirmed Info Tooltip Responsiveness**: Adaptive viewport-aware info popovers on desktop and automatic mobile bottom-sheet modals to guarantee zero horizontal clipping on small screens.

---

## 1. Overview & Core Concept

- **What It Does**: Rejuvenates PMInvest into a transparent, relatable Nigerian real estate investment ecosystem. Replaces passive incentives with dynamic daily engagement (daily wheel spins and treasure chest unlocks), awards an immediate 3% cash bonus whenever an investor rolls over their capital, renders real Nigerian regional property activity notifications, and presents complex real estate terms in everyday layman terms with accessible info (`i`) icons.
- **Target Audience / Persona**: Everyday Nigerian investors, diaspora sponsors, marketing partners, and platform administrators seeking credible, secure property asset growth without confusing technical jargon.
- **Key Value**: Boosts daily investor retention through gamified rewards, increases capital rollover rates with the 3% instant bonus, and delivers total trust through culturally authentic regional proof and responsive design.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Daily Interactive Task & Game Center**:
   - Investors navigate to the new "Daily Property Hub" on their dashboard.
   - Each day, the system generates a unique daily challenge: the **Lucky Spin Wheel** (land on plot bonuses, inspection multipliers, or points) or the **Property Prize Chest** (pick 1 of 3 keys to unlock a treasure crate).
   - Points earned feed into the investor's Wallet Boost meter, converting into cash earnings once goals are met.
   - Prevents duplicate play on the same calendar day while keeping streaks visible.

2. **Rollover Reinvestment with 3% Cash Incentive**:
   - When an active property plan completes its 12-week tenure (or upon manual rollover request), the investor is presented with the "Rollover & Reinvest" card.
   - An instant callout displays: *"Rollover Bonus: Reinvest now to immediately receive +3% cash (₦X,XXX) into your withdrawable wallet balance."*
   - On confirmation, the plan is refreshed for a new 12-week cycle and the 3% bonus is immediately credited to `walletBalance` with an audit record in transaction history.

3. **Regional Real Estate FOMO Notifications**:
   - Smart notifications cycle across the platform, pairing regionally authentic names and specific developments:
     - **Southwest (Lagos/Ogun/Oyo)**: Yoruba Christian & Muslim blends (*Babatunde A.* in Lekki Phase 1, *Kehinde O.* in Epe Expressway, *Oluwaseun F.* in Ikeja GRA, *Amina B.* in Ibadan Alalubosa).
     - **North (Kano/Kaduna/Sokoto/Abuja)**: Strictly Northern Muslim names (*Ibrahim M.* in Kano Commercial Hub, *Fatima U.* in Kaduna Urban District, *Bello A.* in Abuja Maitama).
     - **North Central (Plateau/Kwara/Niger/Benue/Nasarawa)**: Blended Christian & Muslim (*Pam D.* in Jos Rayfield, *Sulaiman K.* in Ilorin GRA, *Deborah J.* in Makurdi Waterfront).
     - **Southeast (Enugu/Imo/Anambra/Abia)**: Igbo names (*Chukwudi N.* in Enugu Independence Layout, *Nkechi O.* in New Owerri, *Emeka E.* in Onitsha Commercial).
     - **Niger Delta (Delta/Rivers/Bayelsa/Edo/Akwa Ibom)**: Ijaw, Itsekiri, Urhobo & Deltan names (*Tariere D.* in Yenagoa Waterfront, *Eyituoyo B.* in Warri GRA, *Tamuno P.* in Port Harcourt Old GRA, *Osamudiamen E.* in Benin City, *Bassey E.* in Uyo Shelter Afrique).

4. **1-Click Admin Access & Bypass**:
   - On the login screen, entering any designated admin email (`admin@pminvest.org.ng`, `admin@treasurehomes.ng`, or `tomoriolakunle@gmail.com`) automatically logs the user directly into the Administrator role without requiring tedious credential lookups.
   - A dedicated **"⚡ Instant Admin Access"** quick-button is available on the login modal to switch directly into the Admin Control Centre.

5. **Layman-Friendly Copy & Responsive Info (`i`) Icons**:
   - Jargon is replaced with intuitive labels (e.g., "Money in Properties" instead of "Aggregated Fractional Real Estate Allocation"; "Weekly Friday Profit" instead of "Accrued Dividend Yield").
   - Responsive `InfoTooltip`: When tapped on mobile devices (< 640px), opens a clean bottom drawer with dark overlay and easy-to-tap close button. On desktop, smoothly positions without overflowing screen edges.

### Visual Identity & Theme
- **Color Palette**: Deep Obsidian Navy (`slate-950`), Rich Forest Green (`emerald-600`), and Warm Real Estate Gold/Amber (`amber-500` / `amber-400`).
- **Typography**: Clean, readable sans-serif hierarchy with bold uppercase subheads for easy scanning.
- **Atmosphere**: Professional Nigerian financial institution aesthetic (analogous to premium banking and verified property developers).

---

## 3. Key Product Decisions & Trade-Offs

- **Daily Game Mechanics (Spin Wheel & Prize Chest)**:
  - *Decision*: Daily seed generated based on user ID and current calendar date (`YYYY-MM-DD`). Allows 1 free turn per day with randomized rewards (points, wallet boosts, badge rewards).
  - *Why*: Gives investors a compelling daily reason to open their dashboard, increasing engagement while keeping token rewards balanced.
- **3% Rollover Incentive Credit**:
  - *Decision*: Credited immediately to withdrawable `walletBalance` rather than locked in escrow.
  - *Why*: Provides instant gratification that motivates investors to keep their core capital in Treasure Homes developments instead of withdrawing principal.
- **Culturally Segmented FOMO Engine**:
  - *Decision*: Group names, regions, and development projects into dedicated regional matrices rather than picking random names from one general list.
  - *Why*: Eliminates cultural incongruities (e.g., matching a northern venture with an unrelated southern name) to build genuine credibility with Nigerian investors across all geopolitical zones.
- **Adaptive Info Drawer for Mobile**:
  - *Decision*: Auto-detect screen width; render floating popover on large screens, fixed bottom-sheet modal with blurred backdrop on mobile.
  - *Why*: Prevents off-screen text truncation on mobile phones where screen widths range between 360px and 410px.

---

## 4. Technical Architecture & Component Structure

```
┌────────────────────────────────────────────────────────────────────────┐
│                          StateContext.tsx                              │
│  - users & currentUser (Admin auto-bypass & session sync)              │
│  - dailyTasks: Record<userId, { date, playedWheel, playedChest, pts }> │
│  - rolloverInvestment(planId): +3% instant wallet credit & new cycle   │
│  - Base Liquidity: ₦423M+ with ₦336k daily continuous accretion        │
└───────────────────┬───────────────────────────────────┬────────────────┘
                    │                                   │
      ┌─────────────▼─────────────┐       ┌─────────────▼─────────────┐
      │  DailyPropertyGameHub.tsx  │       │  LiveActivityToast.tsx     │
      │  - Lucky Spin Wheel View  │       │  - 5 Geopolitical Regions  │
      │  - Property Prize Chest   │       │  - Culturally Matched Names│
      │  - Points to Wallet Meter │       │  - Real Regional Ventures  │
      └───────────────────────────┘       └───────────────────────────┘
                    │                                   │
      ┌─────────────▼─────────────┐       ┌─────────────▼─────────────┐
      │     UserDashboard.tsx     │       │     InfoTooltip.tsx       │
      │  - Rollover +3% Trigger   │       │  - Responsive Viewport Clp │
      │  - Layman Relatable Copy  │       │  - Mobile Bottom Sheet     │
      │  - Daily Game Launch Card │       │  - Tap-friendly Backdrop   │
      └───────────────────────────┘       └───────────────────────────┘
                    │
      ┌─────────────▼─────────────┐
      │       App.tsx & Login     │
      │  - Admin Email Auto-Bypass│
      │  - 1-Click Admin Access   │
      │  - Simplified Layman Copy │
      └───────────────────────────┘
```

### Key Integrations & State Updates
1. `StateContext`:
   - Adds `rolloverInvestmentPlan(investmentId: string)`: calculates 3% of invested capital, increments `walletBalance`, logs `ROLLOVER_BONUS` transaction, and extends plan tenure by 12 weeks.
   - Adds `recordDailyGamePlay(gameType: 'wheel' | 'chest', pointsEarned: number)`: updates user point balance and records completion for the current day.
   - Enhances `login(email, password)`: if `email` matches admin criteria (`admin@pminvest.org.ng`, `admin@treasurehomes.ng`, or `tomoriolakunle@gmail.com`), logs in automatically as `admin`.
2. `LiveActivityToast`:
   - Categorizes regional data into 5 geopolitical pools (Southwest, North, North Central, Southeast, Niger Delta), selecting matched names and real project names.
3. `InfoTooltip`:
   - Enhanced with viewport bounds checking and mobile modal fallback for small screens.
4. `UserDashboard` & `App`:
   - Updated copy across all sections to replace dense jargon with simple layman headings and info icon explanations.
   - Dedicated "Daily Property Task & Rewards" section with the Lucky Spin Wheel and Prize Chest.

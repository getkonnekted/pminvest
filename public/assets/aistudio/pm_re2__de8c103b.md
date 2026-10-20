# Implementation Plan: UI Polish, Deed Downloads, Property Alignment & Clean Branding

Confirmed plan incorporating the user's exact instructions and feedback.

---

## 1. Active Contract Screen Redesign & Removal of "Live Feed" Badge
**Target:** `src/components/UserDashboard.tsx`
- **User Instruction:** Completely remove the "Live Feed" / "Operations Live Feed" badge.
- **Card Overhaul:**
  - Remove all pulsating "Live Feed" and "Operations" badges from the Money in Buildings overview card, Active Investments header, and individual contract cards.
  - Redesign the Active Contract card into a clean, modern card with balanced padding, clear typography, and no awkward cramming.
  - Streamline the card media header: clean location badge (`🇦🇪 Dubai, UAE`) and contract status pill (`ACTIVE CONTRACT`).
  - Re-architect financial metrics into a clear 3-column / 2-row layout: **Invested Capital**, **Friday Cash Payout**, and **Total Return (24w)**.
  - Streamline tenure progress with an elegant week indicator (`Week X of 24 Paid`) and smooth progress bar.
  - Simplify the Auto-Renew +3% dividend toggle so it sits cleanly without visual clutter.
  - Provide an uncluttered action bar: primary **View UAE Title Deed**, and clear **Rollover (+3%)** and **Claim Friday Payout** buttons.

---

## 2. Completely Remove "Simulator" (No Replacement Word)
**Target:** `src/App.tsx`, `src/components/UserDashboard.tsx`, `src/components/AdminPanel.tsx`, `src/components/PropertySimulatorModal.tsx`
- **User Instruction:** Remove the word entirely. Do not replace with "Showcase" or any other word.
- **Actions:**
  - Remove the "Launch Simulator" / "Real Estate Simulator" buttons from navigation bars, hero CTAs, and dashboard headers.
  - Remove the simulator modal trigger and references from the customer experience.
  - Clean up administrative/maintenance utility labels to standard operations terminology (e.g., "Weekly Payout Processing", "Advance Day / Reset").
  - Ensure zero occurrences of the word "simulator" or "simulation" remain in user-facing views or tooltips.

---

## 3. Standardize Property Badges & 24-Week Cycle Badge
**Target:** `src/components/UserDashboard.tsx`, `src/types.ts`, `src/data/uaeProperties.ts`
- **User Instruction:** Badge should show the property name ("Marina Bay", etc.) and the 24-week cycle badge reduced in size so both fit cleanly.
- **Property Names:**
  - **Plan 1 (₦30,000)**: `Marina Bay`
  - **Plan 2 (₦60,000)**: `Creek Horizon`
  - **Plan 3 (₦120,000)**: `Downtown Sky`
  - **Plan 4 (₦250,000)**: `Sobha Sanctuary`
  - **Plan 5 (₦600,000)**: `Palm Azure`
  - **Plan 6 (₦1,500,000)**: `Emirates Tower`
- **Badge Layout:**
  - Top Left: Property Name badge (e.g. `Marina Bay`, `Creek Horizon`, etc.) in a sleek gold-tinted pill.
  - Top Right: Compact cycle badge (`24 Weeks` or `24 Wks`) with crisp micro-typography (`text-[10px]`).
  - Both badges sit comfortably side-by-side on mobile and desktop without line breaks or collision.

---

## 4. Title Deed Allotted Tier Based on Exact Investor Purchase
**Target:** `src/components/UaeDeedModal.tsx`, `src/components/UserDashboard.tsx`
- **User Instruction:** Name the Allotted Tier according to the investor's purchase with 100% consistency across the site:
  - **₦30,000 Purchase:** `Marina Bay Tier (₦30,000 Co-Owner)`
  - **₦60,000 Purchase:** `Creek Horizon Tier (₦60,000 Co-Owner)`
  - **₦120,000 Purchase:** `Downtown Sky Tier (₦120,000 Co-Owner)`
  - **₦250,000 Purchase:** `Sobha Sanctuary Tier (₦250,000 Co-Owner)`
  - **₦600,000 Purchase:** `Palm Azure Tier (₦600,000 Co-Owner)`
  - **₦1,500,000 Purchase:** `Emirates Tower Tier (₦1,500,000 Co-Owner)`
- Display this designated Allotted Tier in the official Title Deed modal and generated documents.

---

## 5. Reliable Title Deed Downloads (PDF Document & High-Res Image Certificate)
**Target:** `src/components/UaeDeedModal.tsx`, `package.json`
- **User Instruction:** Both PDF document and high-resolution image certificate download options.
- **Actions:**
  - Install `html2canvas` and `jspdf` for client-side rendering.
  - Provide direct, one-click action buttons:
    1. **Download PDF Document (`.pdf`)**: Generates and downloads the official PDF certificate.
    2. **Download Image Certificate (`.png`)**: Captures and downloads the high-resolution deed certificate image.
    3. **Print Document**: Direct browser print trigger with print stylesheets.
  - Visual loading spinner while generating documents to give immediate feedback.

---

## 6. Site-Wide Consistency Verification
- Verify that every property name, cost, return rate, and weekly payout matches across:
  - `src/types.ts` (`INVESTMENT_PLANS`)
  - `src/data/uaeProperties.ts` (`UAE_PROPERTIES`)
  - `UserDashboard.tsx` (Plan selection cards & active contract cards)
  - `AdminPanel.tsx` (Plan inspection & management)
  - `UaeDeedModal.tsx` (Official allotment certificate)
- Run `compile_applet` to confirm error-free compilation.

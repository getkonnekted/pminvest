# Marketer WhatsApp Multilingual Canvassing Engine

Empower marketers to canvass and convert prospects across diverse linguistic demographics with a dedicated **WhatsApp Multilingual Canvassing Modal**. Marketers can switch between **English, Nigerian Pidgin, Yoruba, Igbo, Hausa, and French** to instantly preview, customize, and launch pre-formatted, high-converting WhatsApp pitches for both general broadcasts (WhatsApp Status/Groups) and personal 1-on-1 investor downline follow-ups.

---

### User Review & Decisions

> [!IMPORTANT]
> The following product design choices were selected during Phase 1 clarification:
>
> - **Language Selection UX**: Dedicated **Language Modal Popup** appearing before launching WhatsApp, allowing marketers to choose the target language, preview the live message, and fine-tune text if desired.
> - **Supported Languages**: **English**, **Nigerian Pidgin**, **Yoruba**, **Igbo**, **Hausa**, and **French**.
> - **Integration Points**: Available in **both** general broadcast tools (One-Click Broadcast card and top quick action bar) and direct downline investor follow-ups (in the investor downline list).

---

## 1. Architecture & Component Blueprint

```
src/
├── data/
│   └── canvassingPitches.ts         # High-converting pitch templates in 6 languages
├── components/
│   ├── MultilingualPitchModal.tsx   # Interactive modal with language switcher, live preview & WhatsApp launcher
│   └── MarketerDashboard.tsx        # Integrated modal triggers for broadcast & downline follow-up
```

### High-Converting Linguistic Formats
Each language features tailored phrasing optimized for trust, clarity, and regional financial communication:

1. **English (Corporate / Global)**: Polished, professional overview of UAE luxury property-backed yield, 24-week tenure, and direct Friday bank payouts.
2. **Nigerian Pidgin (High Rapport / Relatable)**: Friendly, authentic, street-smart tone ("*How far my person! You don hear about PM Invest...*") perfect for WhatsApp status updates and informal chats.
3. **Yoruba (South-West / Diaspora)**: Respectful, community-centric phrasing emphasizing safe, verified land and luxury asset returns ("*Bawo ni o! Mo fe fi anfani nla kan han e nipa PM Invest...*").
4. **Igbo (Commerce / Investment Focused)**: Business-focused, asset-backed phrasing emphasizing capital security and weekly cash returns ("*Nnọọ nwanne m! Ọ dị m mkpa ikere gị ezigbo ohere ego na PM Invest...*").
5. **Hausa (Northern Commerce / Trust)**: Dignified, transparent commercial phrasing tailored for verified physical property syndication ("*Sannu abokina! Ina so in sanar da kai wata dama mai kyau ta PM Invest...*").
6. **French (Francophone West Africa & Diaspora)**: Professional French copy unlocking francophone investors in Côte d'Ivoire, Benin, Togo, Senegal, Cameroon, and European diaspora ("*Bonjour ! Avez-vous découvert PM Invest par Treasure Homes...*").

---

## 2. User Experience & Interactive Workflow

### A. General Broadcast Pathway (Status & Groups)
1. Marketer clicks **"One-Click WhatsApp Broadcast"** in the Marketing Assets section or **"WhatsApp Pitch"** in the top action bar.
2. The **Multilingual Canvassing Modal** opens with 6 language options:
   - Marketer taps a language card (e.g. *Nigerian Pidgin*).
   - The live message preview updates instantly with the marketer's personal referral code (`currentUser.referralCode`) and registration invite link.
   - Marketer can click **"Copy Pitch"** to post on their WhatsApp Status, or click **"Open in WhatsApp"** (`https://wa.me/?text=...`) to select contacts directly.

### B. Downline Investor Follow-up Pathway (1-on-1 Leads)
1. Marketer browses their downline table under the "Canvassing Network" tab.
2. Clicking **"WhatsApp Follow-up"** on any specific lead (funded investor or unfunded lead) opens the modal in **Personal Follow-up Mode**:
   - The lead's name (`${lead.name}`) and phone number are automatically loaded.
   - The pitch adapts into a personalized check-in message in the selected language (e.g., offering help with wallet top-up, deed verification, or Friday payout schedule).
   - Clicking **"Open in WhatsApp"** opens `https://wa.me/${lead.phone}?text=...` directly into the private chat with that investor.

---

## 3. Detailed Implementation Steps

### Step 1: Create `src/data/canvassingPitches.ts`
- Export strongly typed interfaces:
  ```typescript
  export type CanvassingLanguage = 'en' | 'pcm' | 'yo' | 'ig' | 'ha' | 'fr';

  export interface LanguageOption {
    id: CanvassingLanguage;
    name: string;
    nativeName: string;
    flag: string;
    badge: string;
  }
  ```
- Define template generators:
  - `getBroadcastPitch(lang: CanvassingLanguage, marketerName: string, referralCode: string, referralLink: string): string`
  - `getPersonalFollowupPitch(lang: CanvassingLanguage, leadName: string, marketerName: string, referralCode: string, referralLink: string, hasDeposited: boolean): string`

### Step 2: Build `src/components/MultilingualPitchModal.tsx`
- Modal dialog with clean backdrop blur and deep obsidian luxury styling (`bg-[#0c101c]`, golden hairline border `border-amber-500/30`).
- Responsive language selector grid with smooth active states.
- Editable textarea preview allowing marketers to add quick personal notes before sending.
- Action buttons:
  - **Copy Pitch to Clipboard** (with visual confirmation)
  - **Launch WhatsApp** (opens native WhatsApp client or web app)
  - **Close Modal** (`ESC` key and dismiss button)

### Step 3: Connect Modal into `src/components/MarketerDashboard.tsx`
- Replace static English pitch link handlers with modal trigger state:
  ```typescript
  const [pitchModalOpen, setPitchModalOpen] = useState(false);
  const [pitchModalTargetLead, setPitchModalTargetLead] = useState<User | null>(null);
  ```
- Wire:
  - Top action bar button `btn_marketer_whatsapp_pitch` -> Opens modal in broadcast mode.
  - "One-Click WhatsApp Broadcast" card button -> Opens modal in broadcast mode.
  - Downline table "WhatsApp Follow-up" button -> Opens modal in personal follow-up mode with the selected lead.

### Step 4: Verification & Testing
- Test all 6 languages for correct formatting and emoji encoding in WhatsApp URLs.
- Verify fallback behavior when a lead does not have a phone number formatted with country code.
- Run `npm run lint` (`lint_applet`) and `npm run build` (`compile_applet`) to guarantee clean compilation.

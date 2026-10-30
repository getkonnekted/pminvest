export type CanvassingLanguage = 'en' | 'pcm' | 'yo' | 'ig' | 'ha' | 'fr';

export interface LanguageOption {
  id: CanvassingLanguage;
  name: string;
  nativeName: string;
  flag: string;
  badge: string;
  tagline: string;
}

export const CANVASSING_LANGUAGES: LanguageOption[] = [
  {
    id: 'en',
    name: 'English',
    nativeName: 'English (Official)',
    flag: '🇬🇧',
    badge: 'Corporate',
    tagline: 'Professional & Institutional Investors'
  },
  {
    id: 'pcm',
    name: 'Nigerian Pidgin',
    nativeName: 'Naija Pidgin',
    flag: '🇳🇬',
    badge: 'Popular',
    tagline: 'High Rapport, WhatsApp Status & Friends'
  },
  {
    id: 'yo',
    name: 'Yoruba',
    nativeName: 'Èdè Yorùbá',
    flag: '🇳🇬',
    badge: 'Regional',
    tagline: 'South-West Merchants & Community Syndicates'
  },
  {
    id: 'ig',
    name: 'Igbo',
    nativeName: 'Asụsụ Igbo',
    flag: '🇳🇬',
    badge: 'Commerce',
    tagline: 'Eastern Commerce & High-Yield Asset Investors'
  },
  {
    id: 'ha',
    name: 'Hausa',
    nativeName: 'Harshen Hausa',
    flag: '🇳🇬',
    badge: 'Commercial',
    tagline: 'Northern Commerce, Agriculture & Asset Buyers'
  },
  {
    id: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    badge: 'Diaspora',
    tagline: 'Francophone West Africa & International Diaspora'
  }
];

export interface PitchConfig {
  language: CanvassingLanguage;
  marketerName: string;
  referralCode: string;
  referralLink: string;
  leadName?: string;
  isPersonalFollowup?: boolean;
}

/**
 * Returns a high-converting broadcast pitch tailored for WhatsApp Status, broadcast lists, and community groups.
 */
export const getBroadcastPitch = (
  lang: CanvassingLanguage,
  marketerName: string,
  referralCode: string,
  referralLink: string
): string => {
  switch (lang) {
    case 'pcm':
      return `How far my person! 🇦🇪🏢\n\nYou don hear about PM Invest by Treasure Homes? Real physical luxury properties for Dubai and UAE dem dey put money! Starting from only ₦30,000, your weekly Friday cash returns dey drop sharp sharp direct inside your Nigerian bank account.\n\nNo story story, capital safe with registered property deeds. Register today with my official link:\n👉 ${referralLink}\n(My Invite Code: *${referralCode}*)`;

    case 'yo':
      return `Báwo ni o ọ̀rẹ́ mi! 🇦🇪🏢\n\nṢé o ti gbọ́ nípa PM Invest láti ọwọ́ Treasure Homes? Wọ́n ń pèsè ànfààní ìdoko-owo tó dájú lórí àwọn ilé aládùn ní Dubai (UAE) láti ₦30,000 péré. Èrè owó rẹ yóò sì máa wọlé tààrà sínú àkántì báǹkì rẹ ní gbogbo ọjọ́ Jimọ (Friday)!\n\nForúkọsílẹ̀ lónìí pẹ̀lú ọ̀rọ̀ àmì ìkésí mi:\n👉 ${referralLink}\n(Àkóòdù mi: *${referralCode}*)`;

    case 'ig':
      return `Nnọọ nwanne m! 🇦🇪🏢\n\nỊ nụla maka PM Invest nke Treasure Homes? Ntinye ego doro anya na ezigbo ala na ụlọ ndị dị oke ọnụ ahịa na Dubai na UAE na-amalite na naanị ₦30,000. Nloghachi ego gị na-aba ozugbo n'ime akaụntụ ụlọ akụ gị kwa Fraịde ọ bụla!\n\nDebanye aha ugbu a site na iji njikọ m:\n👉 ${referralLink}\n(Koodu m: *${referralCode}*)`;

    case 'ha':
      return `Sannu abokina! 🇦🇪🏢\n\nKa ji labarin PM Invest daga Treasure Homes kuwa? Zuba jari na gaskiya a gidajen alatu a Dubai da UAE yana farawa daga ₦30,000 kacal. Ribar kudadenka tana shiga kai tsaye cikin asusun bankinka a kowace ranar Juma'a ba tare da bata lokaci ba!\n\nYi rijista yau ta hanyar amfani da hanyar haɗina:\n👉 ${referralLink}\n(Lambar gayyata: *${referralCode}*)`;

    case 'fr':
      return `Bonjour ! 🇦🇪🏢\n\nAvez-vous découvert PM Invest par Treasure Homes ? Des investissements immobiliers de luxe vérifiés aux Émirats Arabes Unis (Dubaï) accessibles dès ₦30,000, avec des rendements hebdomadaires versés directement sur votre compte bancaire chaque vendredi !\n\nRejoignez-moi dès aujourd'hui en vous inscrivant ici :\n👉 ${referralLink}\n(Code d'invitation : *${referralCode}*)`;

    case 'en':
    default:
      return `Hello! Have you seen PM Invest by Treasure Homes? 🇦🇪🏢\n\nThey offer verified UAE property-backed investments starting from just ₦30,000 with cash returns paid directly into your bank every Friday!\n\nUse my official invite code *${referralCode}* to register here:\n👉 ${referralLink}`;
  }
};

/**
 * Returns a personalized 1-on-1 WhatsApp follow-up message to help convert downline leads.
 */
export const getPersonalFollowupPitch = (
  lang: CanvassingLanguage,
  leadName: string,
  marketerName: string,
  referralCode: string,
  referralLink: string
): string => {
  const safeLead = leadName?.trim() || 'Investor';
  const safeMarketer = marketerName?.trim() || 'Your PM Invest Advisor';

  switch (lang) {
    case 'pcm':
      return `Hello ${safeLead}! 👋 Na ${safeMarketer} dey holla you from PM Invest.\n\nI notice say you don register under my link for PM Invest, but you never fund your wallet or pick property plan yet.\n\nOur UAE luxury property plans start from just ₦30,000 and Friday weekly cash payouts dey drop consistently. You need any help to top up your wallet or pick a plan today?\n\nCheck your dashboard here:\n👉 ${referralLink}`;

    case 'yo':
      return `Ẹ ǹlẹ́ o ${safeLead}! 👋 Èmi ${safeMarketer} ni mo ń kàn sí yín láti PM Invest.\n\nMo kí yín kú oríire fún bíbá wa forúkọsílẹ̀ lórí pẹpẹ PM Invest. Mo kíyèsí pé ẹ kò tí ì bẹ̀rẹ̀ sí fi owó sí àpò-owó (wallet) yín láti ra ilé ìdoko-owo ti Dubai.\n\nÈrè wa ń wọlé ní gbogbo ọjọ́ Jimọ lẹ́sẹ̀kẹsẹ̀. Ǹjẹ́ ẹ nílò ìrànlọ́wọ́ kankan láti parí rẹ̀ lónìí?\n\nṢí dashboard yín níbí:\n👉 ${referralLink}`;

    case 'ig':
      return `Ndewo ${safeLead}! 👋 Ọ bụ ${safeMarketer} na-akpọtụrụ gị site na PM Invest.\n\nAhụrụ m na ị debanyere aha na netwọk m na PM Invest, mana ị malitebeghị itinye ego na wallet gị iji nweta ngalaba ala na ụlọ Dubai gị.\n\nNloghachi ego na-ada n'ụlọ akụ kwa Fraịde ọ bụla. Enwere m ike inyere gị aka mezue ya taa?\n\nMepee dashboard gị ebe a:\n👉 ${referralLink}`;

    case 'ha':
      return `Barka dai ${safeLead}! 👋 Daga ${safeMarketer} ne nake gaishe ka daga PM Invest.\n\nNa lura cewa ka riga ka yi rijista a karkashin hanyar haɗina, amma har yanzu ba ka sa kudi a aljihunka (wallet) ba don mallakar kaso a gidajen alatu na Dubai.\n\nRibar tana sauka a kowace ranar Juma'a kai tsaye. Zan iya taimaka maka da wani abu yau?\n\nDuba shafinka anan:\n👉 ${referralLink}`;

    case 'fr':
      return `Bonjour ${safeLead} ! 👋 C'est ${safeMarketer} de PM Invest.\n\nJ'ai remarqué que vous vous êtes inscrit(e) sur la plateforme mais que vous n'avez pas encore activé votre portefeuille ni choisi votre premier bien immobilier aux Émirats.\n\nNos plans de co-investissement débutent dès ₦30,000 avec un versement hebdomadaire de cash chaque vendredi. Avez-vous besoin d'aide pour approvisionner votre compte ?\n\nAccédez à votre tableau de bord ici :\n👉 ${referralLink}`;

    case 'en':
    default:
      return `Hello ${safeLead}! 👋 This is ${safeMarketer} from PM Invest.\n\nI noticed you registered under my referral link, but you haven't yet funded your wallet or selected a property plan.\n\nOur UAE luxury property plans start at just ₦30,000, and weekly cash returns pay directly to your account every Friday. Can I assist you with funding your wallet or selecting a plan today?\n\nLog in to your dashboard here:\n👉 ${referralLink}`;
  }
};

/**
 * Helper to clean and format phone numbers for WhatsApp API links.
 */
export const cleanPhoneForWhatsApp = (phone?: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `234${cleaned.slice(1)}`;
  }
  return cleaned;
};

export interface PropertyPitchDetails {
  name: string;
  propertyName?: string;
  propertyLocation?: string;
  cost: number;
  weeklyPayout: number;
  occupancyRate?: string;
  deedTier?: string;
}

/**
 * Returns a high-converting announcement pitch for newly opened UAE luxury properties
 * targeted at unfunded registered leads to drive wallet activation before the Friday payout lock.
 */
export const getPropertyOpeningPitch = (
  lang: CanvassingLanguage,
  leadName: string,
  property: PropertyPitchDetails,
  customNote?: string,
  portalUrl: string = 'https://pminvest.org.ng'
): string => {
  const safeLead = leadName?.trim() || 'Valued Investor';
  const propName = property.propertyName || property.name;
  const propLoc = property.propertyLocation || 'Dubai, UAE';
  const costFormatted = property.cost.toLocaleString();
  const payoutFormatted = property.weeklyPayout.toLocaleString();
  const occupancy = property.occupancyRate || '98.2%';
  const extraNote = customNote?.trim() ? `\n\n📌 Note: ${customNote.trim()}` : '';

  switch (lang) {
    case 'pcm':
      return `Hello ${safeLead}! 👋 Special alert from PM Invest (Treasure Homes).

🏢 *Fresh Property Opening Just Drop for Dubai!*
✨ *${propName}* (${propLoc})
• Verified Tenant Occupancy: *${occupancy}*
• Minimum Co-Ownership Entry: *₦${costFormatted}*
• Your Guaranteed Friday Cash Yield: *₦${payoutFormatted} / week*

Only a few fractional co-ownership slots remain before the upcoming Friday 12:00 PM treasury distribution lock. As a registered member, your slot is prioritized!

Fund your wallet and secure your deed today:
👉 ${portalUrl}${extraNote}`;

    case 'yo':
      return `Ẹ ǹlẹ́ o ${safeLead}! 👋 Ìròyìn ayọ̀ pàtàkì láti PM Invest (Treasure Homes).

🏢 *Ilé Ìdoko-Owo Aládùn Tuntun Ti Ṣí Sílẹ̀ Ní Dubai!*
✨ *${propName}* (${propLoc})
• Àwọn Ayalégbé Tó Wà Níbẹ̀: *${occupancy}*
• Owó Ìpín Ìbẹ̀rẹ̀ (Entry): *₦${costFormatted}*
• Èrè Owó Oṣùṣẹ̀ Gbogbo Ọjọ́ Jimọ: *₦${payoutFormatted} lẹ́sẹ̀kẹsẹ̀*

A kíyèsí pé ẹ ti forúkọsílẹ̀ lórí pẹpẹ wa ṣùgbọ́n ẹ kò tí ì fi owó sí àpò-owó láti yan ilé kankan. Àwọn ààyè tó kù kéré púpọ̀ kí agogo méjìlá ọ̀sán ọjọ́ Jimọ tó lu!

Fi owó sí wallet yín kí ẹ sì gba deed yín lónìí:
👉 ${portalUrl}${extraNote}`;

    case 'ig':
      return `Ndewo ${safeLead}! 👋 Ozi pụrụ iche sitere na PM Invest (Treasure Homes).

🏢 *Ohere Ọhụrụ Maka Ala na Ụlọ Dị Oke Ọnụ Ahịa na Dubai!*
✨ *${propName}* (${propLoc})
• Ọnụego Ndị Bi n'Ụlọ: *${occupancy}*
• Ntinye Ego Ngalaba: *₦${costFormatted}*
• Ego Nloghachi Kwa Fraịde: *₦${payoutFormatted} ozugbo n'akpa ego gị*

Anyị hụrụ na ị debanyere aha na PM Invest mana ị kpatabeghị ego na wallet gị iji nweta ngalaba ala na ụlọ. Ohere ndị fọdụrụ pere mpe tupu nkesa ego nke Fraịde 12:00 PM!

Kpatuo ego na wallet gị ma nweta akwụkwọ nkwado gị taa:
👉 ${portalUrl}${extraNote}`;

    case 'ha':
      return `Barka dai ${safeLead}! 👋 Sanarwa ta musamman daga PM Invest (Treasure Homes).

🏢 *An Buɗe Sabon Ginin Alatu a Dubai!*
✨ *${propName}* (${propLoc})
• Yawan Masu Haya: *${occupancy}*
• Ƙarancin Kuɗin Mallaka: *₦${costFormatted}*
• Ribar Kuɗi a Kowace Ranar Juma'a: *₦${payoutFormatted} kai tsaye*

Mun lura cewa asusunka a shirye yake amma har yanzu ba ka saka kuɗi a aljihunka ba don mallakar kaso a wannan sabon ginin. Kaso kadan ne ya rage kafin ranar Juma'a da rana.

Sanya kuɗi a aljihunka yau don mallakar takardarka:
👉 ${portalUrl}${extraNote}`;

    case 'fr':
      return `Bonjour ${safeLead} ! 👋 Annonce exclusive de PM Invest par Treasure Homes.

🏢 *Nouvelle Opportunité Immobilière aux Émirats Arabes Unis*
✨ *${propName}* (${propLoc})
• Taux d'occupation vérifié : *${occupancy}*
• Ticket d'entrée co-propriété : *₦${costFormatted}*
• Dividendes locatifs hebdomadaires : *₦${payoutFormatted} chaque vendredi*

Votre compte PM Invest est enregistré mais vous n'avez pas encore finalisé votre premier investissement. Les parts de cette nouvelle propriété sont limitées avant la distribution de vendredi 12h00.

Activez votre portefeuille et sécurisez votre titre de propriété :
👉 ${portalUrl}${extraNote}`;

    case 'en':
    default:
      return `Hello ${safeLead}! 👋 Official update from PM Invest by Treasure Homes.

🏢 *New Luxury Property Opening in UAE*
✨ *${propName}* (${propLoc})
• Occupancy Rate: *${occupancy}* (Prime Tenanted Asset)
• Co-Ownership Fractional Entry: *₦${costFormatted}*
• Fixed Weekly Rental Distribution: *₦${payoutFormatted} every Friday*

We noticed your PM Invest investor account is registered but pending first property deed acquisition. Limited fractional allocations are open for this asset before the upcoming Friday 12:00 PM distribution window.

Activate your portfolio and secure your deed today:
👉 ${portalUrl}${extraNote}`;
  }
};


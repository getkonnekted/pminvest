/**
 * PM Invest - Sovereign UAE Luxury Property Wealth
 * Strict Nigerian & International Phone Sanitization and WhatsApp Tagging Utility
 */

export type WhatsAppStatus = 'verified' | 'pending' | 'not_on_whatsapp';

export interface PhoneValidationResult {
  isValid: boolean;
  rawInput: string;
  e164: string;           // E.164 standard, e.g. "+2348031234567"
  formatted: string;      // Human friendly display, e.g. "+234 803 123 4567"
  whatsappDigits: string; // Pure digits for wa.me/2348031234567
  countryCode: string;    // e.g. "+234"
  countryIso: string;     // e.g. "NG", "AE", "GB", "US", "INT"
  countryName: string;    // e.g. "Nigeria", "United Arab Emirates", etc.
  flag: string;           // e.g. "🇳🇬"
  error?: string;
}

export interface CountryMeta {
  iso: string;
  name: string;
  dialCode: string;
  flag: string;
  nationalSignificantDigits: number[]; // e.g. [10] for NG after country code
}

export const SUPPORTED_COUNTRIES: Record<string, CountryMeta> = {
  NG: { iso: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', nationalSignificantDigits: [10] },
  AE: { iso: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', nationalSignificantDigits: [9] },
  GB: { iso: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', nationalSignificantDigits: [10] },
  US: { iso: 'US', name: 'United States & Canada', dialCode: '+1', flag: '🇺🇸', nationalSignificantDigits: [10] },
  GH: { iso: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭', nationalSignificantDigits: [9] },
  ZA: { iso: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', nationalSignificantDigits: [9] },
  KE: { iso: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', nationalSignificantDigits: [9] },
  FR: { iso: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', nationalSignificantDigits: [9] },
};

/**
 * Sanitizes, auto-detects country code, strips leading zeroes, and validates length
 * for Nigerian and international WhatsApp phone numbers.
 */
export function sanitizeAndValidatePhone(input: string = ''): PhoneValidationResult {
  const trimmed = (input || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      rawInput: trimmed,
      e164: '',
      formatted: '',
      whatsappDigits: '',
      countryCode: '+234',
      countryIso: 'NG',
      countryName: 'Nigeria',
      flag: '🇳🇬',
      error: 'Please enter an active WhatsApp phone number.'
    };
  }

  // Normalize 00 to +
  let normalized = trimmed;
  if (normalized.startsWith('00')) {
    normalized = '+' + normalized.slice(2);
  }

  // Extract clean digits and check if has leading plus
  const hasLeadingPlus = normalized.startsWith('+');
  const digitsOnly = normalized.replace(/[^0-9]/g, '');

  if (digitsOnly.length === 0) {
    return {
      isValid: false,
      rawInput: trimmed,
      e164: '',
      formatted: '',
      whatsappDigits: '',
      countryCode: '+234',
      countryIso: 'NG',
      countryName: 'Nigeria',
      flag: '🇳🇬',
      error: 'Phone number contains no numeric digits.'
    };
  }

  // 1. Explicit International (+...) Prefix provided
  if (hasLeadingPlus) {
    // Check known countries
    // Nigeria (+234)
    if (digitsOnly.startsWith('234')) {
      let national = digitsOnly.slice(3);
      // Strip accidental leading zero: e.g. +23408031234567 -> 8031234567
      if (national.startsWith('0')) {
        national = national.slice(1);
      }
      if (national.length < 10) {
        return {
          isValid: false,
          rawInput: trimmed,
          e164: `+234${national}`,
          formatted: `+234 ${national}`,
          whatsappDigits: `234${national}`,
          countryCode: '+234',
          countryIso: 'NG',
          countryName: 'Nigeria',
          flag: '🇳🇬',
          error: `Nigerian number is too short (${national.length}/10 digits after +234). Example: +2348012345678`
        };
      }
      if (national.length > 10) {
        return {
          isValid: false,
          rawInput: trimmed,
          e164: `+234${national}`,
          formatted: `+234 ${national}`,
          whatsappDigits: `234${national}`,
          countryCode: '+234',
          countryIso: 'NG',
          countryName: 'Nigeria',
          flag: '🇳🇬',
          error: `Nigerian number has too many digits (${national.length}/10 digits). Standard format is +234 followed by 10 digits.`
        };
      }

      const formatted = `+234 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
      return {
        isValid: true,
        rawInput: trimmed,
        e164: `+234${national}`,
        formatted,
        whatsappDigits: `234${national}`,
        countryCode: '+234',
        countryIso: 'NG',
        countryName: 'Nigeria',
        flag: '🇳🇬'
      };
    }

    // UAE (+971)
    if (digitsOnly.startsWith('971')) {
      let national = digitsOnly.slice(3);
      if (national.startsWith('0')) national = national.slice(1);
      if (national.length !== 9) {
        return {
          isValid: false,
          rawInput: trimmed,
          e164: `+971${national}`,
          formatted: `+971 ${national}`,
          whatsappDigits: `971${national}`,
          countryCode: '+971',
          countryIso: 'AE',
          countryName: 'United Arab Emirates',
          flag: '🇦🇪',
          error: `UAE mobile number must have 9 digits after +971 (e.g. +971501234567).`
        };
      }
      return {
        isValid: true,
        rawInput: trimmed,
        e164: `+971${national}`,
        formatted: `+971 ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`,
        whatsappDigits: `971${national}`,
        countryCode: '+971',
        countryIso: 'AE',
        countryName: 'United Arab Emirates',
        flag: '🇦🇪'
      };
    }

    // UK (+44)
    if (digitsOnly.startsWith('44')) {
      let national = digitsOnly.slice(2);
      if (national.startsWith('0')) national = national.slice(1);
      if (national.length !== 10) {
        return {
          isValid: false,
          rawInput: trimmed,
          e164: `+44${national}`,
          formatted: `+44 ${national}`,
          whatsappDigits: `44${national}`,
          countryCode: '+44',
          countryIso: 'GB',
          countryName: 'United Kingdom',
          flag: '🇬🇧',
          error: `UK numbers must be 10 digits after +44 (e.g. +447911123456).`
        };
      }
      return {
        isValid: true,
        rawInput: trimmed,
        e164: `+44${national}`,
        formatted: `+44 ${national.slice(0, 4)} ${national.slice(4)}`,
        whatsappDigits: `44${national}`,
        countryCode: '+44',
        countryIso: 'GB',
        countryName: 'United Kingdom',
        flag: '🇬🇧'
      };
    }

    // US/Canada (+1)
    if (digitsOnly.startsWith('1')) {
      const national = digitsOnly.slice(1);
      if (national.length !== 10) {
        return {
          isValid: false,
          rawInput: trimmed,
          e164: `+1${national}`,
          formatted: `+1 ${national}`,
          whatsappDigits: `1${national}`,
          countryCode: '+1',
          countryIso: 'US',
          countryName: 'United States & Canada',
          flag: '🇺🇸',
          error: `US/Canada numbers must be 10 digits after +1.`
        };
      }
      return {
        isValid: true,
        rawInput: trimmed,
        e164: `+1${national}`,
        formatted: `+1 (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`,
        whatsappDigits: `1${national}`,
        countryCode: '+1',
        countryIso: 'US',
        countryName: 'United States & Canada',
        flag: '🇺🇸'
      };
    }

    // Generic International
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return {
        isValid: false,
        rawInput: trimmed,
        e164: `+${digitsOnly}`,
        formatted: `+${digitsOnly}`,
        whatsappDigits: digitsOnly,
        countryCode: '+',
        countryIso: 'INT',
        countryName: 'International',
        flag: '🌐',
        error: `International phone numbers must be between 8 and 15 digits.`
      };
    }

    return {
      isValid: true,
      rawInput: trimmed,
      e164: `+${digitsOnly}`,
      formatted: `+${digitsOnly}`,
      whatsappDigits: digitsOnly,
      countryCode: `+${digitsOnly.slice(0, 3)}`,
      countryIso: 'INT',
      countryName: 'International',
      flag: '🌐'
    };
  }

  // 2. No leading plus: Auto-detect country code from local format
  // Nigerian Standard: 11 digits starting with 0 (e.g. 08031234567, 070, 090, 081, 091)
  if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
    const national = digitsOnly.slice(1);
    const formatted = `+234 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
    return {
      isValid: true,
      rawInput: trimmed,
      e164: `+234${national}`,
      formatted,
      whatsappDigits: `234${national}`,
      countryCode: '+234',
      countryIso: 'NG',
      countryName: 'Nigeria',
      flag: '🇳🇬'
    };
  }

  // Nigerian: 10 digits without leading 0 (e.g. 8031234567, 703..., 903...)
  if (/^[789]\d{9}$/.test(digitsOnly)) {
    const national = digitsOnly;
    const formatted = `+234 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
    return {
      isValid: true,
      rawInput: trimmed,
      e164: `+234${national}`,
      formatted,
      whatsappDigits: `234${national}`,
      countryCode: '+234',
      countryIso: 'NG',
      countryName: 'Nigeria',
      flag: '🇳🇬'
    };
  }

  // Nigerian: Raw 234 prefix without + (e.g. 2348031234567 or 23408031234567)
  if (digitsOnly.startsWith('234')) {
    let national = digitsOnly.slice(3);
    if (national.startsWith('0')) national = national.slice(1);
    if (national.length === 10) {
      const formatted = `+234 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
      return {
        isValid: true,
        rawInput: trimmed,
        e164: `+234${national}`,
        formatted,
        whatsappDigits: `234${national}`,
        countryCode: '+234',
        countryIso: 'NG',
        countryName: 'Nigeria',
        flag: '🇳🇬'
      };
    }
  }

  // UAE: 10 digits starting with 05 (e.g. 0501234567)
  if (digitsOnly.startsWith('05') && digitsOnly.length === 10) {
    const national = digitsOnly.slice(1);
    return {
      isValid: true,
      rawInput: trimmed,
      e164: `+971${national}`,
      formatted: `+971 ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`,
      whatsappDigits: `971${national}`,
      countryCode: '+971',
      countryIso: 'AE',
      countryName: 'United Arab Emirates',
      flag: '🇦🇪'
    };
  }

  // UAE: Raw 971 prefix without +
  if (digitsOnly.startsWith('971')) {
    let national = digitsOnly.slice(3);
    if (national.startsWith('0')) national = national.slice(1);
    if (national.length === 9) {
      return {
        isValid: true,
        rawInput: trimmed,
        e164: `+971${national}`,
        formatted: `+971 ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`,
        whatsappDigits: `971${national}`,
        countryCode: '+971',
        countryIso: 'AE',
        countryName: 'United Arab Emirates',
        flag: '🇦🇪'
      };
    }
  }

  // Invalid length checks with helpful feedback
  if (digitsOnly.startsWith('0')) {
    return {
      isValid: false,
      rawInput: trimmed,
      e164: `+234${digitsOnly.slice(1)}`,
      formatted: trimmed,
      whatsappDigits: `234${digitsOnly.slice(1)}`,
      countryCode: '+234',
      countryIso: 'NG',
      countryName: 'Nigeria',
      flag: '🇳🇬',
      error: `Invalid Nigerian phone length (${digitsOnly.length} digits). A valid Nigerian number must be 11 digits (e.g. 08012345678).`
    };
  }

  if (digitsOnly.length < 8) {
    return {
      isValid: false,
      rawInput: trimmed,
      e164: '',
      formatted: trimmed,
      whatsappDigits: '',
      countryCode: '+234',
      countryIso: 'NG',
      countryName: 'Nigeria',
      flag: '🇳🇬',
      error: 'Phone number is too short. Please provide a full WhatsApp number.'
    };
  }

  if (digitsOnly.length > 15) {
    return {
      isValid: false,
      rawInput: trimmed,
      e164: '',
      formatted: trimmed,
      whatsappDigits: '',
      countryCode: '+234',
      countryIso: 'NG',
      countryName: 'Nigeria',
      flag: '🇳🇬',
      error: 'Phone number contains too many digits.'
    };
  }

  // Fallback: assume international without plus
  return {
    isValid: true,
    rawInput: trimmed,
    e164: `+${digitsOnly}`,
    formatted: `+${digitsOnly}`,
    whatsappDigits: digitsOnly,
    countryCode: '+',
    countryIso: 'INT',
    countryName: 'International',
    flag: '🌐'
  };
}

/**
 * Returns pure digits suitable for WhatsApp click-to-chat links (https://wa.me/{digits}).
 * Returns empty string if number is invalid or empty.
 */
export const cleanPhoneForWhatsApp = (phone?: string): string => {
  if (!phone) return '';
  const result = sanitizeAndValidatePhone(phone);
  return result.isValid ? result.whatsappDigits : '';
};

/**
 * Formats a phone number for user-facing display with country code.
 */
export const formatPhoneDisplay = (phone?: string): string => {
  if (!phone) return 'None recorded';
  const res = sanitizeAndValidatePhone(phone);
  return res.isValid ? res.formatted : phone;
};

/**
 * Helper metadata for WhatsApp Status Tagging
 */
export interface WhatsAppStatusBadgeInfo {
  status: WhatsAppStatus;
  label: string;
  icon: string;
  badgeClass: string;
  bgLight: string;
  textLight: string;
  dotColor: string;
  description: string;
}

export function getWhatsAppStatusInfo(status?: WhatsAppStatus): WhatsAppStatusBadgeInfo {
  switch (status) {
    case 'verified':
      return {
        status: 'verified',
        label: 'WhatsApp Verified',
        icon: '✓',
        badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
        bgLight: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        textLight: 'text-emerald-700',
        dotColor: 'bg-emerald-500',
        description: 'Confirmed active WhatsApp account receiving Friday payout receipts.'
      };
    case 'not_on_whatsapp':
      return {
        status: 'not_on_whatsapp',
        label: 'Not on WhatsApp',
        icon: '🚫',
        badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
        bgLight: 'bg-rose-50 text-rose-800 border-rose-300',
        textLight: 'text-rose-700',
        dotColor: 'bg-rose-500',
        description: 'Flagged invalid or unreachable on WhatsApp. Excluded from broadcast campaigns.'
      };
    case 'pending':
    default:
      return {
        status: 'pending',
        label: 'WhatsApp Pending',
        icon: '⏳',
        badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
        bgLight: 'bg-amber-50 text-amber-800 border-amber-300',
        textLight: 'text-amber-700',
        dotColor: 'bg-amber-500',
        description: 'Registered WhatsApp number awaiting campaign dispatch verification.'
      };
  }
}

import { getCurrentLanguage } from './i18n';

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'ja';

interface RegionalSettings {
  dateFormat: string;
  timeFormat: '12-hour' | '24-hour';
  currency: string;
  weekStartsOn: 'monday' | 'sunday';
  decimalSeparator: string;
  thousandsSeparator: string;
}

const REGIONAL_SETTINGS: Record<LanguageCode, RegionalSettings> = {
  en: {
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
    currency: 'USD',
    weekStartsOn: 'sunday',
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  es: {
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24-hour',
    currency: 'EUR',
    weekStartsOn: 'monday',
    decimalSeparator: ',',
    thousandsSeparator: '.',
  },
  fr: {
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24-hour',
    currency: 'EUR',
    weekStartsOn: 'monday',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
  },
  de: {
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24-hour',
    currency: 'EUR',
    weekStartsOn: 'monday',
    decimalSeparator: ',',
    thousandsSeparator: '.',
  },
  ja: {
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: '24-hour',
    currency: 'JPY',
    weekStartsOn: 'sunday',
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
};

/**
 * Get regional settings for current language
 */
export function getRegionalSettings(): RegionalSettings {
  const language = (getCurrentLanguage() as LanguageCode) || 'en';
  return REGIONAL_SETTINGS[language] || REGIONAL_SETTINGS.en;
}

/**
 * Format date according to regional settings
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const settings = getRegionalSettings();

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  switch (settings.dateFormat) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'DD.MM.YYYY':
      return `${day}.${month}.${year}`;
    case 'YYYY年MM月DD日':
      return `${year}年${month}月${day}日`;
    default:
      return `${month}/${day}/${year}`;
  }
}

/**
 * Format time according to regional settings
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const settings = getRegionalSettings();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');

  if (settings.timeFormat === '12-hour') {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    return `${hours}:${minutes} ${ampm}`;
  } else {
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }
}

/**
 * Format date and time together
 */
export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Format duration in hours and minutes
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
}

/**
 * Format currency according to regional settings
 */
export function formatCurrency(amount: number): string {
  const settings = getRegionalSettings();
  const language = (getCurrentLanguage() as LanguageCode) || 'en';

  const formatter = new Intl.NumberFormat(language, {
    style: 'currency',
    currency: settings.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * Format number according to regional settings
 */
export function formatNumber(num: number, decimals: number = 2): string {
  const settings = getRegionalSettings();
  const language = (getCurrentLanguage() as LanguageCode) || 'en';

  const formatter = new Intl.NumberFormat(language, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formatter.format(num);
}

/**
 * Get day of week name in current language
 */
export function getDayName(date: Date | string, short: boolean = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const language = (getCurrentLanguage() as LanguageCode) || 'en';

  const formatter = new Intl.DateTimeFormat(language, {
    weekday: short ? 'short' : 'long',
  });

  return formatter.format(d);
}

/**
 * Get month name in current language
 */
export function getMonthName(date: Date | string, short: boolean = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const language = (getCurrentLanguage() as LanguageCode) || 'en';

  const formatter = new Intl.DateTimeFormat(language, {
    month: short ? 'short' : 'long',
  });

  return formatter.format(d);
}

/**
 * Get week start day for current region
 */
export function getWeekStartDay(): 0 | 1 {
  const settings = getRegionalSettings();
  return settings.weekStartsOn === 'sunday' ? 0 : 1;
}

/**
 * Get regional currency symbol
 */
export function getCurrencySymbol(): string {
  const settings = getRegionalSettings();
  return settings.currency;
}

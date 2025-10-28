import { headers as getHeaders, cookies } from 'next/headers';
import enMessages from '@/messages/en.json';
import esMessages from '@/messages/es.json';

type Messages = typeof enMessages;
type Locale = 'en' | 'es';

const messages: Record<Locale, Messages> = {
  en: enMessages,
  es: esMessages,
};

export function getLocale(): Locale {
  try {
    const cookieStore = cookies();
    const localeCookie = cookieStore.get('NEXT_LOCALE');
    
    if (localeCookie && ['en', 'es'].includes(localeCookie.value)) {
      return localeCookie.value as Locale;
    }

    const headers = getHeaders();
    const headerLang = headers.get('accept-language') || '';
    
    if (headerLang.includes('es')) {
      return 'es';
    }
    
    return 'en';
  } catch (error) {
    return 'en';
  }
}

export function getMessages(locale?: Locale): Messages {
  const currentLocale = locale || getLocale();
  return messages[currentLocale] || messages.en;
}

// Helper function to get nested translation
export function getTranslation(messages: Messages, key: string): string {
  const keys = key.split('.');
  let value: any = messages;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return key;
  }
  
  return typeof value === 'string' ? value : key;
}

// Shorthand translation function
export function t(key: string, locale?: Locale): string {
  const msgs = getMessages(locale);
  return getTranslation(msgs, key);
}


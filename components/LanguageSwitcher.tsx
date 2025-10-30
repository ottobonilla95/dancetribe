"use client";

import { useTranslation } from './I18nProvider';
import { FaGlobe } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  // Avoid hydration mismatch by only showing locale text after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (newLocale: 'en' | 'es') => {
    if (newLocale !== locale) {
      // Close dropdown immediately
      if (dropdownRef.current) {
        dropdownRef.current.removeAttribute('open');
      }
      // Blur to close dropdown
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setLocale(newLocale);
    }
  };

  return (
    <details ref={dropdownRef} className="dropdown dropdown-end w-full">
      <summary className="btn btn-ghost btn-sm gap-2 w-full justify-start">
        <FaGlobe className="text-lg" />
        {mounted && (
          <>
            <span className="hidden sm:inline">{locale === 'en' ? 'English' : 'Español'}</span>
            <span className="sm:hidden">{locale.toUpperCase()}</span>
          </>
        )}
      </summary>
      <ul className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-full mt-2 z-50 border border-base-300">
        <li>
          <button
            onClick={() => handleChange('en')}
            className={locale === 'en' ? 'active' : ''}
          >
            🇺🇸 English
          </button>
        </li>
        <li>
          <button
            onClick={() => handleChange('es')}
            className={locale === 'es' ? 'active' : ''}
          >
            🇪🇸 Español
          </button>
        </li>
      </ul>
    </details>
  );
}


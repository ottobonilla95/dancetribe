"use client";

import { useTranslation } from './I18nProvider';
import { FaGlobe } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only showing locale text after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (newLocale: 'en' | 'es') => {
    if (newLocale !== locale) {
      setLocale(newLocale);
    }
  };

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-sm gap-2">
        <FaGlobe className="text-lg" />
        {mounted && (
          <>
            <span className="hidden sm:inline">{locale === 'en' ? 'English' : 'Español'}</span>
            <span className="sm:hidden">{locale.toUpperCase()}</span>
          </>
        )}
      </label>
      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 mt-2">
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
    </div>
  );
}


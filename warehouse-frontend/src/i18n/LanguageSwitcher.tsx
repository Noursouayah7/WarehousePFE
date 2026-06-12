'use client';

import { AppLanguage, useI18n } from './I18nProvider';

const OPTIONS: { value: AppLanguage; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'fr', label: 'FR' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div
      className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm"
      aria-label={t('app.language')}
      title={t('app.language')}
    >
      {OPTIONS.map((option) => {
        const isActive = language === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLanguage(option.value)}
            className={[
              'min-w-9 rounded-full px-2.5 py-1 text-xs font-semibold transition',
              isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
            ].join(' ')}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

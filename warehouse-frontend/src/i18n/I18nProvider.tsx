'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import enCommon from '@/resources/en/common';
import frCommon from '@/resources/fr/common';

export type AppLanguage = 'en' | 'fr';

type TranslationValue = string | TranslationTree;
type TranslationTree = { [key: string]: TranslationValue };

type I18nContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: string, fallback?: string) => string;
  tx: (text: string) => string;
};

const LANGUAGE_STORAGE_KEY = 'wms-language';
const resources: Record<AppLanguage, TranslationTree> = {
  en: enCommon,
  fr: frCommon,
};

const I18nContext = createContext<I18nContextValue | null>(null);

function isAppLanguage(value: string | null): value is AppLanguage {
  return value === 'en' || value === 'fr';
}

function readStoredLanguage(): AppLanguage {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (isAppLanguage(stored)) {
    return stored;
  }

  const browserLanguage = window.navigator.language.toLowerCase();
  return browserLanguage.startsWith('fr') ? 'fr' : 'en';
}

function resolveKey(dictionary: TranslationTree, key: string): string | null {
  const value = key.split('.').reduce<TranslationValue | undefined>((current, part) => {
    if (!current || typeof current === 'string') {
      return undefined;
    }

    return current[part];
  }, dictionary);

  return typeof value === 'string' ? value : null;
}

function resolvePhrase(dictionary: TranslationTree, text: string): string | null {
  const phrases = dictionary.phrases;
  if (!phrases || typeof phrases === 'string') {
    return null;
  }

  const value = phrases[text];
  return typeof value === 'string' ? value : null;
}

function getPhrases(language: AppLanguage): Record<string, string> {
  const phrases = resources[language].phrases;
  return phrases && typeof phrases !== 'string' ? phrases as Record<string, string> : {};
}

function buildPhraseMap(language: AppLanguage): Map<string, string> {
  const targetPhrases = getPhrases(language);
  const map = new Map<string, string>();

  for (const key of Object.keys(getPhrases('en'))) {
    const target = targetPhrases[key] ?? key;
    map.set(key, target);

    for (const sourceLanguage of Object.keys(resources) as AppLanguage[]) {
      const source = getPhrases(sourceLanguage)[key];
      if (source) {
        map.set(source, target);
      }
    }
  }

  return map;
}

function translateDocument(language: AppLanguage) {
  if (typeof document === 'undefined') {
    return;
  }

  const phraseMap = buildPhraseMap(language);
  const translate = (value: string) => {
    const trimmed = value.trim();
    const translated = phraseMap.get(trimmed);
    return translated ? value.replace(trimmed, translated) : value;
  };

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    if (node.parentElement?.closest('script, style, textarea')) {
      node = walker.nextNode();
      continue;
    }

    node.textContent = translate(node.textContent ?? '');
    node = walker.nextNode();
  }

  for (const element of document.querySelectorAll<HTMLElement>('[placeholder],[title],[aria-label]')) {
    for (const attribute of ['placeholder', 'title', 'aria-label']) {
      const value = element.getAttribute(attribute);
      if (value) {
        element.setAttribute(attribute, translate(value));
      }
    }
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    setLanguageState(readStoredLanguage());
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    window.requestAnimationFrame(() => translateDocument(language));

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(() => translateDocument(language));
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [language]);

  const value = useMemo<I18nContextValue>(() => {
    function setLanguage(nextLanguage: AppLanguage) {
      setLanguageState(nextLanguage);
    }

    function t(key: string, fallback?: string): string {
      return resolveKey(resources[language], key) ?? resolveKey(resources.en, key) ?? fallback ?? key;
    }

    function tx(text: string): string {
      return resolvePhrase(resources[language], text) ?? resolvePhrase(resources.en, text) ?? text;
    }

    return { language, setLanguage, t, tx };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }

  return context;
}

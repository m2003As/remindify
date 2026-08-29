import { useSyncExternalStore } from "react";
import { getSetting, setSetting } from "../db";
import { Choice } from "../types";
import { en, Translation } from "./en";
import { nb } from "./nb";
import { Language } from "./types";

export type { Language, GreetingContext, GreetingTemplate } from "./types";
export type { Translation } from "./en";

const TRANSLATIONS: Record<Language, Translation> = { en, nb };
const LANGUAGE_ICONS: Record<Language, string> = { en: "🇬🇧", nb: "🇳🇴" };

export const LANGUAGES = Object.keys(TRANSLATIONS) as Language[];

/** Each language labelled in its own language, so it is recognisable either way. */
export function languageChoices(): Choice<Language>[] {
    return LANGUAGES.map((value) => ({
        value,
        label: TRANSLATIONS[value].languageName,
        icon: LANGUAGE_ICONS[value],
    }));
}

const SETTING_KEY = "language";
const NORWEGIAN_TAGS = ["nb", "nn", "no"];

/** The phone's language, if we ship it. Falls back to English. */
function deviceLanguage(): Language {
    try {
        const tag = Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0].toLowerCase();
        if (NORWEGIAN_TAGS.includes(tag)) return "nb";
    } catch {
        // Intl is unavailable on some engines; English is a safe default.
    }
    return "en";
}

function storedLanguage(): Language | null {
    const stored = getSetting(SETTING_KEY);
    return stored && stored in TRANSLATIONS ? (stored as Language) : null;
}

let current: Language = storedLanguage() ?? deviceLanguage();
const listeners = new Set<() => void>();

export function getLanguage(): Language {
    return current;
}

/** The active dictionary, for code that runs outside React. */
export function strings(): Translation {
    return TRANSLATIONS[current];
}

export function setLanguage(language: Language) {
    if (language === current) return;
    current = language;
    setSetting(SETTING_KEY, language);
    listeners.forEach((notify) => notify());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/** Re-renders the calling component whenever the language changes. */
export function useTranslation(): Translation {
    return useSyncExternalStore(subscribe, strings, strings);
}

export function useLanguage(): Language {
    return useSyncExternalStore(subscribe, getLanguage, getLanguage);
}

import { Choice, Reminder, Relation } from "./types";
import { dayOf, daysUntil, isThisMonth, monthKey, monthOf, monthTitle } from "./date";
import { strings } from "./i18n";

export const DEFAULT_ICON = "⭐";
export const MONTHS_IN_YEAR = 12;

/* ---------- Types ---------- */

export const PRESET_TYPES = ["birthday", "anniversary", "custom"] as const;
export type PresetType = (typeof PRESET_TYPES)[number];

const TYPE_ICONS: Record<PresetType, string> = {
    birthday: "🎂",
    anniversary: "💍",
    custom: DEFAULT_ICON,
};

export const EMOJI_CHOICES = ["⭐", "🎓", "🏡", "✈️", "🐾", "💼", "❤️", "🎸", "🏆", "🕯️"];

export const isPreset = (type: string): type is PresetType => PRESET_TYPES.includes(type as PresetType);

type Typed = { type: string; icon?: string | null };

export function iconFor(r: Typed): string {
    return r.icon || (isPreset(r.type) ? TYPE_ICONS[r.type] : DEFAULT_ICON);
}

/** Translated preset label, or the user-defined type name itself. */
export function labelFor(r: Typed): string {
    return isPreset(r.type) ? strings().types[r.type] : r.type;
}

export function typeChoices(): Choice<string>[] {
    return PRESET_TYPES.map((value) => ({ value, label: strings().types[value], icon: TYPE_ICONS[value] }));
}

/* ---------- Relations ---------- */

const RELATION_ICONS: Record<Relation, string> = {
    partner: "❤️",
    family: "🏡",
    friend: "🤝",
    colleague: "💼",
    other: "•",
};

export const RELATION_VALUES = Object.keys(RELATION_ICONS) as Relation[];

/** Legacy Norwegian values, still found in old backup files. */
const RELATION_ALIASES: Record<string, Relation> = {
    familie: "family",
    venn: "friend",
    kollega: "colleague",
    annet: "other",
};

export function parseRelation(value: unknown): Relation | null {
    if (typeof value !== "string") return null;
    const relation = RELATION_ALIASES[value] ?? value;
    return RELATION_VALUES.includes(relation as Relation) ? (relation as Relation) : null;
}

export function relationChoices(): Choice<Relation>[] {
    return RELATION_VALUES.map((value) => ({
        value,
        label: strings().relations[value],
        icon: RELATION_ICONS[value],
    }));
}

export function relationLabel(value: unknown): string {
    const relation = parseRelation(value);
    return relation ? strings().relations[relation] : strings().detail.notSet;
}

/* ---------- Notification lead time ---------- */

const NOTIFY_VALUES = [0, 1, 3, 7];

export const notifyLabel = (days: number): string => strings().notify.label(days);

export function notifyChoices(): Choice<number>[] {
    return NOTIFY_VALUES.map((value) => ({ value, label: notifyLabel(value) }));
}

/* ---------- Sorting, filtering, grouping ---------- */

export type TypeFilter = "all" | "birthday" | "anniversary" | "other";

export function typeFilterChoices(): Choice<TypeFilter>[] {
    const { list, types } = strings();
    return [
        { value: "all", label: list.all },
        { value: "birthday", label: types.birthday, icon: TYPE_ICONS.birthday },
        { value: "anniversary", label: types.anniversary, icon: TYPE_ICONS.anniversary },
        { value: "other", label: list.other, icon: DEFAULT_ICON },
    ];
}

export function sortByNextOccurrence(reminders: Reminder[]): Reminder[] {
    return [...reminders].sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
}

export type ReminderFilter = { query?: string; type?: TypeFilter; thisMonthOnly?: boolean };

/** True when the filter would hide anything, i.e. it is worth showing a result count. */
export function isFiltering(f: ReminderFilter): boolean {
    return !!f.query?.trim() || (f.type ?? "all") !== "all" || !!f.thisMonthOnly;
}

export function filterReminders(reminders: Reminder[], f: ReminderFilter): Reminder[] {
    const query = f.query?.trim().toLowerCase() ?? "";
    const type = f.type ?? "all";

    return reminders.filter((r) => {
        if (query && ![r.name, labelFor(r), r.notes ?? ""].join(" ").toLowerCase().includes(query)) return false;
        if (type === "other" && (r.type === "birthday" || r.type === "anniversary")) return false;
        if (type !== "all" && type !== "other" && r.type !== type) return false;
        return !f.thisMonthOnly || isThisMonth(r.date);
    });
}

export type MonthSection = { key: string; title: string; items: Reminder[] };

/** Groups a list already sorted by next occurrence into consecutive month sections. */
export function groupByMonth(reminders: Reminder[]): MonthSection[] {
    const sections: MonthSection[] = [];

    for (const r of reminders) {
        const key = monthKey(r.date);
        if (sections.at(-1)?.key !== key) sections.push({ key, title: monthTitle(r.date), items: [] });
        sections.at(-1)!.items.push(r);
    }
    return sections;
}

/**
 * Buckets every reminder by the calendar month it falls in, ignoring the year.
 * Index 0 is January. Each bucket is sorted by day of month.
 */
export function groupByCalendarMonth(reminders: Reminder[]): Reminder[][] {
    const months: Reminder[][] = Array.from({ length: MONTHS_IN_YEAR }, () => []);
    for (const r of reminders) months[monthOf(r.date)].push(r);
    return months.map((items) => items.sort((a, b) => dayOf(a.date) - dayOf(b.date)));
}

export function chunk<T>(items: T[], size: number): T[][] {
    const rows: T[][] = [];
    for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
    return rows;
}

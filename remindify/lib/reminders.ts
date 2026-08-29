import { Choice, Reminder, Relation } from "./types";
import { daysUntil, isThisMonth, monthKey, monthTitle } from "./date";

export const DEFAULT_ICON = "⭐";

export const REMINDER_TYPES: Choice<string>[] = [
    { value: "birthday", label: "Birthday", icon: "🎂" },
    { value: "anniversary", label: "Anniversary", icon: "💍" },
    { value: "custom", label: "Special day", icon: DEFAULT_ICON },
];

const TYPE_BY_ID = new Map(REMINDER_TYPES.map((t) => [t.value, t]));

export const EMOJI_CHOICES = ["⭐", "🎓", "🏡", "✈️", "🐾", "💼", "❤️", "🎸", "🏆", "🕯️"];

type Typed = { type: string; icon?: string | null };

export function iconFor(r: Typed): string {
    return r.icon || TYPE_BY_ID.get(r.type)?.icon || DEFAULT_ICON;
}

/** Preset label, or the user-defined type name itself. */
export function labelFor(r: Typed): string {
    return TYPE_BY_ID.get(r.type)?.label ?? r.type;
}

/* ---------- Relations ---------- */

export const RELATIONS: Choice<Relation>[] = [
    { value: "partner", label: "Partner", icon: "❤️" },
    { value: "family", label: "Family", icon: "🏡" },
    { value: "friend", label: "Friend", icon: "🤝" },
    { value: "colleague", label: "Colleague", icon: "💼" },
    { value: "other", label: "Other", icon: "•" },
];

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
    return RELATIONS.some((r) => r.value === relation) ? (relation as Relation) : null;
}

/* ---------- Notification lead time ---------- */

export const NOTIFY_OPTIONS: Choice<number>[] = [
    { value: 0, label: "On the day" },
    { value: 1, label: "1 day before" },
    { value: 3, label: "3 days before" },
    { value: 7, label: "1 week before" },
];

export function notifyLabel(days: number): string {
    return NOTIFY_OPTIONS.find((o) => o.value === days)?.label ?? `${days} days before`;
}

/* ---------- Sorting, filtering, grouping ---------- */

export type TypeFilter = "all" | "birthday" | "anniversary" | "other";

export const TYPE_FILTERS: Choice<TypeFilter>[] = [
    { value: "all", label: "All" },
    { value: "birthday", label: "Birthday", icon: "🎂" },
    { value: "anniversary", label: "Anniversary", icon: "💍" },
    { value: "other", label: "Custom", icon: DEFAULT_ICON },
];

export function sortByNextOccurrence(reminders: Reminder[]): Reminder[] {
    return [...reminders].sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
}

export type ReminderFilter = { query?: string; type?: TypeFilter; thisMonthOnly?: boolean };

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

/** Groups a date-sorted list into consecutive month sections. */
export function groupByMonth(reminders: Reminder[]): MonthSection[] {
    const sections: MonthSection[] = [];

    for (const r of reminders) {
        const key = monthKey(r.date);
        if (sections.at(-1)?.key !== key) {
            sections.push({ key, title: monthTitle(r.date), items: [] });
        }
        sections.at(-1)!.items.push(r);
    }
    return sections;
}

export function chunk<T>(items: T[], size: number): T[][] {
    const rows: T[][] = [];
    for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
    return rows;
}

import { Reminder } from "./types";

export function daysUntilNext(dateStr: string): number {
    const original = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let next = new Date(today.getFullYear(), original.getMonth(), original.getDate());
    next.setHours(0, 0, 0, 0);

    if (next < today) {
        next = new Date(today.getFullYear() + 1, original.getMonth(), original.getDate());
    }

    const diffMs = next.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function ageTurning(dateStr: string): number {
    const original = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let next = new Date(today.getFullYear(), original.getMonth(), original.getDate());
    next.setHours(0, 0, 0, 0);

    if (next < today) next.setFullYear(today.getFullYear() + 1);

    return next.getFullYear() - original.getFullYear();
}

export function formatDateDisplay(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

export function sortByNextOccurrence(reminders: Reminder[]): Reminder[] {
    return [...reminders].sort((a, b) => daysUntilNext(a.date) - daysUntilNext(b.date));
}

export function daysLabel(days: number): string {
    if (days === 0) return "I dag! 🎉";
    if (days === 1) return "I morgen";
    return `Om ${days} dager`;
}

export function toLocalDateString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
/** Tolker "YYYY-MM-DD" som lokal dato, ikke UTC. */
export function parseLocalDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return new Date(dateStr);
    return new Date(y, m - 1, d);
}
export const typeIcon: Record<string, string> = {
    birthday: "🎂",
    anniversary: "💍",
    custom: "⭐",
};

export const typeLabel: Record<string, string> = {
    birthday: "Bursdag",
    anniversary: "Jubileum",
    custom: "Merkedag",
};

export const PRESET_TYPES = [
    { type: "birthday", label: "Bursdag", icon: "🎂" },
    { type: "anniversary", label: "Jubileum", icon: "💍" },
    { type: "custom", label: "Merkedag", icon: "⭐" },
];

export const EMOJI_CHOICES = ["⭐", "🎓", "🏡", "✈️", "🐾", "💼", "❤️", "🎸", "🏆", "🕯️"];

export function iconFor(r: { type: string; icon?: string | null }): string {
    return r.icon || typeIcon[r.type] || "⭐";
}

export function labelFor(r: { type: string }): string {
    return typeLabel[r.type] ?? r.type;
}

/** Måned/dag for varselet, med valgfritt antall dager i forkant. */
export function notifyMonthDay(dateStr: string, daysBefore: number) {
    const d = parseLocalDate(dateStr);
    const ref = new Date(2001, d.getMonth(), d.getDate()); // fast ikke-skuddår
    ref.setDate(ref.getDate() - daysBefore);
    return { month: ref.getMonth() + 1, day: ref.getDate() };
}

export const NOTIFY_OPTIONS = [
    { value: 0, label: "På dagen" },
    { value: 1, label: "1 dag før" },
    { value: 3, label: "3 dager før" },
    { value: 7, label: "1 uke før" },
];

export function notifyLabel(days: number): string {
    return NOTIFY_OPTIONS.find((o) => o.value === days)?.label ?? `${days} dager før`;
}

/** Neste gang datoen inntreffer, som Date. */
export function nextOccurrence(dateStr: string): Date {
    const original = parseLocalDate(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let next = new Date(today.getFullYear(), original.getMonth(), original.getDate());
    next.setHours(0, 0, 0, 0);

    if (next < today) {
        next = new Date(today.getFullYear() + 1, original.getMonth(), original.getDate());
    }
    return next;
}

export function monthKey(dateStr: string): string {
    const d = nextOccurrence(dateStr);
    return `${d.getFullYear()}-${d.getMonth()}`;
}

export function monthTitle(dateStr: string): string {
    const d = nextOccurrence(dateStr);
    const raw = d.toLocaleDateString("nb-NO", { month: "long" });
    const label = raw.charAt(0).toUpperCase() + raw.slice(1);
    return d.getFullYear() === new Date().getFullYear() ? label : `${label} ${d.getFullYear()}`;
}

export function isThisMonth(dateStr: string): boolean {
    const d = nextOccurrence(dateStr);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

/** Søker i navn, type og notater. */
export function matchesQuery(r: Reminder, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const haystack = [r.name, labelFor(r), r.notes ?? ""].join(" ").toLowerCase();
    return haystack.includes(q);
}

export type TypeFilter = "all" | "birthday" | "anniversary" | "other";

export function matchesTypeFilter(r: Reminder, filter: TypeFilter): boolean {
    if (filter === "all") return true;
    if (filter === "other") return r.type !== "birthday" && r.type !== "anniversary";
    return r.type === filter;
}
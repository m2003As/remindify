const LOCALE = "en-GB";

/** Parses "YYYY-MM-DD" as a local date rather than UTC. */
export function parseLocalDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split("-").map(Number);
    return y && m && d ? new Date(y, m - 1, d) : new Date(dateStr);
}

export function toDateString(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

/** The next time this day-of-year comes around, today included. */
export function nextOccurrence(dateStr: string): Date {
    const original = parseLocalDate(dateStr);
    const today = startOfToday();
    const next = new Date(today.getFullYear(), original.getMonth(), original.getDate());
    if (next < today) next.setFullYear(today.getFullYear() + 1);
    return next;
}

export function daysUntil(dateStr: string): number {
    const ms = nextOccurrence(dateStr).getTime() - startOfToday().getTime();
    return Math.round(ms / 86_400_000);
}

/** The age reached on the next occurrence. */
export function ageTurning(dateStr: string): number {
    return nextOccurrence(dateStr).getFullYear() - parseLocalDate(dateStr).getFullYear();
}

export function formatDate(dateStr: string): string {
    return parseLocalDate(dateStr).toLocaleDateString(LOCALE, {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function daysLabel(days: number): string {
    if (days === 0) return "Today! 🎉";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
}

export function monthKey(dateStr: string): string {
    const d = nextOccurrence(dateStr);
    return `${d.getFullYear()}-${d.getMonth()}`;
}

export function monthTitle(dateStr: string): string {
    const d = nextOccurrence(dateStr);
    const month = d.toLocaleDateString(LOCALE, { month: "long" });
    return d.getFullYear() === new Date().getFullYear() ? month : `${month} ${d.getFullYear()}`;
}

export function isThisMonth(dateStr: string): boolean {
    const d = nextOccurrence(dateStr);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

/**
 * Month/day for a yearly notification, optionally moved a few days earlier.
 * Anchored to a non-leap year so 29 Feb never shifts the schedule.
 */
export function monthDayBefore(dateStr: string, daysBefore: number) {
    const d = parseLocalDate(dateStr);
    const ref = new Date(2001, d.getMonth(), d.getDate());
    ref.setDate(ref.getDate() - daysBefore);
    return { month: ref.getMonth() + 1, day: ref.getDate() };
}

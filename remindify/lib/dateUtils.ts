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
import { Reminder } from "./types";
import { ageTurning } from "./date";
import { iconFor, labelFor } from "./reminders";

export type NotificationText = { title: string; subtitle: string; body: string };

/** Stable per person per year: the same line all day, a new one next year. */
function pick<T>(options: T[], seed: string): T {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    return options[Math.abs(hash) % options.length];
}

const BODY = {
    dayOfBirthday: [
        "It's today. Don't be the one who forgets.",
        "The day is here — send something before breakfast is over.",
        "Today's the day. One tap and you're the hero.",
        "This is it. Two minutes and you've made someone happy.",
    ],
    dayOfGeneric: [
        "The day is today.",
        "It's today — worth a moment.",
        "Today is the day you meant to remember.",
    ],
    aheadBirthday: [
        "Still time to find something really good.",
        "Now, or in a panic on the day itself. Your call.",
        "Perfect moment to think about a gift.",
        "You have time. Use it while you've got it.",
    ],
    aheadGeneric: [
        "A little time to prepare something.",
        "Worth planning now.",
        "You're early — that's a good thing.",
    ],
};

const isMilestone = (age: number) => age > 0 && age % 10 === 0;

export function dayOfText(r: Reminder): NotificationText {
    const seed = `${r.id}-${new Date().getFullYear()}`;

    if (r.type === "birthday") {
        const age = ageTurning(r.date);
        return {
            title: `🎂 ${r.name} turns ${age} today`,
            subtitle: isMilestone(age) ? "Milestone!" : "Birthday",
            body: pick(BODY.dayOfBirthday, seed),
        };
    }

    return {
        title: `${iconFor(r)} ${r.name} — today`,
        subtitle: labelFor(r),
        body: pick(BODY.dayOfGeneric, seed),
    };
}

export function aheadText(r: Reminder, days: number): NotificationText {
    const seed = `${r.id}-pre-${new Date().getFullYear()}`;
    const when = days === 1 ? "tomorrow" : `in ${days} days`;

    if (r.type === "birthday") {
        const age = ageTurning(r.date);
        return {
            title: `🎂 ${r.name} turns ${age} ${when}`,
            subtitle: isMilestone(age) ? `Milestone ${when}` : "Birthday coming up",
            body: pick(BODY.aheadBirthday, seed),
        };
    }

    return {
        title: `${iconFor(r)} ${r.name} — ${when}`,
        subtitle: labelFor(r),
        body: pick(BODY.aheadGeneric, seed),
    };
}

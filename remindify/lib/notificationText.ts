import { Reminder } from "./types";
import { ageTurning } from "./date";
import { strings } from "./i18n";
import { iconFor, labelFor } from "./reminders";

export type NotificationText = { title: string; subtitle: string; body: string };

/** Stable per person per year: the same line all day, a new one next year. */
function pick<T>(options: T[], seed: string): T {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    return options[Math.abs(hash) % options.length];
}

const isMilestone = (age: number) => age > 0 && age % 10 === 0;

export function dayOfText(r: Reminder): NotificationText {
    const { notificationTitles: title, notificationBodies: body } = strings();
    const seed = `${r.id}-${new Date().getFullYear()}`;

    if (r.type === "birthday") {
        const age = ageTurning(r.date);
        return {
            title: title.birthdayToday(r.name, age),
            subtitle: isMilestone(age) ? title.milestone : title.birthday,
            body: pick(body.dayOfBirthday, seed),
        };
    }

    return {
        title: title.genericToday(iconFor(r), r.name),
        subtitle: labelFor(r),
        body: pick(body.dayOfGeneric, seed),
    };
}

export function aheadText(r: Reminder, days: number): NotificationText {
    const { notificationTitles: title, notificationBodies: body } = strings();
    const seed = `${r.id}-pre-${new Date().getFullYear()}`;
    const when = days === 1 ? title.tomorrow : title.inDays(days);

    if (r.type === "birthday") {
        const age = ageTurning(r.date);
        return {
            title: title.birthdayAhead(r.name, age, when),
            subtitle: isMilestone(age) ? title.milestoneAhead(when) : title.birthdayComingUp,
            body: pick(body.aheadBirthday, seed),
        };
    }

    return {
        title: title.genericAhead(iconFor(r), r.name, when),
        subtitle: labelFor(r),
        body: pick(body.aheadGeneric, seed),
    };
}

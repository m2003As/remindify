import { Linking, Platform, Share } from "react-native";
import { Reminder } from "./types";
import { ageTurning } from "./date";
import { strings } from "./i18n";
import { GreetingContext, GreetingTemplate } from "./i18n/types";
import { iconFor, labelFor, parseRelation } from "./reminders";

export const SUGGESTIONS_PER_PAGE = 3;

const isMilestone = (age: number) => age > 0 && age % 10 === 0;

function templatesFor(r: Reminder): GreetingTemplate[] {
    const { greetings } = strings();
    const relation = parseRelation(r.relation) ?? "other";

    if (r.type === "birthday") {
        const base = greetings.birthday[relation];
        return isMilestone(ageTurning(r.date)) ? [...greetings.milestone, ...base] : base;
    }
    if (r.type === "anniversary") return greetings.anniversary[relation];
    return greetings.custom;
}

/**
 * Up to `count` suggestions in the active language. `offset` rotates through
 * the pool so a "show me others" button can page forward without running out.
 */
export function buildGreetings(r: Reminder, offset = 0, count = SUGGESTIONS_PER_PAGE): string[] {
    const pool = templatesFor(r);
    if (pool.length === 0) return [];

    const context: GreetingContext = {
        name: r.name,
        age: r.type === "birthday" ? ageTurning(r.date) : 0,
        label: labelFor(r),
        icon: iconFor(r),
    };

    const start = ((offset % pool.length) + pool.length) % pool.length;
    return [...pool.slice(start), ...pool.slice(0, start)].slice(0, count).map((t) => t(context));
}

export function greetingCount(r: Reminder): number {
    return templatesFor(r).length;
}

/** Opens the SMS composer prefilled, falling back to the share sheet. */
export async function sendGreeting(text: string) {
    const separator = Platform.OS === "ios" ? "&" : "?";
    const url = `sms:${separator}body=${encodeURIComponent(text)}`;

    if (await Linking.canOpenURL(url).catch(() => false)) {
        await Linking.openURL(url);
    } else {
        await Share.share({ message: text });
    }
}

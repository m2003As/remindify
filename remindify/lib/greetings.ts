import { Linking, Platform, Share } from "react-native";
import { Reminder, Relation } from "./types";
import { ageTurning } from "./date";
import { iconFor, labelFor, parseRelation } from "./reminders";

/* ---------- Templates ---------- */

type Context = { name: string; age: number; label: string; icon: string };
type Template = (c: Context) => string;
type ByRelation = Record<Relation, Template[]>;

/** "21st", "22nd", "13th" … */
function ordinal(n: number): string {
    const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
    return `${n}${suffix}`;
}

const BIRTHDAY: ByRelation = {
    partner: [
        (c) => `Happy birthday, ${c.name} ❤️ I love you so much.`,
        () => `Happy birthday! Hope your day is as lovely as you are.`,
        (c) => `Happy ${ordinal(c.age)}, my love. Can't wait to celebrate you. 🎂`,
        () => `Happy birthday ❤️ You make every day better — today it's your turn.`,
    ],
    family: [
        (c) => `Happy birthday, ${c.name}! 🎂 Hope you have a wonderful day.`,
        (c) => `Happy ${ordinal(c.age)} birthday! Thinking of you today. ❤️`,
        (c) => `Happy birthday, ${c.name}! Hope you get properly spoiled.`,
        () => `Many happy returns! 🎉 Big hug from me.`,
    ],
    friend: [
        (c) => `Happy birthday, ${c.name}! 🎉 Hope you celebrate properly.`,
        (c) => `${c.age} today! 🎂 That calls for cake.`,
        () => `Happy birthday! We need to celebrate soon. 🍻`,
        (c) => `Happy birthday, old timer! 😄 You wear ${c.age} well.`,
    ],
    colleague: [
        (c) => `Happy birthday, ${c.name}! Hope you have a great celebration. 🎂`,
        () => `Many happy returns! Have a really good day.`,
        (c) => `Happy birthday, ${c.name}! 🎉`,
    ],
    other: [
        (c) => `Happy birthday, ${c.name}! 🎂`,
        (c) => `Happy ${ordinal(c.age)} birthday! 🎉`,
        () => `Many happy returns!`,
    ],
};

const MILESTONE: Template[] = [
    (c) => `Happy ${ordinal(c.age)}, ${c.name}! 🎉 A round number deserves something extra.`,
    (c) => `${c.age}! 🎂 Congratulations, ${c.name} — big day today.`,
];

const ANNIVERSARY: ByRelation = {
    partner: [
        () => `Happy anniversary ❤️ Thank you for everything.`,
        (c) => `Today is our day. Love you, ${c.name}. 💍`,
    ],
    family: [
        () => `Happy anniversary! 💍 Hope you celebrate in style.`,
        (c) => `Congratulations on the day, ${c.name}! Lovely to think about.`,
    ],
    friend: [
        () => `Happy anniversary! 💍 Cheers to you both.`,
        (c) => `Congratulations, ${c.name}! A good day to mark.`,
    ],
    colleague: [
        (c) => `Happy anniversary, ${c.name}! 💍`,
        () => `Congratulations on the day!`,
    ],
    other: [
        () => `Happy anniversary! 💍`,
        (c) => `Congratulations on the day, ${c.name}!`,
    ],
};

const CUSTOM: Template[] = [
    (c) => `Good luck with ${c.label.toLowerCase()}, ${c.name}! ${c.icon}`,
    (c) => `Thinking of you today, ${c.name}. ${c.icon}`,
    (c) => `${c.label} today — hope it goes well, ${c.name}!`,
    (c) => `Big day today, ${c.name}. Good luck! ${c.icon}`,
];

const isMilestone = (age: number) => age > 0 && age % 10 === 0;

function templatesFor(r: Reminder): Template[] {
    const relation = parseRelation(r.relation) ?? "other";

    if (r.type === "birthday") {
        const base = BIRTHDAY[relation];
        return isMilestone(ageTurning(r.date)) ? [...MILESTONE, ...base] : base;
    }
    if (r.type === "anniversary") return ANNIVERSARY[relation];
    return CUSTOM;
}

export const SUGGESTIONS_PER_PAGE = 3;

/**
 * Up to `count` suggestions. `offset` rotates through the pool so a
 * "show me others" button can page forward without running out.
 */
export function buildGreetings(r: Reminder, offset = 0, count = SUGGESTIONS_PER_PAGE): string[] {
    const pool = templatesFor(r);
    if (pool.length === 0) return [];

    const context: Context = {
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

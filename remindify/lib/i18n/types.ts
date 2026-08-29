import { Relation } from "../types";

export type Language = "en" | "nb";

export type GreetingContext = { name: string; age: number; label: string; icon: string };
export type GreetingTemplate = (c: GreetingContext) => string;
export type GreetingsByRelation = Record<Relation, GreetingTemplate[]>;

export type Greetings = {
    birthday: GreetingsByRelation;
    /** Extra lines used on round birthdays, shown before the regular ones. */
    milestone: GreetingTemplate[];
    anniversary: GreetingsByRelation;
    custom: GreetingTemplate[];
};

/** Notification bodies, picked from at random but stable per person per year. */
export type NotificationBodies = {
    dayOfBirthday: string[];
    dayOfGeneric: string[];
    aheadBirthday: string[];
    aheadGeneric: string[];
};

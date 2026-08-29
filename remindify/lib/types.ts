export type Relation = "partner" | "family" | "friend" | "colleague" | "other";

/** A date the user wants to be reminded about. */
export type Reminder = {
    id: string;
    name: string;
    /** A preset id ("birthday" | "anniversary" | "custom") or a user-defined label. */
    type: string;
    /** Overrides the preset icon. Only set for user-defined types. */
    icon?: string | null;
    relation?: Relation | null;
    /** "YYYY-MM-DD", interpreted in local time. */
    date: string;
    notifyDaysBefore: number;
    photoUri?: string | null;
    notes?: string | null;
};

/** One selectable option in a chip row. */
export type Choice<T> = { value: T; label: string; icon?: string };

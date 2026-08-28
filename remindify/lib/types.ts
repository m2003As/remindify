export type ReminderType = "birthday" | "anniversary" | "custom";

export type Reminder = {
    id: string;
    name: string;
    type: ReminderType;
    date: string;          // full ISO-dato, f.eks. "1995-06-14"
    notifyDaysBefore: number;
    photoUri?: string | null;
    notes?: string | null;
};
export type ReminderType = string; // beholdt så gamle importer virker

export type Reminder = {
    id: string;
    name: string;
    type: string;          // "birthday", "anniversary" eller egendefinert tekst
    icon?: string | null;  // emoji, kun for egendefinerte typer
    date: string;
    notifyDaysBefore: number;
    photoUri?: string | null;
    notes?: string | null;
};
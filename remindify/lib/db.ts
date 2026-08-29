import * as SQLite from "expo-sqlite";
import { Reminder } from "./types";

// The file name predates the riMind rename; keeping it preserves existing installs.
const db = SQLite.openDatabaseSync("remindify.db");

const COLUMNS = ["id", "name", "type", "icon", "relation", "date", "notifyDaysBefore", "photoUri", "notes"];
const PLACEHOLDERS = COLUMNS.map(() => "?").join(", ");

/** Ordered schema steps. A step's index in this array is the user_version it produces. */
const MIGRATIONS: string[][] = [
    ["ALTER TABLE reminders ADD COLUMN icon TEXT;"],
    ["ALTER TABLE reminders ADD COLUMN relation TEXT;"],
    [
        // Relation values used to be Norwegian.
        "UPDATE reminders SET relation = 'family' WHERE relation = 'familie';",
        "UPDATE reminders SET relation = 'friend' WHERE relation = 'venn';",
        "UPDATE reminders SET relation = 'colleague' WHERE relation = 'kollega';",
        "UPDATE reminders SET relation = 'other' WHERE relation = 'annet';",
    ],
    ["CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);"],
];

function migrate() {
    db.execSync(`
        CREATE TABLE IF NOT EXISTS reminders (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            date TEXT NOT NULL,
            notifyDaysBefore INTEGER NOT NULL DEFAULT 0,
            photoUri TEXT,
            notes TEXT
        );
    `);

    const version = db.getFirstSync<{ user_version: number }>("PRAGMA user_version;")?.user_version ?? 0;

    MIGRATIONS.slice(version).forEach((statements, i) => {
        statements.forEach((sql) => db.execSync(sql));
        db.execSync(`PRAGMA user_version = ${version + i + 1};`);
    });
}

// Runs once, when this module is first imported — before any screen can query.
migrate();

/* ---------- Reminders ---------- */

function values(r: Reminder) {
    return [
        r.id, r.name, r.type, r.icon ?? null, r.relation ?? null,
        r.date, r.notifyDaysBefore, r.photoUri ?? null, r.notes ?? null,
    ];
}

export function getReminders(): Reminder[] {
    return db.getAllSync<Reminder>("SELECT * FROM reminders ORDER BY date ASC;");
}

export function getReminderById(id: string): Reminder | null {
    return db.getFirstSync<Reminder>("SELECT * FROM reminders WHERE id = ?;", [id]) ?? null;
}

export function addReminder(r: Reminder) {
    db.runSync(`INSERT INTO reminders (${COLUMNS.join(", ")}) VALUES (${PLACEHOLDERS});`, values(r));
}

/** Insert, or overwrite an existing row with the same id. */
export function upsertReminder(r: Reminder) {
    db.runSync(`INSERT OR REPLACE INTO reminders (${COLUMNS.join(", ")}) VALUES (${PLACEHOLDERS});`, values(r));
}

export function updateReminder(r: Reminder) {
    const [id, ...rest] = values(r);
    const assignments = COLUMNS.slice(1).map((c) => `${c} = ?`).join(", ");
    db.runSync(`UPDATE reminders SET ${assignments} WHERE id = ?;`, [...rest, id]);
}

export function deleteReminder(id: string) {
    db.runSync("DELETE FROM reminders WHERE id = ?;", [id]);
}

/* ---------- Settings ---------- */

export function getSetting(key: string): string | null {
    return db.getFirstSync<{ value: string }>("SELECT value FROM settings WHERE key = ?;", [key])?.value ?? null;
}

export function setSetting(key: string, value: string) {
    db.runSync("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);", [key, value]);
}

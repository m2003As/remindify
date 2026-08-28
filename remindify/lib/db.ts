import * as SQLite from "expo-sqlite";
import { Reminder } from "./types";

const db = SQLite.openDatabaseSync("remindify.db");

export function initDb() {
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
}

export function getReminders(): Reminder[] {
    return db.getAllSync<Reminder>("SELECT * FROM reminders ORDER BY date ASC;");
}

export function getReminderById(id: string): Reminder | null {
    return db.getFirstSync<Reminder>("SELECT * FROM reminders WHERE id = ?;", [id]) ?? null;
}

export function addReminder(r: Reminder) {
    db.runSync(
        `INSERT INTO reminders (id, name, type, date, notifyDaysBefore, photoUri, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [r.id, r.name, r.type, r.date, r.notifyDaysBefore, r.photoUri ?? null, r.notes ?? null]
    );
}

export function updateReminder(r: Reminder) {
    db.runSync(
        `UPDATE reminders SET name=?, type=?, date=?, notifyDaysBefore=?, photoUri=?, notes=?
     WHERE id=?;`,
        [r.name, r.type, r.date, r.notifyDaysBefore, r.photoUri ?? null, r.notes ?? null, r.id]
    );
}

export function deleteReminder(id: string) {
    db.runSync("DELETE FROM reminders WHERE id = ?;", [id]);
}
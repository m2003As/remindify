import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { getReminders, upsertReminder } from "./db";
import { rescheduleAll } from "./notifications";
import { parseRelation } from "./reminders";
import { Reminder } from "./types";

const APP_NAME = "riMind";
const BACKUP_VERSION = 1;

export async function exportBackup() {
    const payload = {
        app: APP_NAME,
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        reminders: getReminders(),
    };

    const stamp = new Date().toISOString().split("T")[0];
    const path = `${FileSystem.cacheDirectory}${APP_NAME}-backup-${stamp}.json`;
    await FileSystem.writeAsStringAsync(path, JSON.stringify(payload, null, 2));

    if (!(await Sharing.isAvailableAsync())) throw new Error("Sharing is not available on this device.");
    await Sharing.shareAsync(path, { mimeType: "application/json", dialogTitle: "Save backup" });
}

/** Returns null for rows that are too incomplete to restore. */
function toReminder(raw: any): Reminder | null {
    if (!raw?.id || !raw?.name || !raw?.date) return null;

    return {
        id: String(raw.id),
        name: String(raw.name),
        type: String(raw.type ?? "custom"),
        icon: raw.icon ?? null,
        relation: parseRelation(raw.relation),
        date: String(raw.date),
        notifyDaysBefore: Number(raw.notifyDaysBefore) || 0,
        photoUri: raw.photoUri ?? null,
        notes: raw.notes ?? null,
    };
}

/** Returns the number of reminders restored. */
export async function importBackup(): Promise<number> {
    const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
    });
    if (result.canceled) return 0;

    const parsed = JSON.parse(await FileSystem.readAsStringAsync(result.assets[0].uri));
    if (!Array.isArray(parsed?.reminders)) {
        throw new Error(`That file does not look like a ${APP_NAME} backup.`);
    }

    const imported = parsed.reminders.map(toReminder).filter((r: Reminder | null): r is Reminder => r !== null);
    imported.forEach(upsertReminder);
    await rescheduleAll(imported);

    return imported.length;
}

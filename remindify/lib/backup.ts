import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { getReminders, upsertReminder } from "./db";
import { rescheduleAll } from "./notifications";
import { Reminder } from "./types";

export async function exportBackup() {
    const payload = {
        app: "riMind",
        version: 1,
        exportedAt: new Date().toISOString(),
        reminders: getReminders(),
    };

    const stamp = new Date().toISOString().split("T")[0];
    const path = `${FileSystem.cacheDirectory}riMind-backup-${stamp}.json`;
    await FileSystem.writeAsStringAsync(path, JSON.stringify(payload, null, 2));

    if (!(await Sharing.isAvailableAsync())) throw new Error("Deling er ikke tilgjengelig");
    await Sharing.shareAsync(path, { mimeType: "application/json", dialogTitle: "Lagre backup" });
}

export async function importBackup(): Promise<number> {
    const res = await DocumentPicker.getDocumentAsync({ type: "application/json", copyToCacheDirectory: true });
    if (res.canceled) return 0;

    const raw = await FileSystem.readAsStringAsync(res.assets[0].uri);
    const parsed = JSON.parse(raw);

    if (!parsed?.reminders || !Array.isArray(parsed.reminders)) {
        throw new Error("Filen ser ikke ut som en riMind-backup");
    }

    const imported: Reminder[] = [];
    for (const r of parsed.reminders) {
        if (!r?.id || !r?.name || !r?.date) continue;
        const clean: Reminder = {
            id: String(r.id),
            name: String(r.name),
            type: String(r.type ?? "custom"),
            icon: r.icon ?? null,
            date: String(r.date),
            notifyDaysBefore: Number(r.notifyDaysBefore) || 0,
            photoUri: r.photoUri ?? null,
            notes: r.notes ?? null,
        };
        upsertReminder(clean);
        imported.push(clean);
    }

    await rescheduleAll(imported);
    return imported.length;
}
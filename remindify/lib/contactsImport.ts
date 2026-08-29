import * as Contacts from "expo-contacts/legacy";
import * as FileSystem from "expo-file-system/legacy";
import { Reminder } from "./types";
import { getReminders } from "./db";

export type Candidate = {
    key: string;
    name: string;
    date: string;
    photoUri: string | null;
};

export async function findBirthdays(): Promise<Candidate[]> {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") throw new Error("Ingen tilgang til kontakter");

    const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.Birthday, Contacts.Fields.Image],
    });

    const existing = new Set(getReminders().map((r) => r.name.toLowerCase()));
    const out: Candidate[] = [];

    for (const c of data) {
        const b = c.birthday;
        if (!b || b.day == null || b.month == null) continue;

        const name = (c.name ?? "").trim();
        if (!name || existing.has(name.toLowerCase())) continue;

        // expo-contacts bruker 0-indeksert måned, som JS Date
        const year = b.year ?? 2000;
        const m = String(b.month + 1).padStart(2, "0");
        const d = String(b.day).padStart(2, "0");

        out.push({
            key: c.id ?? `${name}-${m}${d}`,
            name,
            date: `${year}-${m}-${d}`,
            photoUri: c.imageAvailable && c.image?.uri ? c.image.uri : null,
        });
    }

    return out.sort((a, b) => a.name.localeCompare(b.name, "nb"));
}

export async function candidateToReminder(c: Candidate, index: number): Promise<Reminder> {
    let photoUri: string | null = null;
    if (c.photoUri) {
        try {
            const dest = `${FileSystem.documentDirectory}contact-${Date.now()}-${index}.jpg`;
            await FileSystem.copyAsync({ from: c.photoUri, to: dest });
            photoUri = dest;
        } catch {
            photoUri = null;
        }
    }

    return {
        id: `${Date.now()}-${index}`,
        name: c.name,
        type: "birthday",
        icon: null,
        date: c.date,
        notifyDaysBefore: 3,
        photoUri,
        notes: null,
    };
}
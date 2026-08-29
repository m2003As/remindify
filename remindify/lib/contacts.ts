import * as Contacts from "expo-contacts/legacy";
import { Reminder } from "./types";
import { getReminders } from "./db";
import { savePhoto } from "./photos";

const DEFAULT_YEAR = 2000;
const DEFAULT_NOTIFY_DAYS_BEFORE = 3;

export type BirthdayCandidate = {
    key: string;
    name: string;
    date: string;
    photoUri: string | null;
};

/** Contacts with a birthday that is not already saved, sorted by name. */
export async function findBirthdays(): Promise<BirthdayCandidate[]> {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") throw new Error("No access to contacts.");

    const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.Birthday, Contacts.Fields.Image],
    });

    const existing = new Set(getReminders().map((r) => r.name.toLowerCase()));
    const pad = (n: number) => String(n).padStart(2, "0");
    const candidates: BirthdayCandidate[] = [];

    for (const contact of data) {
        const birthday = contact.birthday;
        if (!birthday || birthday.day == null || birthday.month == null) continue;

        const name = (contact.name ?? "").trim();
        if (!name || existing.has(name.toLowerCase())) continue;

        // expo-contacts reports a 0-indexed month, like JS Date.
        const month = pad(birthday.month + 1);
        const day = pad(birthday.day);

        candidates.push({
            key: contact.id ?? `${name}-${month}${day}`,
            name,
            date: `${birthday.year ?? DEFAULT_YEAR}-${month}-${day}`,
            photoUri: contact.imageAvailable && contact.image?.uri ? contact.image.uri : null,
        });
    }

    return candidates.sort((a, b) => a.name.localeCompare(b.name));
}

export async function candidateToReminder(c: BirthdayCandidate, index: number): Promise<Reminder> {
    return {
        id: `${Date.now()}-${index}`,
        name: c.name,
        type: "birthday",
        icon: null,
        relation: null,
        date: c.date,
        notifyDaysBefore: DEFAULT_NOTIFY_DAYS_BEFORE,
        photoUri: c.photoUri ? await savePhoto(c.photoUri, `contact-${index}`) : null,
        notes: null,
    };
}

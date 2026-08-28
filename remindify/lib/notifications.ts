import * as Notifications from "expo-notifications";
import { Reminder } from "./types";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function requestNotificationPermission() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
}

export async function scheduleYearlyReminder(reminder: Reminder) {
    const d = new Date(reminder.date);
    const month = d.getMonth() + 1; // Date er 0-indeksert
    const day = d.getDate();

    await Notifications.scheduleNotificationAsync({
        identifier: reminder.id,
        content: {
            title: `${reminder.name}`,
            body:
                reminder.type === "birthday"
                    ? "Bursdag nærmer seg! 🎂"
                    : reminder.type === "anniversary"
                        ? "Jubileum nærmer seg! 💍"
                        : "En spesiell dag nærmer seg! ⭐",
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            month,
            day,
            hour: 9,
            minute: 0,
            repeats: true,
        },
    });
}

export async function cancelReminderNotification(id: string) {
    await Notifications.cancelScheduledNotificationAsync(id);
}
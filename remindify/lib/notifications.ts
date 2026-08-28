import * as Notifications from "expo-notifications";
import { Reminder } from "./types";
import { parseLocalDate, iconFor, labelFor } from "./dateUtils";

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

function notificationBody(reminder: Reminder): string {
    if (reminder.type === "birthday") return "Bursdag nærmer seg! 🎂";
    if (reminder.type === "anniversary") return "Jubileum nærmer seg! 💍";
    if (reminder.type === "custom") return "En spesiell dag nærmer seg! ⭐";
    return `${labelFor(reminder)} nærmer seg! ${iconFor(reminder)}`;
}

export async function scheduleYearlyReminder(reminder: Reminder) {
    const d = parseLocalDate(reminder.date);
    const month = d.getMonth() + 1; // Date er 0-indeksert
    const day = d.getDate();

    await Notifications.scheduleNotificationAsync({
        identifier: reminder.id,
        content: {
            title: reminder.name,
            body: notificationBody(reminder),
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
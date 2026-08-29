import * as Notifications from "expo-notifications";
import { Reminder } from "./types";
import { notifyMonthDay, iconFor, labelFor } from "./dateUtils";

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

function dayOfBody(r: Reminder): string {
    if (r.type === "birthday") return "Har bursdag i dag! 🎂";
    if (r.type === "anniversary") return "Jubileum i dag! 💍";
    if (r.type === "custom") return "En spesiell dag i dag! ⭐";
    return `${labelFor(r)} i dag! ${iconFor(r)}`;
}

export async function scheduleForReminder(reminder: Reminder) {
    await cancelReminderNotification(reminder.id);

    const icon = iconFor(reminder);
    const dayOf = notifyMonthDay(reminder.date, 0);

    await Notifications.scheduleNotificationAsync({
        identifier: reminder.id,
        content: {
            title: `${icon} ${reminder.name}`,
            body: dayOfBody(reminder),
            data: { reminderId: reminder.id },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            month: dayOf.month, day: dayOf.day, hour: 9, minute: 0, repeats: true,
        },
    });

    if (reminder.notifyDaysBefore > 0) {
        const pre = notifyMonthDay(reminder.date, reminder.notifyDaysBefore);
        const n = reminder.notifyDaysBefore;
        await Notifications.scheduleNotificationAsync({
            identifier: `${reminder.id}-pre`,
            content: {
                title: `${icon} ${reminder.name}`,
                body: `${labelFor(reminder)} om ${n} ${n === 1 ? "dag" : "dager"} — tid til å ordne noe?`,
                data: { reminderId: reminder.id },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                month: pre.month, day: pre.day, hour: 18, minute: 0, repeats: true,
            },
        });
    }
}

export async function cancelReminderNotification(id: string) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    await Notifications.cancelScheduledNotificationAsync(`${id}-pre`).catch(() => {});
}

export async function rescheduleAll(reminders: Reminder[]) {
    for (const r of reminders) await scheduleForReminder(r);
}
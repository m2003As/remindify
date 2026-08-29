import * as Notifications from "expo-notifications";
import { Reminder } from "./types";
import { monthDayBefore } from "./date";
import { aheadText, dayOfText, NotificationText } from "./notificationText";

const CATEGORY = "reminder";
export const GREET_ACTION = "greet";

/** Notifications fire at 09:00 on the day, and at 18:00 for the heads-up. */
const DAY_OF_HOUR = 9;
const AHEAD_HOUR = 18;

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerCategories() {
    await Notifications.setNotificationCategoryAsync(CATEGORY, [
        {
            identifier: GREET_ACTION,
            buttonTitle: "💬 Send greeting",
            options: { opensAppToForeground: true },
        },
        {
            identifier: "snooze",
            buttonTitle: "Remind me tonight",
            options: { opensAppToForeground: false },
        },
    ]);
}

export async function requestNotificationPermission(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
}

const aheadId = (id: string) => `${id}-pre`;

function schedule(
    identifier: string,
    reminderId: string,
    text: NotificationText,
    when: { month: number; day: number; hour: number },
    timeSensitive = false,
) {
    return Notifications.scheduleNotificationAsync({
        identifier,
        content: {
            ...text,
            categoryIdentifier: CATEGORY,
            sound: true,
            data: { reminderId },
            ...(timeSensitive ? { interruptionLevel: "timeSensitive" as const } : {}),
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            month: when.month,
            day: when.day,
            hour: when.hour,
            minute: 0,
            repeats: true,
        },
    });
}

/** Replaces any notifications already scheduled for this reminder. */
export async function scheduleForReminder(reminder: Reminder) {
    await cancelReminderNotification(reminder.id);

    const dayOf = monthDayBefore(reminder.date, 0);
    await schedule(reminder.id, reminder.id, dayOfText(reminder), { ...dayOf, hour: DAY_OF_HOUR }, true);

    const daysBefore = reminder.notifyDaysBefore;
    if (daysBefore > 0) {
        const ahead = monthDayBefore(reminder.date, daysBefore);
        await schedule(aheadId(reminder.id), reminder.id, aheadText(reminder, daysBefore), {
            ...ahead,
            hour: AHEAD_HOUR,
        });
    }
}

export async function cancelReminderNotification(id: string) {
    for (const identifier of [id, aheadId(id)]) {
        await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
    }
}

export async function rescheduleAll(reminders: Reminder[]) {
    for (const reminder of reminders) await scheduleForReminder(reminder);
}

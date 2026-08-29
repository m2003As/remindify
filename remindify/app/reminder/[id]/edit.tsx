import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getReminderById, updateReminder } from "../../../lib/db";
import { useTranslation } from "../../../lib/i18n";
import { requestNotificationPermission, scheduleForReminder } from "../../../lib/notifications";
import ReminderForm from "../../../components/ReminderForm";

export default function EditReminder() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const t = useTranslation();

    const [reminder] = useState(() => (id ? getReminderById(id) : null));
    if (!reminder) return null;

    return (
        <ReminderForm
            initial={reminder}
            submitLabel={t.form.update}
            onSubmit={async (draft) => {
                const updated = { ...draft, id: reminder.id };
                updateReminder(updated);
                if (await requestNotificationPermission()) await scheduleForReminder(updated);
                router.back();
            }}
        />
    );
}

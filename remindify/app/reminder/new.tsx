import { useRouter } from "expo-router";
import { addReminder } from "../../lib/db";
import { useTranslation } from "../../lib/i18n";
import { requestNotificationPermission, scheduleForReminder } from "../../lib/notifications";
import ReminderForm from "../../components/ReminderForm";

export default function NewReminder() {
    const router = useRouter();
    const t = useTranslation();

    return (
        <ReminderForm
            submitLabel={t.form.create}
            onSubmit={async (draft) => {
                const reminder = { id: Date.now().toString(), ...draft };
                addReminder(reminder);
                if (await requestNotificationPermission()) await scheduleForReminder(reminder);
                router.back();
            }}
        />
    );
}

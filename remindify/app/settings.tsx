import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text } from "react-native";
import { useRouter } from "expo-router";
import { exportBackup, importBackup } from "../lib/backup";
import { getReminders } from "../lib/db";
import { Language, languageChoices, setLanguage, useLanguage, useTranslation } from "../lib/i18n";
import { registerCategories, rescheduleAll } from "../lib/notifications";
import { styles, theme } from "../lib/theme";
import { ChipRow, ListRow, SectionLabel } from "../components/ui";

export default function Settings() {
    const router = useRouter();
    const t = useTranslation();
    const language = useLanguage();
    const [busy, setBusy] = useState(false);

    /** Runs a backup action, showing any failure as an alert. */
    async function run(action: () => Promise<void>, failureTitle: string) {
        setBusy(true);
        try {
            await action();
        } catch (e: any) {
            Alert.alert(failureTitle, e.message);
        } finally {
            setBusy(false);
        }
    }

    /** Already-scheduled notifications carry their old text, so rebuild them. */
    async function changeLanguage(next: Language) {
        setLanguage(next);
        await registerCategories();
        await rescheduleAll(getReminders());
    }

    return (
        <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
            <SectionLabel>{t.settings.language}</SectionLabel>
            <ChipRow options={languageChoices()} value={language} onChange={changeLanguage} />
            <Text style={{ color: theme.textDim, fontSize: 12, marginTop: 8 }}>{t.settings.languageSub}</Text>

            <SectionLabel style={{ marginTop: 28 }}>{t.settings.contacts}</SectionLabel>
            <ListRow
                icon="👥"
                title={t.settings.importBirthdays}
                subtitle={t.settings.importBirthdaysSub}
                onPress={() => router.push("/reminder/import")}
            />

            <SectionLabel style={{ marginTop: 28 }}>{t.settings.backup}</SectionLabel>
            <ListRow
                icon="⬆️"
                title={t.settings.exportTitle}
                subtitle={t.settings.exportSub}
                onPress={() => run(exportBackup, t.settings.exportFailed)}
            />
            <ListRow
                icon="⬇️"
                title={t.settings.importTitle}
                subtitle={t.settings.importSub}
                onPress={() =>
                    run(async () => {
                        const count = await importBackup();
                        if (count > 0) Alert.alert(t.settings.importDoneTitle, t.settings.importDoneBody(count));
                    }, t.settings.importFailed)
                }
            />

            {busy && <ActivityIndicator color={theme.accent} style={{ marginTop: 20 }} />}

            <Text style={{ color: theme.textDim, fontSize: 12, marginTop: 28, lineHeight: 18 }}>
                {t.settings.photosNote}
            </Text>
        </ScrollView>
    );
}

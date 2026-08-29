import { useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { exportBackup, importBackup } from "../lib/backup";
import { styles, theme } from "../lib/theme";
import { ListRow, SectionLabel } from "../components/ui";

export default function Settings() {
    const router = useRouter();
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

    return (
        <View style={[styles.screen, { padding: 20 }]}>
            <SectionLabel>Contacts</SectionLabel>
            <ListRow
                icon="👥"
                title="Import birthdays"
                subtitle="Pull birthdays from your contact list"
                onPress={() => router.push("/reminder/import")}
            />

            <SectionLabel style={{ marginTop: 28 }}>Backup</SectionLabel>
            <ListRow
                icon="⬆️"
                title="Export backup"
                subtitle="Save all reminders as a JSON file"
                onPress={() => run(exportBackup, "Could not export")}
            />
            <ListRow
                icon="⬇️"
                title="Import backup"
                subtitle="Restore from a previous file"
                onPress={() =>
                    run(async () => {
                        const count = await importBackup();
                        if (count > 0) Alert.alert("Import complete", `${count} reminders restored.`);
                    }, "Could not import")
                }
            />

            {busy && <ActivityIndicator color={theme.accent} style={{ marginTop: 20 }} />}

            <Text style={{ color: theme.textDim, fontSize: 12, marginTop: 28, lineHeight: 18 }}>
                Photos are not included in the backup — they stay on this device.
            </Text>
        </View>
    );
}
